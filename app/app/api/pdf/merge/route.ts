// app/api/merge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { execFile } from "child_process";
import { promisify } from "util";
import { trackApiUsage, validateApiKey } from "@/lib/validate-key";
import { readdir, unlink, rmdir } from "fs/promises";
import { canPerformOperation, getOperationType, getUserId, processOperation } from "@/lib/operation-tracker";
const execFileAsync = promisify(execFile);
const UPLOAD_DIR = join(process.cwd(), "uploads");
const MERGE_DIR = join(process.cwd(), "public", "merges");

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(MERGE_DIR)) {
    await mkdir(MERGE_DIR, { recursive: true });
  }
}

// Merge PDFs using Pdfcpu with improved error handling
async function mergePdfsWithPdfcpu(
  inputPaths: string[],
  outputPath: string
): Promise<boolean> {
  try {
    console.log("Merging PDFs with pdfcpu...");

    // Validate input paths
    if (inputPaths.length === 0) {
      throw new Error("No input PDFs provided");
    }

    // For large merges, use a two-stage approach to minimize memory usage
    if (inputPaths.length > 10) {
      console.log(
        `Large merge with ${inputPaths.length} files, using staged approach...`
      );

      // Create temporary directory for intermediate merges
      const tempDir = join(UPLOAD_DIR, `merge-temp-${uuidv4()}`);
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }

      try {
        // Split into batches of 5 files
        const batchSize = 5;
        const tempFiles = [];

        // Process each batch
        for (let i = 0; i < inputPaths.length; i += batchSize) {
          const batchFiles = inputPaths.slice(i, i + batchSize);
          const batchOutputPath = join(tempDir, `batch-${i}.pdf`);

          // Merge this batch using pdfcpu
          // Note: pdfcpu merge takes output first, then input files
          console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
              inputPaths.length / batchSize
            )}...`
          );

          // Using execFile to avoid command injection risks with spaces in filenames
          await execFileAsync("pdfcpu", [
            "merge",
            batchOutputPath,
            ...batchFiles,
          ]);

          tempFiles.push(batchOutputPath);
        }

        // Final merge of all batches
        console.log(`Merging ${tempFiles.length} batches to final output...`);
        await execFileAsync("pdfcpu", ["merge", outputPath, ...tempFiles]);

        // Verify the output was created
        return existsSync(outputPath);
      } finally {
        // Clean up temp files
        for (const tempFile of await readdir(tempDir)) {
          try {
            await unlink(join(tempDir, tempFile));
          } catch (error) {
            console.warn(`Failed to clean up temp file: ${tempFile}`, error);
          }
        }

        try {
          await rmdir(tempDir);
        } catch (error) {
          console.warn(`Failed to clean up temp directory: ${tempDir}`, error);
        }
      }
    } else {
      // For smaller merges, use single command
      // pdfcpu handles spaces in filenames correctly when using execFile

      // Execute pdfcpu command - output path comes first, followed by input files
      await execFileAsync("pdfcpu", ["merge", outputPath, ...inputPaths]);

      return existsSync(outputPath);
    }
  } catch (error) {
    console.error("pdfcpu merge error:", error);
    throw new Error(
      "Failed to merge PDFs: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}


export async function POST(request: NextRequest) {
  const inputPaths: string[] = [];
  
  try {
    console.log("Starting PDF merge process...");
    
    // Get user ID from either API key (via headers) or session
    const userId = await getUserId(request);
    const operationType = getOperationType(request, 'merge');
    
    // IMPORTANT: Check if the user can perform this operation BEFORE processing
    // This prevents starting expensive operations for users who can't pay
    if (userId) {
      const canPerform = await canPerformOperation(userId, operationType);
      
      if (!canPerform.canPerform) {
        return NextResponse.json(
          {
            error: canPerform.error || "Insufficient balance or free operations",
            details: {
              balance: canPerform.currentBalance,
              freeOperationsRemaining: canPerform.freeOperationsRemaining,
              operationCost: 0.005,
            },
          },
          { status: 402 } // Payment Required status code
        );
      }
    }

    await ensureDirectories();

    // Process form data in a memory-efficient way
    const formData = await request.formData();

    // Get all files from the formData
    const files = formData.getAll("files");

    console.log(`Received ${files.length} files for merging`);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No PDF files provided" },
        { status: 400 }
      );
    }

    if (files.length < 2) {
      return NextResponse.json(
        { error: "At least two PDF files are required for merging" },
        { status: 400 }
      );
    }

    // Get order information if provided
    let fileOrder: number[] = [];
    const orderParam = formData.get("order");

    if (orderParam) {
      try {
        fileOrder = JSON.parse(orderParam as string) as number[];
        // Validate the order array
        if (
          !Array.isArray(fileOrder) ||
          fileOrder.length !== files.length ||
          !fileOrder.every(
            (i) => typeof i === "number" && i >= 0 && i < files.length
          )
        ) {
          fileOrder = []; // Use default order if invalid
        }
      } catch (e) {
        console.error("Invalid order parameter:", e);
        fileOrder = []; // Use default order
      }
    }

    // If no valid order provided, use sequential order
    if (fileOrder.length === 0) {
      fileOrder = Array.from({ length: files.length }, (_, i) => i);
    }

    // Create unique ID for this merge operation
    const uniqueId = uuidv4();

    // Write each file to disk sequentially to reduce memory pressure
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;

      if (!file || !file.name) {
        console.error(`File at index ${i} is invalid or missing name property`);
        continue;
      }

      // Verify it's a PDF
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF` },
          { status: 400 }
        );
      }

      const inputPath = join(UPLOAD_DIR, `${uniqueId}-input-${i}.pdf`);

      // Read and write file in a way that doesn't hold the entire file in memory
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);
      inputPaths.push(inputPath);
      console.log(`Saved file "${file.name}" to ${inputPath}`);
    }

    if (inputPaths.length < 2) {
      return NextResponse.json(
        { error: "Failed to process all input files" },
        { status: 500 }
      );
    }

    try {
      // Create output path
      const outputFileName = `${uniqueId}-merged.pdf`;
      const outputPath = join(MERGE_DIR, outputFileName);

      // Order the input paths according to fileOrder
      const orderedInputPaths = fileOrder.map((i) => inputPaths[i]);

      console.log(`Merging ${files.length} PDF files in specified order`);

      // Merge with Pdfcpu
      let mergeSuccess = false;
      try {
        mergeSuccess = await mergePdfsWithPdfcpu(orderedInputPaths, outputPath);
      } catch (error) {
        console.error("Pdfcpu merge failed:", error);
        throw new Error("PDF merging failed");
      }

      // Verify the output file exists
      if (!mergeSuccess || !existsSync(outputPath)) {
        throw new Error(`Merged file was not created at ${outputPath}`);
      }

      // Get merged file size
      const mergedBuffer = await readFile(outputPath);
      const mergedSize = mergedBuffer.length;

      // Calculate total size of input files
      let totalInputSize = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        if (file && file.size) {
          totalInputSize += file.size;
        }
      }

      // Merge was successful, now charge for the operation
      // Only charge if we have a user ID (either from API key or session)
      let billingInfo = {};
      
      if (userId) {
        const operationResult = await processOperation(userId, operationType);
        
        if (!operationResult.success) {
          return NextResponse.json(
            {
              error: operationResult.error || "Failed to process operation charge",
              details: {
                balance: operationResult.currentBalance,
                freeOperationsRemaining: operationResult.freeOperationsRemaining,
                operationCost: 0.005,
              },
            },
            { status: 402 } // Payment Required status code
          );
        }
        
        // Add billing info to the response
        billingInfo = {
          billing: {
            usedFreeOperation: operationResult.usedFreeOperation,
            freeOperationsRemaining: operationResult.freeOperationsRemaining,
            currentBalance: operationResult.currentBalance,
            operationCost: operationResult.usedFreeOperation ? 0 : 0.005,
          }
        };
      }
      
      // Create relative URL for the merged file using the file API
      const fileUrl = `/api/file?folder=merges&filename=${outputFileName}`;

      return NextResponse.json({
        success: true,
        message: "PDF merge successful",
        fileUrl,
        filename: outputFileName,
        mergedSize,
        totalInputSize,
        fileCount: files.length,
        ...billingInfo // Include billing info if available
      });
    } catch (mergeError) {
      console.error("Merge processing error:", mergeError);
      
      return NextResponse.json(
        {
          error: mergeError instanceof Error
            ? mergeError.message
            : "An unknown error occurred during merging",
          success: false,
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Merge request error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "An unknown error occurred processing the request",
        success: false,
      },
      { status: 500 }
    );
  } finally {
    // Clean up input files
    for (const inputPath of inputPaths) {
      try {
        if (existsSync(inputPath)) {
          await unlink(inputPath);
        }
      } catch (cleanupError) {
        console.warn(`Failed to clean up input file ${inputPath}:`, cleanupError);
      }
    }
  }
}