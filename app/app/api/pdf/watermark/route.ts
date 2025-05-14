// app/api/pdf/watermark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import { promisify } from "util";
import { trackApiUsage, validateApiKey } from "@/lib/validate-key";
import { canPerformOperation, getOperationType, getUserId, processOperation } from "@/lib/operation-tracker";

const execPromise = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), "uploads");
const WATERMARKED_DIR = join(process.cwd(), "public", "watermarks");
const TEMP_DIR = join(process.cwd(), "temp");

async function ensureDirectories() {
  const dirs = [UPLOAD_DIR, WATERMARKED_DIR, TEMP_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

function getPagesToWatermark(
  totalPages: number,
  pageOption: string,
  customPages: string
): string {
  switch (pageOption) {
    case "all":
      return ""; // Empty means all pages for pdfcpu
    case "even":
      return Array.from(
        { length: Math.floor(totalPages / 2) },
        (_, i) => (i + 1) * 2
      ).join(",");
    case "odd":
      return Array.from(
        { length: Math.ceil(totalPages / 2) },
        (_, i) => i * 2 + 1
      )
        .filter((p) => p <= totalPages)
        .join(",");
    case "custom":
      return parsePageRanges(customPages, totalPages);
    default:
      return "";
  }
}

function parsePageRanges(pagesString: string, totalPages: number): string {
  const parts = pagesString.split(",");
  const validRanges: string[] = [];

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    if (trimmedPart.includes("-")) {
      const [startStr, endStr] = trimmedPart.split("-");
      const start = parseInt(startStr.trim());
      const end = parseInt(endStr.trim());

      if (
        !isNaN(start) &&
        !isNaN(end) &&
        start <= end &&
        start > 0 &&
        end <= totalPages
      ) {
        validRanges.push(`${start}-${end}`);
      }
    } else {
      const pageNum = parseInt(trimmedPart);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
        validRanges.push(pageNum.toString());
      }
    }
  }

  return validRanges.join(",");
}

