// app/api/pdf/crop/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const CROPPED_DIR = join(process.cwd(), 'public', 'cropped');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(CROPPED_DIR)) {
        await mkdir(CROPPED_DIR, { recursive: true });
    }
}

// Get total pages using pdfcpu
async function getTotalPages(inputPath: string): Promise<number> {
    try {
        const { stdout } = await execPromise(`pdfcpu info "${inputPath}"`);
        
        // Parse the output to find the number of pages
        const pagesMatch = stdout.match(/Page count:\s*(\d+)/);
        if (pagesMatch && pagesMatch[1]) {
            return parseInt(pagesMatch[1], 10);
        }
        
        throw new Error('Could not parse page count from pdfcpu output');
    } catch (error) {
        console.error('Error getting page count:', error);
        throw new Error(`Failed to get page count: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF crop process using pdfcpu...');

        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for crop operation');
            const validation = await validateApiKey(apiKey, 'crop');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'crop');
            }
        }

        await ensureDirectories();

        // Parse FormData from the request
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files can be cropped' }, { status: 400 });
        }

        // Get crop dimensions
        const left = parseFloat(formData.get('left') as string || '0');
        const bottom = parseFloat(formData.get('bottom') as string || '0');
        const right = parseFloat(formData.get('right') as string || '0');
        const top = parseFloat(formData.get('top') as string || '0');
        
        // Get selected pages (if any)
        const selectedPages = (formData.get('pages') as string) || '';
        
        // Check for per-page settings
        const perPageSettingsStr = formData.get('perPageSettings') as string;
        let perPageSettings: Array<{
            page: number;
            left: number;
            bottom: number;
            right: number;
            top: number;
        }> = [];
        
        if (perPageSettingsStr) {
            try {
                perPageSettings = JSON.parse(perPageSettingsStr);
                console.log(`Received per-page settings for ${perPageSettings.length} pages`);
            } catch (error) {
                console.error('Error parsing perPageSettings:', error);
                // Continue with regular processing if parsing fails
            }
        }

        // Generate unique file names
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(CROPPED_DIR, `${uniqueId}-cropped.pdf`);

        // Save the uploaded PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`PDF saved to ${inputPath}`);

        // Get total pages
        const pageCount = await getTotalPages(inputPath);
        console.log(`PDF has ${pageCount} pages`);

        // Process cropping
        let success = false;
        
        if (perPageSettings.length > 0) {
            // Handle per-page cropping
            console.log('Processing per-page crop settings');
            
            // First, create a temporary copy of the input PDF
            const tempInputPath = join(UPLOAD_DIR, `${uniqueId}-temp.pdf`);
            await copyFile(inputPath, tempInputPath);
            let currentInputPath = tempInputPath;
            
            // Process each page with its own settings
            for (let i = 0; i < perPageSettings.length; i++) {
                const { page, left, bottom, right, top } = perPageSettings[i];
                const pageStr = page.toString();
                const cropDescription = `${left} ${bottom} ${right} ${top}`;
                
                // Create a temporary output path for this iteration
                const tempOutputPath = i === perPageSettings.length - 1 
                    ? outputPath  // Use final output path for last page
                    : join(UPLOAD_DIR, `${uniqueId}-temp-${i}.pdf`);
                
                // Build the pdfcpu crop command for this page
                const command = `pdfcpu crop -pages ${pageStr} -- "${cropDescription}" "${currentInputPath}" "${tempOutputPath}"`;
                console.log(`Executing crop for page ${pageStr}: ${command}`);
                
                try {
                    const { stdout, stderr } = await execPromise(command);
                    if (stdout.trim()) {
                        console.log(`pdfcpu stdout (page ${pageStr}):`, stdout);
                    }
                    if (stderr) {
                        console.warn(`pdfcpu stderr (page ${pageStr}):`, stderr);
                    }
                    
                    // For next iteration, use the current output as input
                    if (i < perPageSettings.length - 1) {
                        currentInputPath = tempOutputPath;
                    }
                    
                    success = true;
                } catch (error) {
                    console.error(`Crop operation error for page ${pageStr}:`, error);
                    throw new Error(`pdfcpu crop failed for page ${pageStr}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            
            // Clean up temporary files
            try {
                await unlink(tempInputPath);
                for (let i = 0; i < perPageSettings.length - 1; i++) {
                    const tempPath = join(UPLOAD_DIR, `${uniqueId}-temp-${i}.pdf`);
                    if (existsSync(tempPath)) {
                        await unlink(tempPath);
                    }
                }
            } catch (cleanupError) {
                console.warn('Error cleaning up temporary files:', cleanupError);
            }
        } else {
            // Create the crop box description string for pdfcpu
            // Format: left, bottom, right, top (points)
            // Note: The crop coordinates in pdfcpu are relative to the media box
            const cropDescription = `${left} ${bottom} ${right} ${top}`;
            console.log(`Crop box: ${cropDescription}`);

            // Build the pdfcpu crop command
            let command = `pdfcpu crop`;
            
            // Add pages parameter if specified
            if (selectedPages && selectedPages.trim() !== '') {
                command += ` -pages ${selectedPages}`;
            }
            
            // Complete the command with crop description and file paths
            command += ` -- "${cropDescription}" "${inputPath}" "${outputPath}"`;
            
            console.log(`Executing: ${command}`);
            
            // Execute the command
            try {
                const { stdout, stderr } = await execPromise(command);
                if (stdout.trim()) {
                    console.log('pdfcpu stdout:', stdout);
                }
                if (stderr) {
                    console.warn('pdfcpu stderr:', stderr);
                }
                success = true;
            } catch (error) {
                console.error('Crop operation error:', error);
                throw new Error(`pdfcpu crop failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        console.log(`Cropped PDF saved to ${outputPath}`);

        // Clean up input file
        try {
            await unlink(inputPath);
            console.log(`Deleted input file: ${inputPath}`);
        } catch (error) {
            console.warn(`Failed to delete input file ${inputPath}:`, error);
        }

        // Return success response with the file URL
        return NextResponse.json({
            success: true,
            message: 'PDF cropped successfully',
            fileUrl: `/api/file?folder=cropped&filename=${uniqueId}-cropped.pdf`,
            fileName: `${uniqueId}-cropped.pdf`,
            originalName: file.name,
            cropBox: {
                left,
                bottom,
                right,
                top
            },
            pageCount
        });

    } catch (error) {
        console.error('PDF crop error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF cropping',
                success: false
            },
            { status: 500 }
        );
    }
}