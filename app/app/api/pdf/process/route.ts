// app/api/pdf/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, copyFile, access, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const PROCESS_DIR = join(process.cwd(), 'public', 'processed');
const TEMP_DIR = join(process.cwd(), 'temp');

// Ensure directories exist
async function ensureDirectories() {
    const dirs = [UPLOAD_DIR, PROCESS_DIR, TEMP_DIR];
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
}

// Check if command exists
async function commandExists(command: string): Promise<boolean> {
    try {
        if (process.platform === 'win32') {
            await execPromise(`where ${command}`);
        } else {
            await execPromise(`which ${command}`);
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Convert PDF to images for editing
async function pdfToImages(pdfPath: string, sessionId: string): Promise<{
    pages: Array<{
        imageUrl: string;
        width: number;
        height: number;
        originalWidth: number;
        originalHeight: number;
    }>;
    pageCount: number;
}> {
    try {
        // Get PDF info first
        const pdfBytes = await readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();

        // Pages array to return
        const pages = [];

        // Check available conversion tools
        const hasPdftoppm = await commandExists('pdftoppm');
        const hasGhostscript = await commandExists('gs') || await commandExists('gswin64c');
        const hasImageMagick = await commandExists('convert');

        console.log(`Available conversion tools: pdftoppm=${hasPdftoppm}, gs=${hasGhostscript}, convert=${hasImageMagick}`);

        // Process each page of the PDF
        for (let i = 0; i < pageCount; i++) {
            const pageNum = i + 1;
            const outputPath = join(PROCESS_DIR, `${sessionId}-page-${i}.png`);
            const page = pdfDoc.getPage(i);
            const { width, height } = page.getSize();

            let conversionSuccess = false;

            // Try pdftoppm first (best quality)
            if (hasPdftoppm) {
                try {
                    console.log(`Converting page ${pageNum} with pdftoppm`);

                    // Create temporary file prefix
                    const outputPrefix = join(TEMP_DIR, `${sessionId}-page`);

                    // Use pdftoppm to convert PDF page to PNG
                    await execPromise(`pdftoppm -png -r 150 -f ${pageNum} -l ${pageNum} "${pdfPath}" "${outputPrefix}"`);

                    // pdftoppm creates files with different naming patterns
                    // Try to find the generated file
                    const possibleNames = [
                        `${outputPrefix}-${pageNum}.png`,
                        `${outputPrefix}-${String(pageNum).padStart(2, '0')}.png`,
                        `${outputPrefix}-${String(pageNum).padStart(3, '0')}.png`
                    ];

                    let tempFilePath = '';
                    for (const name of possibleNames) {
                        try {
                            await access(name);
                            tempFilePath = name;
                            break;
                        } catch (e) {
                            // File doesn't exist, try next pattern
                        }
                    }

                    // If we found the file, copy it to the final location
                    if (tempFilePath && existsSync(tempFilePath)) {
                        await copyFile(tempFilePath, outputPath);
                        conversionSuccess = true;
                    }
                } catch (error) {
                    console.error(`pdftoppm error for page ${pageNum}:`, error);
                    // Fall through to next method
                }
            }

            // Try ghostscript if pdftoppm failed
            if (!conversionSuccess && hasGhostscript) {
                try {
                    console.log(`Converting page ${pageNum} with Ghostscript`);

                    const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
                    const gsArgs = [
                        '-q',
                        '-dQUIET',
                        '-dBATCH',
                        '-dNOPAUSE',
                        '-sDEVICE=png16m',
                        '-r150',
                        `-dFirstPage=${pageNum}`,
                        `-dLastPage=${pageNum}`,
                        `-sOutputFile=${outputPath}`,
                        pdfPath
                    ];

                    // Execute ghostscript
                    await new Promise<void>((resolve, reject) => {
                        const gsProcess = spawn(gsCommand, gsArgs);
                        gsProcess.on('close', (code) => {
                            if (code === 0) {
                                resolve();
                            } else {
                                reject(new Error(`Ghostscript exited with code ${code}`));
                            }
                        });
                    });

                    if (existsSync(outputPath)) {
                        conversionSuccess = true;
                    }
                } catch (error) {
                    console.error(`Ghostscript error for page ${pageNum}:`, error);
                    // Fall through to next method
                }
            }

            // Try ImageMagick as last resort
            if (!conversionSuccess && hasImageMagick) {
                try {
                    console.log(`Converting page ${pageNum} with ImageMagick`);

                    // Use ImageMagick's convert command
                    await execPromise(`convert -density 150 "${pdfPath}"[${i}] "${outputPath}"`);

                    if (existsSync(outputPath)) {
                        conversionSuccess = true;
                    }
                } catch (error) {
                    console.error(`ImageMagick error for page ${pageNum}:`, error);
                    // Fall through to fallback
                }
            }

            // If all conversion methods failed, create a placeholder image
            if (!conversionSuccess) {
                console.log(`Using fallback method for page ${pageNum}`);
                await createPlaceholderImage(outputPath, width, height, pageNum);
                conversionSuccess = true;
            }

            // Get the actual dimensions of the generated image
            let imageWidth = width;
            let imageHeight = height;

            try {
                // If we have sharp, use it to get image dimensions
                const metadata = await sharp(outputPath).metadata();
                if (metadata.width && metadata.height) {
                    imageWidth = metadata.width;
                    imageHeight = metadata.height;
                }
            } catch (error) {
                console.error(`Error getting image dimensions for page ${pageNum}:`, error);
                // Continue with estimated dimensions
            }

            // Add page to result
            pages.push({
                imageUrl: `/processed/${sessionId}-page-${i}.png`,
                width: imageWidth,
                height: imageHeight,
                originalWidth: width,
                originalHeight: height
            });
        }

        return { pages, pageCount };
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw error;
    }
}

// Create a placeholder image for preview when conversion tools fail
async function createPlaceholderImage(outputPath: string, width: number, height: number, pageNumber: number): Promise<void> {
    try {
        // Create a simple SVG with page information
        const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" font-family="Arial" font-size="${Math.min(width, height) / 20}px" 
              text-anchor="middle" dominant-baseline="middle" fill="#6c757d">
          Page ${pageNumber}
        </text>
        <text x="50%" y="${height * 0.6}" font-family="Arial" font-size="${Math.min(width, height) / 40}px" 
              text-anchor="middle" dominant-baseline="middle" fill="#6c757d">
          (Preview not available)
        </text>
      </svg>`;

        // Save SVG to temp file
        const svgPath = join(TEMP_DIR, `${uuidv4()}.svg`);
        await writeFile(svgPath, svgContent);

        // Convert SVG to PNG using sharp
        await sharp(svgPath)
            .resize({
                width: Math.round(width),
                height: Math.round(height),
                fit: 'fill'
            })
            .png()
            .toFile(outputPath);

        // Clean up temp SVG file
        try {
            await unlink(svgPath);
        } catch (e) {
            // Ignore cleanup errors
        }
    } catch (error) {
        console.error('Error creating placeholder image:', error);
        throw error;
    }
}

// Handle the API request
export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF processing...');
        await ensureDirectories();

        // Get the uploaded file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files can be processed' },
                { status: 400 }
            );
        }

        console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

        // Generate a unique session ID
        const sessionId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);

        // Save the uploaded PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`PDF saved to ${inputPath}`);

        // Convert PDF pages to images
        const { pages, pageCount } = await pdfToImages(inputPath, sessionId);
        console.log(`Converted ${pageCount} pages to images`);

        // Return processing results
        return NextResponse.json({
            success: true,
            message: 'PDF processed successfully',
            sessionId,
            pageCount,
            pages
        });
    } catch (error) {
        console.error('PDF processing error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF processing',
                success: false
            },
            { status: 500 }
        );
    }
}