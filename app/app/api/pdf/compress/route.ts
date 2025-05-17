// app/api/compress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";
import { getUserId, getOperationType, processOperation, canPerformOperation } from '@/lib/operation-tracker';
const execPromise = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), "uploads");
const COMPRESSION_DIR = join(process.cwd(), "public", "compressions");

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(COMPRESSION_DIR)) {
    await mkdir(COMPRESSION_DIR, { recursive: true });
  }
}

// Process PDF compression using pdfcpu optimize
async function processPdfCompression(
  inputPath: string,
  outputPath: string
): Promise<boolean> {
  try {
    // Get the original file size for comparison
    const originalBuffer = await readFile(inputPath);
    const originalSize = originalBuffer.length;

    console.log("Starting pdfcpu optimization...");

    // pdfcpu optimize command
    // pdfcpu optimize [-stats csvFile] inFile [outFile]
    const pdfcpuCommand = `pdfcpu optimize "${inputPath}" "${outputPath}"`;
    console.log("Executing pdfcpu command:", pdfcpuCommand);

    const { stdout, stderr } = await execPromise(pdfcpuCommand);

    // pdfcpu may output to stderr even when successful (e.g., "writing output.pdf...")
    if (stderr && !stderr.toLowerCase().includes("writing")) {
      console.error("pdfcpu stderr:", stderr);
      throw new Error("pdfcpu reported an error");
    }

    if (stdout) {
      console.log("pdfcpu stdout:", stdout);
    }

    // Check if output file exists
    if (existsSync(outputPath)) {
      const compressedBuffer = await readFile(outputPath);
      const compressedSize = compressedBuffer.length;

      const compressionRatio = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(2);
      console.log(
        `pdfcpu compression successful: ${originalSize} -> ${compressedSize} bytes (${compressionRatio}% reduction)`
      );

      // If pdfcpu didn't reduce the file size, use the original
      if (compressedSize >= originalSize) {
        console.log(
          "pdfcpu optimization did not reduce file size. Using original file."
        );
        await writeFile(outputPath, originalBuffer);
      }

      return true;
    } else {
      throw new Error("pdfcpu did not create output file");
    }
  } catch (error) {
    console.error("PDF compression error:", error);
    throw new Error(
      "Failed to compress PDF: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
}

export async function POST(request: NextRequest) {
  let inputPath: string | null = null;

  try {
    console.log("Starting PDF compression process...");
    
    // Get user ID from either API key (via headers) or session
    const userId = await getUserId(request);
    const operationType = getOperationType(request, 'compress');
    
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
    
    // Ensure all required directories exist
    await ensureDirectories();

    // Process form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Verify it's a PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files can be compressed" },
        { status: 400 }
      );
    }

    // Get compression quality - note: pdfcpu optimize doesn't have quality settings
    // so we'll just use it for informational purposes
    const quality = (formData.get("quality") as string) || "medium";
    if (!["low", "medium", "high"].includes(quality)) {
      return NextResponse.json(
        { error: "Invalid compression quality. Use low, medium, or high." },
        { status: 400 }
      );
    }

    // Create unique names for files
    const uniqueId = uuidv4();
    inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
    const outputPath = join(COMPRESSION_DIR, `${uniqueId}-compressed.pdf`);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    console.log(`Compressing PDF: ${file.name}, size: ${file.size} bytes`);

    try {
      // Compress the PDF using pdfcpu
      await processPdfCompression(inputPath, outputPath);

      // Verify the output file exists
      if (!existsSync(outputPath)) {
        throw new Error(`Compressed file was not created at ${outputPath}`);
      }

      // Get file size information
      const originalSize = file.size;
      const compressedBuffer = await readFile(outputPath);
      const compressedSize = compressedBuffer.length;

      // Calculate compression ratio
      const compressionRatio =
        originalSize > compressedSize
          ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
          : "0";

      // Compression was successful, now charge for the operation
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

      // Create relative URL for the compressed file
      const fileUrl = `/api/file?folder=compressions&filename=${uniqueId}-compressed.pdf`;

      return NextResponse.json({
        success: true,
        message: `PDF optimization ${
          compressionRatio !== "0"
            ? `successful with ${compressionRatio}% reduction`
            : "completed (no size reduction)"
        }`,
        fileUrl,
        filename: `${uniqueId}-compressed.pdf`,
        originalName: file.name,
        originalSize,
        compressedSize,
        compressionRatio: `${compressionRatio}%`,
        ...billingInfo // Include billing info if available
      });
    } catch (compressionError) {
      console.error("Compression error:", compressionError);
      
      return NextResponse.json(
        {
          error: compressionError instanceof Error
            ? compressionError.message
            : "An unknown error occurred during compression",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Compression request error:", error);

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
    // Clean up input file
    if (inputPath && existsSync(inputPath)) {
      try {
        await unlink(inputPath);
      } catch (cleanupError) {
        console.warn("Failed to delete input file:", cleanupError);
      }
    }
  }
}