// app/api/pdf/unlock/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure directory exists
async function ensureDirectory() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
}
async function checkIfPasswordProtected(inputPath: string): Promise<boolean> {
    try {
        // Try with qpdf first (most reliable)
        try {
            const { stdout, stderr } = await execPromise(`qpdf --check "${inputPath}"`);
            console.log('qpdf stdout:', stdout);
            console.log('qpdf stderr:', stderr);

            // Look for explicit password requirement
            if (stderr && stderr.toLowerCase().includes('password required')) {
                return true;
            }
            // Check if encrypted AND requires a password
            if (stdout && stdout.toLowerCase().includes('encrypted')) {
                try {
                    await execPromise(`qpdf --decrypt "${inputPath}" "${inputPath}.tmp.pdf"`);
                    await execPromise(`rm "${inputPath}.tmp.pdf"`); // Clean up (use `del` on Windows)
                    return false; // Decrypt succeeded without password, so not protected
                } catch {
                    return true; // Decrypt failed, likely password-protected
                }
            }
            return false; // No encryption or password required
        } catch (qpdfError: any) {
            console.log('qpdf error:', qpdfError.message);
            if (qpdfError.message && qpdfError.message.includes('password')) {
                return true; // qpdf explicitly says password needed
            }

            // Fallback to pdfinfo
            try {
                const { stdout } = await execPromise(`pdfinfo "${inputPath}"`);
                console.log('pdfinfo stdout:', stdout);
                const encryptedLine = stdout.split('\n').find(line => line.includes('Encrypted'));
                if (encryptedLine) {
                    return encryptedLine.includes('yes'); // Only true if "Encrypted: yes"
                }
                return false; // No encryption or "Encrypted: no"
            } catch (pdfInfoError: any) {
                console.log('pdfinfo error:', pdfInfoError.message);
                return false; // Default to false if pdfinfo fails
            }
        }
    } catch (error) {
        console.error('Unexpected error checking PDF:', error);
        return false; // Default to false on unexpected errors
    }
}

// Updated POST handler
export async function POST(request: NextRequest) {
    try {
        console.log('Checking if PDF is password protected...');
        // ... (API key validation code remains unchanged)

        await ensureDirectory();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files can be checked' },
                { status: 400 }
            );
        }

        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-check.pdf`);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        const isPasswordProtected = await checkIfPasswordProtected(inputPath);

        return NextResponse.json({
            success: true,
            isPasswordProtected,
            message: isPasswordProtected
                ? 'This PDF appears to be password protected'
                : 'This PDF is not password protected'
        });
    } catch (error) {
        console.error('PDF check error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF check',
                success: false
            },
            { status: 500 }
        );
    }
}
