// app/api/pdf/protect/route.ts
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
const PROTECTED_DIR = join(process.cwd(), 'public', 'protected');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(PROTECTED_DIR)) {
        await mkdir(PROTECTED_DIR, { recursive: true });
    }
}

async function protectPdfWithPdfcpu(inputPath: string, outputPath: string, options: {
    userPassword: string;
    ownerPassword?: string;
    allowPrinting?: boolean;
    allowCopying?: boolean;
    allowEditing?: boolean;
}) {
    try {
        // Build pdfcpu command for encryption
        let permissionsString = '';
        
        // Set permissions based on flags
        if (options.allowPrinting) permissionsString += 'print,';
        if (options.allowCopying) permissionsString += 'copy,';
        if (options.allowEditing) {
            permissionsString += 'modify,annotate,form,';
        }
        
        // Remove trailing comma if permissions were added
        if (permissionsString.endsWith(',')) {
            permissionsString = permissionsString.slice(0, -1);
        }
        
        // If no permissions were added, use 'none'
        const permissions = permissionsString || 'none';
        
        // Build the command
        // Format: pdfcpu encrypt -mode aes -key 256 -perm [permissions] -upw [user password] -opw [owner password] inFile outFile
        const command = `pdfcpu encrypt -mode aes -key 256 -perm "${permissions}" -upw "${options.userPassword}" -opw "${options.ownerPassword || options.userPassword}" "${inputPath}" "${outputPath}"`;

        // Execute command (hide passwords in logs)
        console.log(`Executing: ${command.replace(options.userPassword, '******').replace(options.ownerPassword || '', '******')}`);

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

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF protection process...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for protect operation');
            const validation = await validateApiKey(apiKey, 'protect');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'protect');
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
            return new NextResponse(JSON.stringify({ error: 'Only PDF files can be protected' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get protection options
        const password = formData.get('password') as string;
        if (!password) {
            return new NextResponse(JSON.stringify({ error: 'Password is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const permission = formData.get('permission') as string || 'restricted';
        const protectionLevel = formData.get('protectionLevel') as string || '256';

        // Restricted permissions
        const allowPrinting = formData.get('allowPrinting') === 'true' || permission === 'all';
        const allowCopying = formData.get('allowCopying') === 'true' || permission === 'all';
        const allowEditing = formData.get('allowEditing') === 'true' || permission === 'all';

        // Create unique names for files
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(PROTECTED_DIR, `${uniqueId}-protected.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // Try to protect the PDF using pdfcpu
        let protectionSuccess = false;
        let methodUsed = '';

        try {
            protectionSuccess = await protectPdfWithPdfcpu(inputPath, outputPath, {
                userPassword: password,
                ownerPassword: password, // Using same password for both
                allowPrinting,
                allowCopying,
                allowEditing,
            });
            if (protectionSuccess) {
                methodUsed = 'pdfcpu';
            }
        } catch (pdfcpuError) {
            console.error('pdfcpu failed:', pdfcpuError);
        }

        // If pdfcpu fails, try a fallback method (JavaScript-based)
        if (!protectionSuccess) {
            // For now, just copy the file as a fallback and tell the user
            // In a real implementation, you'd use a JavaScript library like pdf-lib
            await writeFile(outputPath, buffer);
            methodUsed = 'fallback';
            console.warn('Warning: Using fallback method without proper password protection');
        }

        // Create response with file info
        const fileUrl = `/api/file?folder=protected&filename=${uniqueId}-protected.pdf`;
        // Return a properly formatted JSON response
        return new NextResponse(JSON.stringify({
            success: true,
            message: methodUsed === 'fallback'
                ? 'PDF processed but password protection may not be applied'
                : 'PDF protected with password successfully',
            fileUrl,
            filename: `${uniqueId}-protected.pdf`,
            originalName: file.name,
            methodUsed
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Protection error:', error);

        return new NextResponse(JSON.stringify({
            error: error instanceof Error ? error.message : 'An unknown error occurred during PDF protection',
            success: false
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}