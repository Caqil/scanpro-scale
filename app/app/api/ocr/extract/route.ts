// app/api/ocr/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const OCR_DIR = join(process.cwd(), 'public', 'ocr');
const TEMP_DIR = join(process.cwd(), 'temp');

// Ensure directories exist
async function ensureDirectories() {
    const dirs = [UPLOAD_DIR, OCR_DIR, TEMP_DIR];
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
}

// Parse page ranges from string format
function parsePageRanges(pagesString: string, totalPages: number): number[] {
    const pages: number[] = [];

    // Split by commas
    const parts = pagesString.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();

        // Check if it's a range (contains '-')
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr.trim());
            const end = parseInt(endStr.trim());

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                // Add all pages in range (ensure within document bounds)
                for (let i = start; i <= Math.min(end, totalPages); i++) {
                    if (!pages.includes(i) && i > 0) {
                        pages.push(i);
                    }
                }
            }
        } else {
            // Single page number
            const pageNum = parseInt(trimmedPart);
            if (!isNaN(pageNum) && !pages.includes(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                pages.push(pageNum);
            }
        }
    }

    return pages.sort((a, b) => a - b);
}

// Check if system command exists
async function commandExists(command: string): Promise<boolean> {
    try {
        await execPromise(`which ${command}`);
        return true;
    } catch (error) {
        return false;
    }
}

