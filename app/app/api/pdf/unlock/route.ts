// app/api/pdf/unlock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const UNLOCKED_DIR = join(process.cwd(), 'public', 'unlocked');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(UNLOCKED_DIR)) {
        await mkdir(UNLOCKED_DIR, { recursive: true });
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF unlock process...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for compression operation');
            const validation = await validateApiKey(apiKey, 'compress');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'compress');
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
                { error: 'Only PDF files can be unlocked' },
                { status: 400 }
            );
        }

        // Get password if provided
        const password = formData.get('password') as string || undefined;

        // Create unique names for files
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(UNLOCKED_DIR, `${uniqueId}-unlocked.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // Try to unlock using different methods
        let unlockSuccess = false;
        let methodUsed = '';

        // Try qpdf first (with password if provided)
        try {
            unlockSuccess = await unlockPdfWithQpdf(inputPath, outputPath, password);
            if (unlockSuccess) {
                methodUsed = 'qpdf';
            }
        } catch (qpdfError) {
            console.log('qpdf failed, trying pdftk...');
        }

        // If qpdf fails, try pdftk
        if (!unlockSuccess) {
            try {
                unlockSuccess = await unlockPdfWithPdftk(inputPath, outputPath, password);
                if (unlockSuccess) {
                    methodUsed = 'pdftk';
                }
            } catch (pdftkError) {
                console.log('pdftk failed, trying GhostScript...');
            }
        }

        // If both password-based methods fail, try GhostScript (for non-password restrictions)
        if (!unlockSuccess && !password) {
            try {
                unlockSuccess = await unlockPdfWithGhostScript(inputPath, outputPath);
                if (unlockSuccess) {
                    methodUsed = 'ghostscript';
                }
            } catch (gsError) {
                console.log('GhostScript failed too');
            }
        }

        // If nothing works, copy the file as a fallback
        if (!unlockSuccess) {
            await writeFile(outputPath, buffer);
            methodUsed = 'copy';
            console.log('All unlock methods failed, using copy fallback');
        }

        // Create response with file info
        const fileUrl = `/unlocked/${uniqueId}-unlocked.pdf`;

        // Prepare appropriate message
        let message = "PDF unlocked successfully";
        if (methodUsed === 'copy') {
            message = "We attempted to unlock your PDF, but were unable to remove all restrictions";
        }

        return NextResponse.json({
            success: true,
            message,
            fileUrl,
            filename: `${uniqueId}-unlocked.pdf`,
            originalName: file.name,
            methodUsed
        });
    } catch (error) {
        console.error('Unlock error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF unlocking',
                success: false
            },
            { status: 500 }
        );
    }
}

// Function to unlock PDF using qpdf
async function unlockPdfWithQpdf(inputPath: string, outputPath: string, password?: string): Promise<boolean> {
    try {
        // Build the qpdf command based on whether a password was provided
        let command = password
            ? `qpdf --password="${password}" --decrypt "${inputPath}" "${outputPath}"`
            : `qpdf --decrypt "${inputPath}" "${outputPath}"`;

        // Hide the password in logs
        console.log(`Executing: ${password ? command.replace(password, '******') : command}`);

        // Execute the command
        const { stdout, stderr } = await execPromise(command);

        if (stderr && !stderr.includes('WARNING')) {
            console.error('qpdf stderr:', stderr);
        }

        if (stdout) {
            console.log('qpdf stdout:', stdout);
        }

        // Check if output file exists
        return existsSync(outputPath);
    } catch (error) {
        console.error('Error using qpdf to unlock:', error);
        return false;
    }
}

// Function to unlock PDF using pdftk
async function unlockPdfWithPdftk(inputPath: string, outputPath: string, password?: string): Promise<boolean> {
    try {
        // Build the pdftk command based on whether a password was provided
        let command = password
            ? `pdftk "${inputPath}" input_pw "${password}" output "${outputPath}" allow AllFeatures`
            : `pdftk "${inputPath}" output "${outputPath}" allow AllFeatures`;

        // Hide the password in logs
        console.log(`Executing: ${password ? command.replace(password, '******') : command}`);

        // Execute the command
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.error('pdftk stderr:', stderr);
        }

        if (stdout) {
            console.log('pdftk stdout:', stdout);
        }

        // Check if output file exists
        return existsSync(outputPath);
    } catch (error) {
        console.error('Error using pdftk to unlock:', error);
        return false;
    }
}

// Function to unlock PDF using gs (GhostScript)
async function unlockPdfWithGhostScript(inputPath: string, outputPath: string): Promise<boolean> {
    try {
        // GhostScript approach (works for PDFs with restrictions but no password)
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';

        const command = `${gsCommand} -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile="${outputPath}" -c .setpdfwrite -f "${inputPath}"`;

        console.log(`Executing GhostScript: ${command}`);

        // Execute the command
        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.error('GhostScript stderr:', stderr);
        }

        if (stdout) {
            console.log('GhostScript stdout:', stdout);
        }

        // Check if output file exists
        return existsSync(outputPath);
    } catch (error) {
        console.error('Error using GhostScript to unlock:', error);
        return false;
    }
}