async function getPDFPageCount(pdfPath: string): Promise<number> {
  try {
    // Try pdfinfo first if available
    try {
      const { stdout } = await execPromise(`pdfinfo "${pdfPath}"`);
      const pagesMatch = stdout.match(/Pages:\s*(\d+)/i);
      if (pagesMatch && pagesMatch[1]) {
        return parseInt(pagesMatch[1], 10);
      }
    } catch (e) {
      console.log("pdfinfo not available, trying pdfcpu...");
    }

    // Try pdfcpu info as fallback
    const { stdout } = await execPromise(`pdfcpu info "${pdfPath}"`);

    const patterns = [
      /Pages:\s*(\d+)/i,
      /NumberOfPages:\s*(\d+)/i,
      /page\s*count:\s*(\d+)/i,
      /pages:\s*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = stdout.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    console.warn("Could not find page count, assuming 1 page");
    return 1;
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    return 1;
  }
}

// Convert opacity percent (0-100) to pdfcpu opacity (0.0-1.0)
function normalizeOpacity(opacity: number): string {
  // Ensure opacity is a valid number between 0 and 100
  const validOpacity = Math.min(Math.max(opacity || 30, 1), 100);
  const normalizedOpacity = validOpacity / 100;
  return normalizedOpacity.toFixed(2);
}

// Map position names to pdfcpu position values
function mapPositionToAnchor(position: string): string {
  switch (position.toLowerCase()) {
    case "center":
      return "c";
    case "top-left":
      return "tl";
    case "top-right":
      return "tr";
    case "bottom-left":
      return "bl";
    case "bottom-right":
      return "br";
    case "tile":
      // For tile, we use center position with diagonal
      return "c";
    case "custom":
      // For custom, default to center
      return "c";
    default:
      return "c";
  }
}
// Normalize color from hex to pdfcpu format
function normalizeColor(hexColor: string): string {
  const color = hexColor.replace("#", "");

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // pdfcpu expects float values between 0 and 1
  return `${(r / 255).toFixed(2)} ${(g / 255).toFixed(2)} ${(b / 255).toFixed(
    2
  )}`;
}

// Process PDF with watermark
async function processPDFWithWatermark(
  inputPath: string,
  outputPath: string,
  options: {
    watermarkType: string;
    text?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    imageFilePath?: string;
    scale?: number;
    opacity: number;
    rotation: number;
    position: string;
    customX?: number;
    customY?: number;
    pages: string;
  }
): Promise<void> {
  try {
    const mode = options.watermarkType;
    const content =
      mode === "text" ? options.text || "WATERMARK" : options.imageFilePath;

    if (!content) {
      throw new Error(`No ${mode} content provided for watermark`);
    }

    // Create the watermark configuration string
    const configParts: string[] = [];

    // Apply position - use full parameter name
    const position = mapPositionToAnchor(options.position);
    configParts.push(`position:${position}`);

    // Opacity - use full parameter name
    const opacity = normalizeOpacity(options.opacity);
    configParts.push(`opacity:${opacity}`);

    // Handle rotation and diagonal mode
    if (options.position === "tile") {
      // For tile effect, use diagonal mode
      configParts.push("diagonal:1");
      // No rotation for diagonal mode
    } else {
      // For non-tile positions, apply rotation
      configParts.push(`rotation:${options.rotation}`);
    }

    // Add mode-specific configuration
    if (mode === "text") {
      // Font name - use full parameter name
      let fontName = "Helvetica";
      if (options.fontFamily) {
        switch (options.fontFamily.toLowerCase()) {
          case "times new roman":
          case "times":
            fontName = "Times-Roman";
            break;
          case "courier":
            fontName = "Courier";
            break;
          case "helvetica":
          case "arial":
          default:
            fontName = "Helvetica";
            break;
        }
      }
      configParts.push(`fontname:${fontName}`);

      // Font size
      if (options.fontSize) {
        configParts.push(`points:${options.fontSize}`);
      }

      // Text color - use full parameter names
      if (options.textColor) {
        const color = normalizeColor(options.textColor);
        configParts.push(`fillcolor:${color}`);
        configParts.push(`strokecolor:${color}`);
      }
    } else if (mode === "image") {
      // Scale for image
      if (options.scale) {
        const scale = options.scale / 100;
        configParts.push(`scalefactor:${scale.toFixed(2)}`);
      }
    }

    // Join configuration with commas
    const config = configParts.join(", ");

    // Build the pdfcpu command
    let command = `pdfcpu watermark add -mode ${mode}`;

    // Add pages parameter if specified
    if (options.pages && options.pages.trim() !== "") {
      command += ` -pages ${options.pages}`;
    }

    // Add the content, config, and file paths
    command += ` -- "${content}" "${config}" "${inputPath}" "${outputPath}"`;

    console.log("Executing pdfcpu command:", command);
    console.log("Configuration string:", config);

    // Execute the command
    const { stdout, stderr } = await execPromise(command);

    if (stderr && stderr.trim() !== "") {
      console.warn("pdfcpu stderr:", stderr);

      // Check for specific errors
      if (stderr.includes("Invalid watermark configuration")) {
        throw new Error(
          "Invalid watermark configuration. Please check your settings."
        );
      }
      if (stderr.includes("ambiguous parameter prefix")) {
        throw new Error(
          "Invalid parameter names in configuration. Please check the watermark settings."
        );
      }
    }

    if (stdout && stdout.trim() !== "") {
      console.log("pdfcpu stdout:", stdout);
    }

    // Verify the output file exists
    if (!existsSync(outputPath)) {
      throw new Error("Output file was not created by pdfcpu");
    }
  } catch (error) {
    console.error("Error processing PDF with watermark:", error);
    throw error;
  }
}
export async function POST(request: NextRequest) {
  let inputPath = "";
  let imagePath = "";

  try {
    console.log("Starting PDF watermarking process...");
    
    // Get user ID from either API key (via headers) or session
    const userId = await getUserId(request);
    const operationType = getOperationType(request, 'watermark');
    
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const watermarkType = (formData.get("watermarkType") as string) || "text";

    const position = (formData.get("position") as string) || "center";
    const pages = (formData.get("pages") as string) || "all";
    const customPages = (formData.get("customPages") as string) || "";
    const opacity = parseInt((formData.get("opacity") as string) || "30");
    const rotation = parseInt((formData.get("rotation") as string) || "45");

    const customX =
      position === "custom"
        ? parseFloat((formData.get("customX") as string) || "50")
        : undefined;
    const customY =
      position === "custom"
        ? parseFloat((formData.get("customY") as string) || "50")
        : undefined;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files can be watermarked" },
        { status: 400 }
      );
    }

    const uniqueId = uuidv4();
    inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
    const outputPath = join(WATERMARKED_DIR, `${uniqueId}-watermarked.pdf`);

    // Save uploaded PDF to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);
    console.log(`PDF saved to ${inputPath}`);

    // Verify pdfcpu is installed
    try {
      await execPromise("pdfcpu version");
      console.log("pdfcpu is installed and available");
    } catch (cmdError) {
      console.error("pdfcpu is not installed or not in PATH:", cmdError);
      return NextResponse.json(
        { error: "PDF processing tools are not available on the server" },
        { status: 500 }
      );
    }

    // Get page count of the PDF
    let totalPages = 1;
    try {
      totalPages = await getPDFPageCount(inputPath);
      console.log(`PDF has ${totalPages} pages`);
    } catch (pageCountError) {
      console.warn(
        "Error getting page count, assuming all pages:",
        pageCountError
      );
    }

    // Determine which pages to watermark
    let pagesToWatermark = "";
    if (pages !== "all") {
      try {
        pagesToWatermark = getPagesToWatermark(totalPages, pages, customPages);
      } catch (pageRangeError) {
        console.warn(
          "Error parsing page ranges, using all pages:",
          pageRangeError
        );
        pagesToWatermark = "";
      }
    }

    console.log(`Watermarking pages: ${pagesToWatermark || "all"}`);

    // Process watermark based on type
    const watermarkOptions = {
      watermarkType,
      opacity,
      rotation,
      position,
      customX,
      customY,
      pages: pagesToWatermark,
    };

    if (watermarkType === "text") {
      const text = (formData.get("text") as string) || "WATERMARK";
      const textColor = (formData.get("textColor") as string) || "#FF0000";
      const fontSize = parseInt((formData.get("fontSize") as string) || "48");
      const fontFamily = (formData.get("fontFamily") as string) || "Arial";

      Object.assign(watermarkOptions, {
        text,
        textColor,
        fontSize,
        fontFamily,
      });
    } else if (watermarkType === "image") {
      const watermarkImage = formData.get("watermarkImage") as File;

      if (!watermarkImage) {
        return NextResponse.json(
          { error: "No watermark image provided" },
          { status: 400 }
        );
      }

      const scale = parseInt((formData.get("scale") as string) || "50");
      const imageBuffer = Buffer.from(await watermarkImage.arrayBuffer());

      // Save image temporarily
      imagePath = join(
        TEMP_DIR,
        `${uniqueId}-watermark${getImageExtension(watermarkImage.name)}`
      );
      await writeFile(imagePath, imageBuffer);
      console.log(`Watermark image saved to ${imagePath}`);

      Object.assign(watermarkOptions, {
        imageFilePath: imagePath,
        scale,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid watermark type" },
        { status: 400 }
      );
    }

    // Apply watermark to PDF
    await processPDFWithWatermark(inputPath, outputPath, watermarkOptions);

    // Verify the output file exists and has content
    const outputStats = await readFile(outputPath);
    if (!outputStats || outputStats.length === 0) {
      throw new Error("Output PDF is empty or corrupted");
    }

    console.log(
      `Successfully created watermarked PDF: ${outputPath} (${outputStats.length} bytes)`
    );

    // Count the number of pages watermarked
    let pagesWatermarkedCount = totalPages;
    if (pagesToWatermark) {
      try {
        pagesWatermarkedCount = countPagesInRange(pagesToWatermark, totalPages);
      } catch (countError) {
        console.warn("Error counting watermarked pages:", countError);
      }
    }

    // Charge for the operation after successful processing
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

    const fileUrl = `/api/file?folder=watermarks&filename=${uniqueId}-watermarked.pdf`;

    return NextResponse.json({
      success: true,
      message: "PDF watermarked successfully with pdfcpu",
      fileUrl,
      filename: `${uniqueId}-watermarked.pdf`,
      originalName: file.name,
      pagesWatermarked: pagesWatermarkedCount,
      ...billingInfo // Include billing info if available
    });
  } catch (error) {
    console.error("PDF watermarking error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred during PDF watermarking",
        success: false,
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary files
    try {
      if (inputPath && existsSync(inputPath)) {
        await unlink(inputPath).catch((e) =>
          console.error("Failed to delete input file:", e)
        );
      }
      if (imagePath && existsSync(imagePath)) {
        await unlink(imagePath).catch((e) =>
          console.error("Failed to delete image file:", e)
        );
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temporary files:", cleanupError);
    }
  }
}

// Helper function to get image extension
function getImageExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? `.${ext}` : ".png";
}

// Helper function to count pages in a page range string
function countPagesInRange(pageRange: string, totalPages: number): number {
  if (!pageRange || pageRange.trim() === "") return totalPages;

  let count = 0;
  const parts = pageRange.split(",");

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((p) => parseInt(p.trim()));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        count += Math.min(end, totalPages) - start + 1;
      }
    } else {
      const page = parseInt(part.trim());
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        count++;
      }
    }
  }

  return count;
}