// Check if Tesseract is installed (system version)
async function isTesseractInstalled(): Promise<boolean> {
    try {
        const tesseractExists = await commandExists('tesseract');
        if (tesseractExists) {
            // Check version
            const { stdout } = await execPromise('tesseract --version');
            console.log('Tesseract version:', stdout);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking for Tesseract:', error);
        return false;
    }
}

// Extract PDF pages to individual images using Ghostscript
async function pdfToImages(pdfPath: string, outputDir: string, pageNumbers: number[] = []): Promise<string[]> {
    try {
        // If pageNumbers is empty, get total page count to process all pages
        let totalPages = 0;
        if (pageNumbers.length === 0) {
            const pdfBytes = await readFile(pdfPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            totalPages = pdfDoc.getPageCount();
            pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Check if ghostscript or pdftoppm is available
        const hasGhostscript = await commandExists('gs');
        const hasPdftoppm = await commandExists('pdftoppm');

        if (!hasGhostscript && !hasPdftoppm) {
            throw new Error('No PDF to image conversion tools available (gs or pdftoppm)');
        }

        const imagePaths: string[] = [];
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';

        // Use pdftoppm if available (usually produces better images for OCR)
        if (hasPdftoppm) {
            for (const pageNum of pageNumbers) {
                const outputPath = join(outputDir, `page-${pageNum}.png`);
                await execPromise(`pdftoppm -f ${pageNum} -l ${pageNum} -png -r 300 "${pdfPath}" "${outputDir}/page"`);

                // pdftoppm names files differently, we need to rename
                // It produces files like page-1.png, page-2.png
                const pdfToPpmOutput = join(outputDir, `page-${pageNum}.png`);

                imagePaths.push(pdfToPpmOutput);
            }
        }
        // Fall back to ghostscript
        else if (hasGhostscript) {
            for (const pageNum of pageNumbers) {
                const outputPath = join(outputDir, `page-${pageNum}.png`);
                const gsArgs = [
                    '-dQUIET',
                    '-dBATCH',
                    '-dNOPAUSE',
                    '-sDEVICE=png16m',
                    '-r300', // Higher resolution for better OCR
                    `-dFirstPage=${pageNum}`,
                    `-dLastPage=${pageNum}`,
                    `-sOutputFile=${outputPath}`,
                    pdfPath
                ];

                console.log(`Converting page ${pageNum} to image with Ghostscript...`);
                await execPromise(`${gsCommand} ${gsArgs.join(' ')}`);
                imagePaths.push(outputPath);
            }
        }

        return imagePaths;
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw new Error(`PDF to image conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Process an image with OCR using system Tesseract
async function processImageWithSystemTesseract(
    imagePath: string,
    language: string = 'eng',
    preserveLayout: boolean = true
): Promise<string> {
    try {
        const outputBase = path.join(path.dirname(imagePath), path.basename(imagePath, path.extname(imagePath)));
        const outputTextPath = `${outputBase}.txt`;

        let tesseractArgs = [
            `"${imagePath}"`,
            `"${outputBase}"`,
            `-l ${language}`,
            '--psm 3', // Automatic page segmentation with OSD
            'txt'      // Output format
        ];

        if (preserveLayout) {
            tesseractArgs.push('--dpi 300');
            tesseractArgs.push('preserve_interword_spaces');
        }

        const command = `tesseract ${tesseractArgs.join(' ')}`;
        console.log(`Running Tesseract command: ${command}`);

        await execPromise(command);

        // Read the output text file
        if (existsSync(outputTextPath)) {
            const text = await readFile(outputTextPath, 'utf-8');
            return text || '';
        } else {
            throw new Error(`OCR output file not found: ${outputTextPath}`);
        }
    } catch (error) {
        console.error('OCR processing error:', error);
        return `[OCR ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
}

// Fallback OCR implementation using a simplified approach
async function fallbackOCR(imagePath: string): Promise<string> {
    try {
        // Just return a message about what would happen with real OCR
        return `[OCR would process image: ${path.basename(imagePath)}]
         
For full OCR functionality, please install Tesseract OCR on your server:
- Linux: sudo apt-get install tesseract-ocr
- macOS: brew install tesseract
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

Additional languages can be installed with:
- Linux: sudo apt-get install tesseract-ocr-[lang]
- macOS: brew install tesseract-lang
- Windows: Download language data from https://github.com/tesseract-ocr/tessdata

This is a placeholder for actual OCR text extraction.`;
    } catch (error) {
        console.error('Fallback OCR error:', error);
        return '[OCR processing unavailable]';
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting OCR text extraction process...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for compression operation');
            const validation = await validateApiKey(apiKey, 'ocr');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'ocr');
            }
        }
        await ensureDirectories();

        // Process form data
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
                { error: 'Only PDF files can be processed for OCR' },
                { status: 400 }
            );
        }

        // Get options
        const language = formData.get('language') as string || 'eng';
        const pageRange = formData.get('pageRange') as string || 'all';
        const pages = formData.get('pages') as string || '';
        const preserveLayout = formData.get('preserveLayout') === 'true';

        // Create unique session ID for this processing job
        const sessionId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);
        const outputTextPath = join(OCR_DIR, `${sessionId}-text.txt`);
        const tempSessionDir = join(TEMP_DIR, sessionId);

        // Create temp directory for this session
        await mkdir(tempSessionDir, { recursive: true });

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        console.log(`File saved to ${inputPath}`);

        // Load the PDF to get total pages
        const pdfBytes = await readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // Determine which pages to process
        let pagesToProcess: number[] = [];

        if (pageRange === 'specific' && pages) {
            pagesToProcess = parsePageRanges(pages, totalPages);
        } else {
            // Process all pages by default
            pagesToProcess = Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Limit number of pages for free users
        const maxPages = 20; // Lower limit for testing
        if (pagesToProcess.length > maxPages) {
            pagesToProcess = pagesToProcess.slice(0, maxPages);
            console.log(`Limiting to first ${maxPages} pages`);
        }

        if (pagesToProcess.length === 0) {
            return NextResponse.json(
                { error: 'No valid pages to process' },
                { status: 400 }
            );
        }

        console.log(`Processing ${pagesToProcess.length} pages: ${pagesToProcess.join(', ')}`);

        // Convert PDF pages to images
        const imagePaths = await pdfToImages(inputPath, tempSessionDir, pagesToProcess);
        console.log(`Created ${imagePaths.length} images for OCR processing`);

        // Check if system Tesseract is available
        const hasTesseract = await isTesseractInstalled();

        // Process each image with OCR
        const textResults: { text: string, pageNumber: number }[] = [];

        for (let i = 0; i < imagePaths.length; i++) {
            const imagePath = imagePaths[i];
            const pageNumber = pagesToProcess[i];

            console.log(`Processing page ${pageNumber}...`);

            let extractedText = '';
            if (hasTesseract) {
                // Use system Tesseract
                extractedText = await processImageWithSystemTesseract(
                    imagePath,
                    language,
                    preserveLayout
                );
            } else {
                // Use fallback (or you could integrate with Tesseract.js here)
                extractedText = await fallbackOCR(imagePath);
            }

            textResults.push({
                text: extractedText,
                pageNumber
            });
        }

        // Combine results from all pages
        const combinedText = textResults
            .sort((a, b) => a.pageNumber - b.pageNumber)
            .map(result => {
                if (textResults.length > 1) {
                    // Add page number headers if we processed multiple pages
                    return `==== Page ${result.pageNumber} ====\n\n${result.text}\n\n`;
                }
                return result.text;
            })
            .join('\n');

        // Save the text file
        await writeFile(outputTextPath, combinedText);
        console.log(`Saved extracted text to ${outputTextPath}`);

        // Count words for statistics
        const wordCount = combinedText.split(/\s+/).filter(Boolean).length;

        // Create response with text and file info
        const fileUrl = `/ocr/${path.basename(outputTextPath)}`;

        return NextResponse.json({
            success: true,
            message: 'OCR text extraction completed successfully',
            text: combinedText,
            fileUrl,
            filename: path.basename(outputTextPath),
            originalName: file.name,
            pagesProcessed: pagesToProcess.length,
            totalPages,
            wordCount,
            useSystemTesseract: hasTesseract
        });
    } catch (error) {
        console.error('OCR extraction error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during OCR processing',
                success: false
            },
            { status: 500 }
        );
    }
}