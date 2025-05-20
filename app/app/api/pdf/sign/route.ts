// app/api/pdf/sign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path, { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), "uploads");
const SIGNATURES_DIR = join(process.cwd(), "public", "signatures");
const TEMP_DIR = join(process.cwd(), "temp");
const OCR_DIR = join(process.cwd(), "public", "ocr");

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [UPLOAD_DIR, SIGNATURES_DIR, TEMP_DIR, OCR_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// Interface for element data coming from frontend
interface SignatureElement {
  id: string;
  type:
    | "signature"
    | "text"
    | "stamp"
    | "initials"
    | "name"
    | "date"
    | "drawing"
    | "image";
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: string;
  rotation: number;
  scale: number;
  page: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

// Interface for page data
interface PageData {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

// Check if system commands exist
async function commandExists(command: string): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      await execPromise(`where ${command}`);
    } else {
      await execPromise(`which ${command}`);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Check if OCRmyPDF is installed
async function isOcrmypdfInstalled(): Promise<boolean> {
  return await commandExists("ocrmypdf");
}

// Check if Tesseract is installed
async function isTesseractInstalled(): Promise<boolean> {
  return await commandExists("tesseract");
}

// Check if pdftotext is installed
async function isPdftotextInstalled(): Promise<boolean> {
  return await commandExists("pdftotext");
}

// Extract text from PDF using pdftotext
async function extractTextFromPdf(pdfPath: string): Promise<string> {
  try {
    const hasPdftotext = await isPdftotextInstalled();
    if (!hasPdftotext) {
      return "Cannot extract text - pdftotext not installed";
    }

    const outputPath = `${pdfPath}.txt`;
    await execPromise(`pdftotext -layout "${pdfPath}" "${outputPath}"`);

    if (existsSync(outputPath)) {
      const text = await readFile(outputPath, "utf-8");
      await unlink(outputPath).catch((error) =>
        console.error(`Failed to delete text file ${outputPath}:`, error)
      );
      return text;
    }

    return "Failed to extract text from PDF";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Create searchable PDF using OCRmyPDF
async function createSearchablePdf(
  pdfPath: string,
  outputPath: string,
  language: string = "eng"
): Promise<boolean> {
  try {
    const scriptPath = join(process.cwd(), "scripts", "ocr.py");
    const command = `python3 "${scriptPath}" "${pdfPath}" "${outputPath}" "${language}"`;
    console.log(`Running: ${command}`);
    await execPromise(command);
    return existsSync(outputPath);
  } catch (error) {
    console.error("Error during OCR process:", error);
    return false;
  }
}

// Convert SVG string to PNG data URL with transparency
async function svgToPngDataUrl(
  svgString: string,
  width: number,
  height: number
): Promise<string> {
  try {
    // Ensure SVG has transparent background by adding background: transparent or by not specifying a background
    if (!svgString.includes("background")) {
      // Only add if not already specified
      const svgOpenTag = svgString.match(/<svg[^>]*>/);
      if (svgOpenTag) {
        const styleAttr = svgOpenTag[0].includes("style=")
          ? svgOpenTag[0].replace(
              /style="([^"]*)"/,
              (match, p1) => `style="${p1};background:transparent"`
            )
          : svgOpenTag[0].replace(/>$/, ' style="background:transparent">');

        svgString = svgString.replace(/<svg[^>]*>/, styleAttr);
      }
    }

    // Process image with transparency support
    const buffer = await sharp(Buffer.from(svgString))
      .resize(width, height)
      .png()
      .toBuffer();

    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    throw error;
  }
}

// Process image buffer to ensure transparency
async function ensureTransparentBackground(
  imageBuffer: Buffer,
  isJpeg: boolean
): Promise<Buffer> {
  try {
    if (isJpeg) {
      // If JPEG (which doesn't support transparency), convert to PNG and make white transparent
      return await sharp(imageBuffer)
        .toFormat("png")
        .ensureAlpha() // Ensure alpha channel exists
        .composite([
          {
            input: {
              create: {
                width: 1,
                height: 1,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
              },
            },
            blend: "dest-in", // Use the source alpha
            raw: {
              width: 1,
              height: 1,
              channels: 4,
            },
          },
        ])
        .png()
        .toBuffer();
    } else {
      // If PNG, ensure alpha channel exists and is used
      return await sharp(imageBuffer).ensureAlpha().png().toBuffer();
    }
  } catch (error) {
    console.error("Error ensuring transparent background:", error);
    return imageBuffer; // Return original on error
  }
}

// Determine if a string is an SVG
function isSvgString(str: string): boolean {
  return (
    str.trim().startsWith("<svg") ||
    (str.includes("<?xml") && str.includes("<svg"))
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("Starting PDF signing process...");
    
    
    // IMPORTANT: Check if the user can perform this operation BEFORE processing
    // This prevents starting expensive operations for users who can't pay
    

    await ensureDirectories();

    // Parse FormData from the request
    const formData = await request.formData();

    const pdfFile = formData.get("file") as File | null;
    if (!pdfFile) {
      return NextResponse.json(
        { error: "No PDF file uploaded" },
        { status: 400 }
      );
    }

    const elements: SignatureElement[] = JSON.parse(
      (formData.get("elements") as string) || "[]"
    );
    const pages: PageData[] = JSON.parse(
      (formData.get("pages") as string) || "[]"
    );
    const shouldPerformOcr = formData.get("performOcr") === "true";
    const ocrLanguage = (formData.get("ocrLanguage") as string) || "eng";

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json(
        { error: "No elements provided for signing" },
        { status: 400 }
      );
    }

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: "No pages data provided" },
        { status: 400 }
      );
    }

    try {
      const sessionId = uuidv4();
      const tempPdfPath = join(TEMP_DIR, `${sessionId}-original.pdf`);
      const outputPdfPath = join(SIGNATURES_DIR, `${sessionId}-signed.pdf`);
      const ocrPdfPath = join(OCR_DIR, `${sessionId}-searchable.pdf`);
      const ocrTextPath = join(OCR_DIR, `${sessionId}-ocr.txt`);

      console.log(`Creating signed PDF at ${outputPdfPath}`);
      console.log(`Number of elements: ${elements.length}`);
      console.log(`Number of pages: ${pages.length}`);

      const pdfBytes = await pdfFile.arrayBuffer();
      await writeFile(tempPdfPath, Buffer.from(pdfBytes));
      const pdfDoc = await PDFDocument.load(await readFile(tempPdfPath));

      // Process each page
      for (let pageIndex = 0; pageIndex < pdfDoc.getPageCount(); pageIndex++) {
        const page = pdfDoc.getPage(pageIndex);
        const pageData = pages[pageIndex];
        console.log(`Processing page ${pageIndex + 1}`);

        if (!pageData?.originalWidth || !pageData?.originalHeight) {
          console.log(`Skipping page ${pageIndex + 1} due to missing dimensions`);
          continue;
        }

        const pageElements = elements.filter((el) => el.page === pageIndex);

        // Use the actual PDF page dimensions for scaling
        const pdfPageWidth = page.getWidth();
        const pdfPageHeight = page.getHeight();
        const scaleX = pdfPageWidth / pageData.width; // UI width to PDF width
        const scaleY = pdfPageHeight / pageData.height; // UI height to PDF height

        for (const element of pageElements) {
          console.log(
            `Adding element type ${element.type} to page ${pageIndex + 1}`
          );

          // Convert UI coordinates (top-left origin) to PDF coordinates (bottom-left origin)
          const pdfX = element.position.x * scaleX;
          const pdfY =
            pdfPageHeight -
            element.position.y * scaleY -
            element.size.height * scaleY;

          if (
            element.type === "signature" ||
            element.type === "image" ||
            element.type === "drawing"
          ) {
            if (element.data.startsWith("data:image")) {
              const base64Data = element.data.split(",")[1];
              const buffer = Buffer.from(base64Data, "base64");
              const isJpeg = element.data.includes("image/jpeg");

              try {
                // Process image to ensure transparent background
                const transparentBuffer = await ensureTransparentBackground(
                  buffer,
                  isJpeg
                );

                // Embed the PNG with transparency
                const elementImage = await pdfDoc.embedPng(transparentBuffer);

                page.drawImage(elementImage, {
                  x: pdfX,
                  y: pdfY,
                  width: element.size.width * scaleX,
                  height: element.size.height * scaleY,
                  rotate: element.rotation
                    ? degrees(element.rotation)
                    : undefined,
                  opacity: element.scale || 1.0,
                });

                console.log(
                  `Added ${element.type} to page ${
                    pageIndex + 1
                  } at (${pdfX}, ${pdfY})`
                );
              } catch (error) {
                console.error(`Error embedding ${element.type}:`, error);
              }
            }
          } else if (
            element.type === "text" ||
            element.type === "name" ||
            element.type === "date"
          ) {
            try {
              // Map common font names to standard PDF fonts
              let fontName;
              const fontFamily = element.fontFamily?.toLowerCase() || "arial";

              if (
                fontFamily.includes("arial") ||
                fontFamily.includes("helvetica")
              ) {
                fontName = StandardFonts.Helvetica;
              } else if (
                fontFamily.includes("times") ||
                fontFamily.includes("serif")
              ) {
                fontName = StandardFonts.TimesRoman;
              } else if (fontFamily.includes("courier")) {
                fontName = StandardFonts.Courier;
              } else {
                // Default to Helvetica if font is not recognized
                fontName = StandardFonts.Helvetica;
              }

              const font = await pdfDoc.embedFont(fontName);
              const fontSize = (element.fontSize || 16) * scaleX;
              const color = element.color || "#000000";
              const red = parseInt(color.slice(1, 3), 16) / 255;
              const green = parseInt(color.slice(3, 5), 16) / 255;
              const blue = parseInt(color.slice(5, 7), 16) / 255;

              // Set text content based on element type
              let textContent = element.data;
              if (
                element.type === "date" &&
                (textContent === "Date Placeholder" || !textContent)
              ) {
                textContent = new Date().toLocaleDateString();
              }

              // Calculate text height for vertical centering
              const textHeight = font.heightAtSize(fontSize);
              const verticalOffset =
                (element.size.height * scaleY - textHeight) / 2;

              page.drawText(textContent, {
                x: pdfX + 5, // Add a small padding
                y: pdfY + verticalOffset, // Center text vertically
                size: fontSize,
                font,
                color: rgb(red, green, blue),
                rotate: element.rotation ? degrees(element.rotation) : undefined,
                opacity: element.scale || 1.0,
              });

              console.log(
                `Added text to page ${
                  pageIndex + 1
                } at (${pdfX}, ${pdfY}): "${textContent}"`
              );
            } catch (error) {
              console.error(`Error adding text:`, error);
            }
          } else if (element.type === "stamp") {
            try {
              if (isSvgString(element.data)) {
                // Convert SVG to PNG with transparent background
                const pngDataUrl = await svgToPngDataUrl(
                  element.data,
                  Math.round(element.size.width * 2), // Higher resolution for better quality
                  Math.round(element.size.height * 2)
                );

                const pngData = pngDataUrl.split(",")[1];
                const pngBuffer = Buffer.from(pngData, "base64");
                const stampImage = await pdfDoc.embedPng(pngBuffer);

                page.drawImage(stampImage, {
                  x: pdfX,
                  y: pdfY,
                  width: element.size.width * scaleX,
                  height: element.size.height * scaleY,
                  rotate: element.rotation
                    ? degrees(element.rotation)
                    : undefined,
                  opacity: element.scale || 1.0,
                });

                console.log(
                  `Added stamp (SVG converted to PNG) to page ${pageIndex + 1}`
                );
              } else if (element.data.startsWith("data:image")) {
                // Handle image-based stamps
                const base64Data = element.data.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");
                const isJpeg = element.data.includes("image/jpeg");

                // Process stamp to ensure transparent background
                const transparentBuffer = await ensureTransparentBackground(
                  buffer,
                  isJpeg
                );
                const stampImage = await pdfDoc.embedPng(transparentBuffer);

                page.drawImage(stampImage, {
                  x: pdfX,
                  y: pdfY,
                  width: element.size.width * scaleX,
                  height: element.size.height * scaleY,
                  rotate: element.rotation
                    ? degrees(element.rotation)
                    : undefined,
                  opacity: element.scale || 1.0,
                });

                console.log(`Added stamp (image) to page ${pageIndex + 1}`);
              } else {
                // Fall back to text-based stamp if no image data is available
                console.log(`No image data for stamp, skipping`);
              }
            } catch (error) {
              console.error(`Error adding stamp:`, error);
            }
          }
        }
      }

      // Save the PDF
      const pdfBytesOutput = await pdfDoc.save();
      await writeFile(outputPdfPath, pdfBytesOutput);
      console.log(`PDF saved to ${outputPdfPath}`);

      await unlink(tempPdfPath).catch((error) =>
        console.error(`Failed to delete temp file ${tempPdfPath}:`, error)
      );

      // Signing was successful, now charge for the operation
      // Only charge if we have a user ID (either from API key or session)
      let billingInfo = {};
      
      

      const responseData: any = {
        success: true,
        message: "PDF signed successfully",
        fileUrl: `/api/file?folder=signatures&filename=${sessionId}-signed.pdf`,
        filename: `${sessionId}-signed.pdf`,
        originalName: pdfFile.name || "signed-document.pdf",
        ...billingInfo // Include billing info if available
      };

      if (shouldPerformOcr) {
        try {
          console.log("Creating searchable PDF with OCR...");
          const ocrSuccess = await createSearchablePdf(
            outputPdfPath,
            ocrPdfPath,
            ocrLanguage
          );

          if (ocrSuccess) {
            const extractedText = await extractTextFromPdf(ocrPdfPath);
            await writeFile(ocrTextPath, extractedText);

            responseData.ocrComplete = true;
            responseData.searchablePdfUrl = `/api/file?folder=ocr&filename=${sessionId}-searchable.pdf`;
            responseData.searchablePdfFilename = `${sessionId}-searchable.pdf`;
            responseData.ocrText = extractedText;
            responseData.ocrTextUrl = `/ocr/${path.basename(ocrTextPath)}`;

            console.log("Searchable PDF created successfully");
          } else {
            responseData.ocrComplete = false;
            responseData.ocrError =
              "OCR failed - OCRmyPDF may not be installed or configured correctly";
            console.log("OCR failed - check if OCRmyPDF is installed");
          }
        } catch (error) {
          console.error("Error during OCR processing:", error);
          responseData.ocrComplete = false;
          responseData.ocrError = `OCR failed: ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      }

      return NextResponse.json(responseData);
    } catch (processingError) {
      console.error("PDF processing error:", processingError);
      
      return NextResponse.json(
        {
          error: processingError instanceof Error
            ? processingError.message
            : "An unknown error occurred during PDF signing",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("PDF signing request error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "An unknown error occurred processing the request",
        success: false,
      },
      { status: 500 }
    );
  }
}