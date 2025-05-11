// app/api/pdf/unlock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

async function unlockPdfWithPdfcpu(inputPath: string, outputPath: string, password: string) {
    try {
        // pdfcpu decrypt command
        // Format: pdfcpu decrypt -upw password inputFile outputFile
        const command = `pdfcpu decrypt -upw "${password}" "${inputPath}" "${outputPath}"`;

        // Execute command (hide password in logs)
        console.log(`Executing: ${command.replace(password, '******')}`);

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.error('pdfcpu stderr:', stderr);
        }

        if (stdout) {
            console.log('pdfcpu stdout:', stdout);
        }

        return existsSync(outputPath);
    } catch (error) {
        console.error('Error using pdfcpu:', error);
        return false;
    }
}

// Try with owner password if user password fails
async function unlockPdfWithPdfcpuOwner(inputPath: string, outputPath: string, password: string) {
    try {
        // pdfcpu decrypt command with owner password flag
        // Format: pdfcpu decrypt -opw password inputFile outputFile
        const command = `pdfcpu decrypt -opw "${password}" "${inputPath}" "${outputPath}"`;

        // Execute command (hide password in logs)
        console.log(`Executing with owner password: ${command.replace(password, '******')}`);

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
            console.error('pdfcpu owner stderr:', stderr);
        }

        if (stdout) {
            console.log('pdfcpu owner stdout:', stdout);
        }

        return existsSync(outputPath);
    } catch (error) {
        console.error('Error using pdfcpu with owner password:', error);
        return false;
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
            console.log('Validating API key for unlock operation');
            const validation = await validateApiKey(apiKey, 'unlock');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'unlock');
            }
        }
        await ensureDirectories();

        // Process form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new NextResponse(JSON.stringify({ error: 'No PDF file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return new NextResponse(JSON.stringify({ error: 'Only PDF files can be unlocked' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get password
        const password = formData.get('password') as string;
        if (!password) {
            return new NextResponse(JSON.stringify({ error: 'Password is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create unique names for files
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-protected.pdf`);
        const outputPath = join(UNLOCKED_DIR, `${uniqueId}-unlocked.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // Try to unlock the PDF using pdfcpu
        let unlockSuccess = false;
        let methodUsed = '';

        // First try with user password
        try {
            unlockSuccess = await unlockPdfWithPdfcpu(inputPath, outputPath, password);
            if (unlockSuccess) {
                methodUsed = 'pdfcpu-user';
            }
        } catch (pdfcpuError) {
            console.error('pdfcpu with user password failed:', pdfcpuError);
        }

        // If user password fails, try with owner password
        if (!unlockSuccess) {
            try {
                unlockSuccess = await unlockPdfWithPdfcpuOwner(inputPath, outputPath, password);
                if (unlockSuccess) {
                    methodUsed = 'pdfcpu-owner';
                }
            } catch (pdfcpuOwnerError) {
                console.error('pdfcpu with owner password failed:', pdfcpuOwnerError);
            }
        }

        // If both attempts fail, try checking if the file is already unprotected
        if (!unlockSuccess) {
            try {
                // In this case, we'll just copy the file since it might not be password-protected
                await writeFile(outputPath, buffer);
                unlockSuccess = true;
                methodUsed = 'copy';
                console.warn('Warning: File may not have been password-protected, or password is incorrect');
            } catch (fallbackError) {
                console.error('Fallback method failed:', fallbackError);
            }
        }

        if (!unlockSuccess) {
            return new NextResponse(JSON.stringify({
                success: false,
                error: 'Failed to unlock PDF. The password may be incorrect.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create response with file info
        const fileUrl = `/api/file?folder=unlocked&filename=${uniqueId}-unlocked.pdf`;
        // Return a properly formatted JSON response
        return new NextResponse(JSON.stringify({
            success: true,
            message: methodUsed === 'copy'
                ? 'PDF processed, but it may not have been password-protected'
                : 'PDF unlocked successfully',
            fileUrl,
            filename: `${uniqueId}-unlocked.pdf`,
            originalName: file.name.replace('.pdf', '-unlocked.pdf'),
            methodUsed
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Unlock error:', error);

        return new NextResponse(JSON.stringify({
            error: error instanceof Error ? error.message : 'An unknown error occurred during PDF unlocking',
            success: false
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}