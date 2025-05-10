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
        // Use pdfcpu to get info about the PDF file
        // Format: pdfcpu info inputFile
        const { stdout, stderr } = await execPromise(`pdfcpu info "${inputPath}"`);
        
        console.log('pdfcpu info stdout:', stdout);
        if (stderr) {
            console.log('pdfcpu info stderr:', stderr);
        }

        // Check if the output indicates encryption or password protection
        if (stdout.includes('Encrypted: true') || 
            stdout.includes('has UserAccess') || 
            stdout.includes('has OwnerAccess')) {
            return true;
        }
        
        // If the command failed with specific error messages that suggest password protection
        if (stderr && (
            stderr.toLowerCase().includes('password') || 
            stderr.toLowerCase().includes('encrypted') ||
            stderr.toLowerCase().includes('authentication'))) {
            return true;
        }

        // Try a second method: attempt to validate the file
        try {
            // Format: pdfcpu validate inputFile
            const validateResult = await execPromise(`pdfcpu validate "${inputPath}"`);
            console.log('pdfcpu validate result:', validateResult);
            
            // If validation succeeds without mentioning encryption, it's likely not protected
            return false;
        } catch (validateError: any) {
            console.log('pdfcpu validate error:', validateError.message);
            
            // Check if the error message indicates password protection
            if (validateError.message && (
                validateError.message.toLowerCase().includes('password') || 
                validateError.message.toLowerCase().includes('encrypted') ||
                validateError.message.toLowerCase().includes('authentication'))) {
                return true;
            }
            
            // Other validation errors don't necessarily mean password protection
            return false;
        }
    } catch (error) {
        console.error('Unexpected error checking PDF:', error);
        
        // Check if the error message suggests password protection
        if (error instanceof Error && 
            (error.message.toLowerCase().includes('password') || 
             error.message.toLowerCase().includes('encrypted') ||
             error.message.toLowerCase().includes('authentication'))) {
            return true;
        }
        
        // Default to false on other unexpected errors
        return false;
    }
}

// POST handler
export async function POST(request: NextRequest) {
    try {
        console.log('Checking if PDF is password protected...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call, validate the API key
        if (apiKey) {
            console.log('Validating API key for check operation');
            const validation = await validateApiKey(apiKey, 'unlock');  // Using 'unlock' permission

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'unlock');  // Count as part of unlock operation
            }
        }

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