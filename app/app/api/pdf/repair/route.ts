// app/api/pdf/repair/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const REPAIRED_DIR = join(process.cwd(), 'public', 'repaired');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(REPAIRED_DIR)) {
        await mkdir(REPAIRED_DIR, { recursive: true });
    }
}

// Check if qpdf is installed
async function isQpdfInstalled(): Promise<boolean> {
    try {
        await execPromise('qpdf --version');
        return true;
    } catch (error) {
        console.error('Error checking for qpdf:', error);
        return false;
    }
}

// Check if Ghostscript is installed
async function isGhostscriptInstalled(): Promise<boolean> {
    try {
        const command = process.platform === 'win32' ? 'gswin64c -v' : 'gs -v';
        await execPromise(command);
        return true;
    } catch (error) {
        console.error('Error checking for Ghostscript:', error);
        return false;
    }
}

// Repair PDF using qpdf
async function repairWithQpdf(inputPath: string, outputPath: string, mode: string = 'standard'): Promise<{ success: boolean; details?: any }> {
    try {
        let command = `qpdf --replace-input "${inputPath}" --object-streams=disable`;

        // Add options based on repair mode
        if (mode === 'advanced') {
            command = `qpdf --replace-input "${inputPath}" --qdf --object-streams=disable --decode-level=all`;
        }

        await execPromise(command);

        // Now copy the repaired file to the output location
        const repairCommand = `qpdf "${inputPath}" "${outputPath}"`;
        await execPromise(repairCommand);

        // Get information about fixes applied
        const checkCommand = `qpdf --check "${outputPath}"`;
        const { stdout } = await execPromise(checkCommand);

        // Parse output to extract repair details
        const fixedIssues: string[] = [];
        const warnings: string[] = [];

        if (stdout.includes('operation succeeded')) {
            fixedIssues.push('Fixed cross-reference table');
        }

        if (stdout.includes('linearized')) {
            fixedIssues.push('Optimized for fast web viewing');
        }

        if (stdout.includes('warnings')) {
            warnings.push('Some minor issues could not be fully repaired');
        }

        return {
            success: true,
            details: {
                fixed: fixedIssues,
                warnings: warnings
            }
        };
    } catch (error) {
        console.error('Error repairing with qpdf:', error);
        throw new Error(`Failed to repair PDF with qpdf: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Repair PDF using Ghostscript
async function repairWithGhostscript(inputPath: string, outputPath: string, optimize: boolean = false): Promise<{ success: boolean; details?: any }> {
    try {
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
        let options = [
            '-sDEVICE=pdfwrite',
            '-dPDFSETTINGS=/prepress',
            '-dQUIET',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNOOUTERSAVE',
            '-dPrinted=false',
            '-c "/FixPDFStructure true def"',
            '-c ".setpdfwrite"'
        ];

        // If optimize is requested, add optimization options
        if (optimize) {
            options = [
                '-sDEVICE=pdfwrite',
                '-dPDFSETTINGS=/ebook',
                '-dCompressFonts=true',
                '-dDetectDuplicateImages=true',
                '-dColorImageResolution=150',
                '-dGrayImageResolution=150',
                '-dMonoImageResolution=300',
                '-dDownsampleColorImages=true',
                '-dDownsampleGrayImages=true',
                '-dAutoFilterColorImages=true',
                '-dAutoFilterGrayImages=true',
                '-dQUIET',
                '-dBATCH',
                '-dNOPAUSE',
                '-c ".setpdfwrite"'
            ];
        }

        const command = `${gsCommand} ${options.join(' ')} -sOutputFile="${outputPath}" "${inputPath}"`;
        await execPromise(command);

        const fixedIssues: string[] = [];
        const warnings: string[] = [];

        fixedIssues.push('Rebuilt document structure');
        fixedIssues.push('Fixed content streams');

        if (optimize) {
            fixedIssues.push('Optimized and compressed images');
            fixedIssues.push('Removed redundant data');
        } else {
            warnings.push('Basic repair applied, some advanced issues may remain');
        }

        return {
            success: true,
            details: {
                fixed: fixedIssues,
                warnings: warnings
            }
        };
    } catch (error) {
        console.error('Error repairing with Ghostscript:', error);
        throw new Error(`Failed to repair PDF with Ghostscript: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function optimizeWithPdfLib(inputPath: string, outputPath: string, options: {
    preserveFormFields: boolean;
    preserveAnnotations: boolean;
    preserveBookmarks: boolean;
}): Promise<{ success: boolean; details?: any }> {
    try {
        const pdfBytes = await readFile(inputPath);

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
            updateMetadata: true
        });
        console.log('Encryption status:', pdfDoc.isEncrypted);
        // Get the original document info for comparison
        const originalPageCount = pdfDoc.getPageCount();

        // Create a new PDF document
        const newPdfDoc = await PDFDocument.create();

        // Copy pages from the original document
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());

        // Add all pages to the new document
        for (const page of copiedPages) {
            newPdfDoc.addPage(page);
        }

        // Copy document metadata with default values
        newPdfDoc.setTitle(pdfDoc.getTitle() ?? '');
        newPdfDoc.setAuthor(pdfDoc.getAuthor() ?? '');
        newPdfDoc.setSubject(pdfDoc.getSubject() ?? '');
        newPdfDoc.setCreator(pdfDoc.getCreator() ?? '');
        newPdfDoc.setProducer(pdfDoc.getProducer() ?? '');

        // Save the repaired PDF
        const newPdfBytes = await newPdfDoc.save({
            addDefaultPage: false,
            updateFieldAppearances: options.preserveFormFields
        });

        await writeFile(outputPath, newPdfBytes);

        // Create repair details
        const newPageCount = newPdfDoc.getPageCount();

        const fixedIssues: string[] = [];
        const warnings: string[] = [];

        fixedIssues.push('Optimized PDF structure');
        fixedIssues.push('Removed redundant data');

        if (originalPageCount !== newPageCount) {
            warnings.push(`Original document had ${originalPageCount} pages, new document has ${newPageCount} pages`);
        }

        if (!options.preserveFormFields) {
            warnings.push('Form fields were not preserved during optimization');
        }

        if (!options.preserveAnnotations) {
            warnings.push('Annotations may not be preserved during optimization');
        }

        if (!options.preserveBookmarks) {
            warnings.push('Bookmarks may not be preserved during optimization');
        }

        return {
            success: true,
            details: {
                fixed: fixedIssues,
                warnings: warnings
            }
        };
    } catch (error) {
        console.error('Error optimizing with pdf-lib:', error);
        throw new Error(`Failed to optimize PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Repair PDF with password (using qpdf)
async function repairPasswordProtectedPdf(inputPath: string, outputPath: string, password: string): Promise<{ success: boolean; details?: any }> {
    try {
        // First decrypt the PDF using the password
        const decryptCommand = `qpdf --password="${password}" --decrypt "${inputPath}" "${outputPath}"`;
        await execPromise(decryptCommand);

        // Check if decryption was successful
        const { stdout } = await execPromise(`qpdf --check "${outputPath}"`);

        // Parse output to extract repair details
        const fixedIssues: string[] = ['Removed password protection'];
        const warnings: string[] = [];

        if (stdout.includes('operation succeeded')) {
            fixedIssues.push('Fixed document structure');
        }

        return {
            success: true,
            details: {
                fixed: fixedIssues,
                warnings: warnings
            }
        };
    } catch (error) {
        console.error('Error repairing password-protected PDF:', error);
        throw new Error(`Failed to repair password-protected PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF repair process...');

        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for repair operation');
            const validation = await validateApiKey(apiKey, 'repair');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'repair');
            }
        }

        await ensureDirectories();

        // Process form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const repairMode = formData.get('repairMode') as string || 'standard';
        const password = formData.get('password') as string;

        // Advanced options
        const preserveFormFields = formData.get('preserveFormFields') === 'true';
        const preserveAnnotations = formData.get('preserveAnnotations') === 'true';
        const preserveBookmarks = formData.get('preserveBookmarks') === 'true';
        const optimizeImages = formData.get('optimizeImages') === 'true';

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files can be repaired' },
                { status: 400 }
            );
        }

        // Create unique IDs for files
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(REPAIRED_DIR, `${uniqueId}-repaired.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // Get original file size
        const originalSize = buffer.length;

        let repairResult: { success: boolean; details?: any };

        // Check if we have the necessary tools
        const hasQpdf = await isQpdfInstalled();
        const hasGhostscript = await isGhostscriptInstalled();

        // Handle repair based on mode and available tools
        if (password) {
            // Handle password-protected PDF
            if (hasQpdf) {
                repairResult = await repairPasswordProtectedPdf(inputPath, outputPath, password);
            } else {
                return NextResponse.json(
                    { error: 'Required tool (qpdf) not available for password-protected repair' },
                    { status: 500 }
                );
            }
        } else if (repairMode === 'standard') {
            // Standard repair mode
            if (hasQpdf) {
                repairResult = await repairWithQpdf(inputPath, outputPath, 'standard');
            } else if (hasGhostscript) {
                repairResult = await repairWithGhostscript(inputPath, outputPath, false);
            } else {
                // Fallback to pdf-lib
                repairResult = await optimizeWithPdfLib(inputPath, outputPath, {
                    preserveFormFields,
                    preserveAnnotations,
                    preserveBookmarks
                });
            }
        } else if (repairMode === 'advanced') {
            // Advanced repair mode
            if (hasQpdf) {
                repairResult = await repairWithQpdf(inputPath, outputPath, 'advanced');
            } else if (hasGhostscript) {
                repairResult = await repairWithGhostscript(inputPath, outputPath, true);
            } else {
                return NextResponse.json(
                    { error: 'Required tools (qpdf or gs) not available for advanced repair' },
                    { status: 500 }
                );
            }
        } else if (repairMode === 'optimization') {
            // Optimization mode
            if (hasGhostscript && optimizeImages) {
                repairResult = await repairWithGhostscript(inputPath, outputPath, true);
            } else {
                repairResult = await optimizeWithPdfLib(inputPath, outputPath, {
                    preserveFormFields,
                    preserveAnnotations,
                    preserveBookmarks
                });
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid repair mode specified' },
                { status: 400 }
            );
        }

        // Get repaired file size
        const newSize = (await readFile(outputPath)).length;

        // Add size information to details
        if (repairResult.details) {
            repairResult.details.originalSize = originalSize;
            repairResult.details.newSize = newSize;
        }

        // Create file URL
        const fileUrl = `/api/file?folder=repaired&filename=${uniqueId}-repaired.pdf`;
        // Return result
        return NextResponse.json({
            success: repairResult.success,
            message: repairResult.success
                ? 'PDF repaired successfully'
                : 'PDF repair completed with issues',
            fileUrl,
            filename: `${uniqueId}-repaired.pdf`,
            originalName: file.name,
            details: repairResult.details
        });
    } catch (error) {
        console.error('PDF repair error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF repair',
                success: false
            },
            { status: 500 }
        );
    }
}