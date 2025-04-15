import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink, readdir, copyFile, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
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

// Check if python is installed and accessible
async function isPythonInstalled(): Promise<boolean> {
    try {
        await execPromise('python3 --version');
        return true;
    } catch (error) {
        try {
            await execPromise('python --version');
            return true;
        } catch (error) {
            console.error('Python is not installed or not in the PATH');
            return false;
        }
    }
}

// Run OCR on a PDF file using the Python script
async function runOcrOnPdf(inputPath: string, outputPath: string, language: string = 'eng', enhanceScanned: boolean = true): Promise<boolean> {
    try {
        // Determine which Python executable to use
        let pythonExec = 'python3';
        try {
            await execPromise('python3 --version');
        } catch (error) {
            pythonExec = 'python';
        }

        // Find the OCR script path
        const scriptPath = path.join(process.cwd(), 'scripts', 'ocr.py');

        // Add enhancement flag if enabled
        const enhanceFlag = enhanceScanned ? '--enhance' : '';

        console.log(`Running OCR with command: ${pythonExec} "${scriptPath}" "${inputPath}" "${outputPath}" "${language}" ${enhanceFlag}`);

        // Execute the OCR script
        const { stdout, stderr } = await execPromise(
            `${pythonExec} "${scriptPath}" "${inputPath}" "${outputPath}" "${language}" ${enhanceFlag}`
        );

        console.log('OCR stdout:', stdout);
        if (stderr) {
            console.error('OCR stderr:', stderr);
        }

        // Check if output file was created
        return existsSync(outputPath);
    } catch (error) {
        console.error('Error running OCR script:', error);
        return false;
    }
}

// Fallback method using pdftoppm (primary) or pdftocairo (fallback) and tesseract
async function fallbackOcrMethod(inputPath: string, outputPath: string, language: string = 'eng'): Promise<boolean> {
    try {
        console.log('Attempting fallback OCR method using pdftoppm and tesseract');

        // Create a temporary directory for this operation
       const tempDir = join(TEMP_DIR, uuidv4());
        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
        }

        // Extract images from PDF using pdftoppm (part of poppler-utils)
        const imagesPrefix = join(tempDir, 'page');
        try {
            await execPromise(`pdftoppm -png -r 300 "${inputPath}" "${imagesPrefix}"`);
        } catch (error) {
            console.error('Error with pdftoppm, falling back to pdftocairo:', error);
            // Fallback to pdftocairo if pdftoppm fails
            await execPromise(`pdftocairo -png -r 300 "${inputPath}" "${imagesPrefix}"`);
        }

        // Process each page with tesseract
        const files = await readdir(tempDir);
        const pngFiles = files.filter(file => file.endsWith('.png')).sort();

        for (const pngFile of pngFiles) {
            const pngPath = join(tempDir, pngFile);
            const textPath = join(tempDir, pngFile.replace('.png', ''));

            await execPromise(`tesseract "${pngPath}" "${textPath}" -l ${language} pdf`);
        }

        // Check if any PDF files were created
        const pdfFiles = (await readdir(tempDir)).filter(file => file.endsWith('.pdf')).sort();

        if (pdfFiles.length === 0) {
            console.error('No PDF files created during fallback OCR process');
            return false;
        }

        // If only one page, copy it to the output path
        if (pdfFiles.length === 1) {
            await copyFile(join(tempDir, pdfFiles[0]), outputPath);
            return true;
        }

        // Merge the PDFs using ghostscript or qpdf
        try {
            // Try with ghostscript first
            const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
            const pdfFilePaths = pdfFiles.map(file => `"${join(tempDir, file)}"`).join(' ');

            await execPromise(`${gsCommand} -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile="${outputPath}" ${pdfFilePaths}`);

            if (existsSync(outputPath)) {
                return true;
            }
        } catch (error) {
            console.error('Error merging PDFs with ghostscript:', error);

            // Try with qpdf as fallback
            try {
                let mergeCommand = `qpdf --empty --pages `;
                pdfFiles.forEach(file => {
                    mergeCommand += `"${join(tempDir, file)}" `;
                });
                mergeCommand += `-- "${outputPath}"`;

                await execPromise(mergeCommand);

                if (existsSync(outputPath)) {
                    return true;
                }
            } catch (error) {
                console.error('Error merging PDFs with qpdf:', error);
            }
        }

        return false;
    } catch (error) {
        console.error('Error in fallback OCR method:', error);
        return false;
    } finally {
        const tempDir = join(TEMP_DIR, uuidv4());
        try {
            if (existsSync(tempDir)) {
                const files = await readdir(tempDir);
                for (const file of files) {
                    await unlink(join(tempDir, file));
                }
                await rmdir(tempDir);
            }
        } catch (cleanupError) {
            console.error('Error cleaning up temporary directory:', cleanupError);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting OCR processing...');

        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for OCR operation');
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
                { error: 'Only PDF files can be processed' },
                { status: 400 }
            );
        }

        // Get options
        const language = formData.get('language') as string || 'eng';
        const enhanceScanned = formData.get('enhanceScanned') === 'true';
        const preserveLayout = formData.get('preserveLayout') === 'true';

        // Create session ID and file paths
        const sessionId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);
        const outputPath = join(OCR_DIR, `${sessionId}-searchable.pdf`);

        // Write the uploaded file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`Saved uploaded file to ${inputPath}`);

        // Check if Python is installed
        const hasPython = await isPythonInstalled();
        let ocrSuccess = false;

        if (hasPython) {
            // Try using our primary OCR method with the Python script
            console.log(`Running OCR processing with language: ${language}`);
            ocrSuccess = await runOcrOnPdf(inputPath, outputPath, language, enhanceScanned);
        }

        // If primary method fails or Python is not available, try fallback method
        if (!ocrSuccess) {
            console.log('Primary OCR method failed, trying fallback method');
            ocrSuccess = await fallbackOcrMethod(inputPath, outputPath, language);
        }

        if (!ocrSuccess) {
            return NextResponse.json(
                { error: 'OCR processing failed. Please try again or check if OCR dependencies are installed.' },
                { status: 500 }
            );
        }

        // Return the result
        return NextResponse.json({
            success: true,
            message: 'OCR processing completed successfully',
            searchablePdfUrl: `/api/file?folder=ocr&filename=${path.basename(outputPath)}`,
            processedFile: file.name,
            language: language
        });

    } catch (error) {
        console.error('OCR processing error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during OCR processing',
                success: false
            },
            { status: 500 }
        );
    }
}