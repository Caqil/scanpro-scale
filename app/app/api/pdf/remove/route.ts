// app/api/pdf/remove/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";
import { trackApiUsage, validateApiKey } from "@/lib/validate-key";
import { canPerformOperation, getOperationType, getUserId, processOperation } from "@/lib/operation-tracker";

const execAsync = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), "uploads");
const PROCESSED_DIR = join(process.cwd(), "public", "processed");

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(PROCESSED_DIR)) {
    await mkdir(PROCESSED_DIR, { recursive: true });
  }
}

// Get total pages using pdfcpu
async function getTotalPages(inputPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`pdfcpu info "${inputPath}"`);

    // Parse the output to find the number of pages
    const pagesMatch = stdout.match(/Page count:\s*(\d+)/);
    if (pagesMatch && pagesMatch[1]) {
      return parseInt(pagesMatch[1], 10);
    }

    throw new Error("Could not parse page count from pdfcpu output");
  } catch (error) {
    console.error("Error getting page count:", error);
    throw new Error(
      `Failed to get page count: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Format page selection for pdfcpu
function formatPageSelection(pagesToRemove: number[]): string {
  // Sort pages and create ranges where possible
  const sorted = [...pagesToRemove].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(rangeStart.toString());
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }

  // Add the last range
  if (rangeStart === rangeEnd) {
    ranges.push(rangeStart.toString());
  } else {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  }

  return ranges.join(",");
}

export async function POST(request: NextRequest) {
  let inputPath: string | null = null;
  
  try {
    console.log("Starting PDF remove pages process using pdfcpu...");
    
    // Get user ID from either API key (via headers) or session
    const userId = await getUserId(request);
    const operationType = getOperationType(request, 'remove');
    
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

    // Parse FormData from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pagesToRemoveStr = formData.get("pagesToRemove") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Verify it's a PDF
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (!pagesToRemoveStr) {
      return NextResponse.json(
        { error: "No pages specified for removal" },
        { status: 400 }
      );
    }

    let pagesToRemove: number[];
    try {
      pagesToRemove = JSON.parse(pagesToRemoveStr);
      if (!Array.isArray(pagesToRemove) || pagesToRemove.length === 0) {
        throw new Error("Invalid pages array");
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid pages format" },
        { status: 400 }
      );
    }

    try {
      // Generate unique file names
      const uniqueId = uuidv4();
      inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
      const outputPath = join(PROCESSED_DIR, `${uniqueId}-processed.pdf`);

      // Save the uploaded PDF
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);
      console.log(`PDF saved to ${inputPath}`);

      // Get total pages
      const pageCount = await getTotalPages(inputPath);
      console.log(`PDF has ${pageCount} pages`);

      // Validate page numbers
      const invalidPages = pagesToRemove.filter(
        (page) => page < 1 || page > pageCount
      );
      if (invalidPages.length > 0) {
        return NextResponse.json(
          { error: `Invalid page numbers: ${invalidPages.join(", ")}` },
          { status: 400 }
        );
      }

      // Check if all pages are selected for removal
      if (pagesToRemove.length === pageCount) {
        return NextResponse.json(
          { error: "Cannot remove all pages from the document" },
          { status: 400 }
        );
      }

      // Format page selection for pdfcpu
      const pageSelection = formatPageSelection(pagesToRemove);
      console.log(`Pages to remove: ${pageSelection}`);

      // Execute pdfcpu remove command
      const command = `pdfcpu pages remove -pages ${pageSelection} "${inputPath}" "${outputPath}"`;
      console.log(`Executing: ${command}`);

      try {
        const { stdout, stderr } = await execAsync(command);
        if (stdout.trim()) {
          console.log("pdfcpu stdout:", stdout);
        }
        if (stderr) {
          console.warn("pdfcpu stderr:", stderr);
        }
      } catch (error) {
        console.error("Page removal error:", error);
        throw new Error(
          `pdfcpu failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      console.log(`Processed PDF saved to ${outputPath}`);

      // Page removal was successful, now charge for the operation
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

      // Return success response with the file URL
      return NextResponse.json({
        success: true,
        message: "Pages removed successfully",
        fileUrl: `/api/file?folder=processed&filename=${uniqueId}-processed.pdf`,
        fileName: `${uniqueId}-processed.pdf`,
        originalName: file.name,
        pagesRemoved: pagesToRemove.length,
        remainingPages: pageCount - pagesToRemove.length,
        ...billingInfo // Include billing info if available
      });
    } catch (processingError) {
      console.error("PDF processing error:", processingError);
      
      return NextResponse.json(
        {
          error: processingError instanceof Error
            ? processingError.message
            : "An unknown error occurred during page removal",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PDF page removal request error:", error);

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
    if (inputPath) {
      try {
        await unlink(inputPath);
        console.log(`Deleted input file: ${inputPath}`);
      } catch (cleanupError) {
        console.warn(`Failed to delete input file ${inputPath}:`, cleanupError);
      }
    }
  }
}