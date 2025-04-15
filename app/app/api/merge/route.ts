// app/api/merge/route.ts
import { NextRequest } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execAsync = promisify(exec);
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MERGE_DIR = join(process.cwd(), 'public', 'merges');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(MERGE_DIR)) {
        await mkdir(MERGE_DIR, { recursive: true });
    }
}

// Merge PDFs using qpdf with improved error handling
async function mergePdfsWithQpdf(inputPaths: string[], outputPath: string): Promise<boolean> {
    try {
        console.log('Merging PDFs with qpdf...');

        // Validate input paths
        if (inputPaths.length === 0) {
            throw new Error('No input PDFs provided');
        }

        // For large merges, use a two-stage approach to minimize memory usage
        if (inputPaths.length > 10) {
            console.log(`Large merge with ${inputPaths.length} files, using staged approach...`);
            
            // Create temporary directory for intermediate merges
            const tempDir = join(UPLOAD_DIR, `merge-temp-${uuidv4()}`);
            if (!existsSync(tempDir)) {
                await mkdir(tempDir, { recursive: true });
            }
            
            try {
                // Split into batches of 5 files
                const batchSize = 5;
                const tempFiles = [];
                
                // Process each batch
                for (let i = 0; i < inputPaths.length; i += batchSize) {
                    const batchFiles = inputPaths.slice(i, i + batchSize);
                    const batchOutputPath = join(tempDir, `batch-${i}.pdf`);
                    
                    // Merge this batch
                    const escapedPaths = batchFiles.map(path => `"${path}"`).join(' ');
                    const batchCommand = `qpdf --empty --pages ${escapedPaths} -- "${batchOutputPath}"`;
                    
                    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(inputPaths.length/batchSize)}...`);
                    await execAsync(batchCommand);
                    
                    tempFiles.push(batchOutputPath);
                }
                
                // Final merge of all batches
                console.log(`Merging ${tempFiles.length} batches to final output...`);
                const escapedTempPaths = tempFiles.map(path => `"${path}"`).join(' ');
                const finalCommand = `qpdf --empty --pages ${escapedTempPaths} -- "${outputPath}"`;
                await execAsync(finalCommand);
                
                // Verify the output was created
                return existsSync(outputPath);
            } finally {
                // Clean up temp files
                for (const tempFile of await readdir(tempDir)) {
                    try {
                        await unlink(join(tempDir, tempFile));
                    } catch (error) {
                        console.warn(`Failed to clean up temp file: ${tempFile}`, error);
                    }
                }
                
                try {
                    await rmdir(tempDir);
                } catch (error) {
                    console.warn(`Failed to clean up temp directory: ${tempDir}`, error);
                }
            }
        } else {
            // For smaller merges, use single command
            // Escape input paths to handle spaces or special characters
            const escapedPaths = inputPaths.map(path => `"${path}"`).join(' ');

            // Construct qpdf command
            const command = `qpdf --empty --pages ${escapedPaths} -- "${outputPath}"`;

            // Execute qpdf command
            await execAsync(command);
            
            return existsSync(outputPath);
        }
    } catch (error) {
        console.error('qpdf merge error:', error);
        throw new Error('Failed to merge PDFs: ' + (error instanceof Error ? error.message : String(error)));
    }
}

// Import file system functions needed for cleanup
import { readdir, unlink, rmdir } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF merge process...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for merge operation');
            const validation = await validateApiKey(apiKey, 'merge');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return new Response(
                    JSON.stringify({ error: validation.error || 'Invalid API key' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'merge');
            }
        }
        
        await ensureDirectories();

        // Process form data in a memory-efficient way
        const formData = await request.formData();

        // Get all files from the formData
        const files = formData.getAll('files');

        console.log(`Received ${files.length} files for merging`);

        if (!files || files.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No PDF files provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (files.length < 2) {
            return new Response(
                JSON.stringify({ error: 'At least two PDF files are required for merging' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get order information if provided
        let fileOrder: number[] = [];
        const orderParam = formData.get('order');

        if (orderParam) {
            try {
                fileOrder = JSON.parse(orderParam as string) as number[];
                // Validate the order array
                if (!Array.isArray(fileOrder) ||
                    fileOrder.length !== files.length ||
                    !fileOrder.every(i => typeof i === 'number' && i >= 0 && i < files.length)) {
                    fileOrder = []; // Use default order if invalid
                }
            } catch (e) {
                console.error('Invalid order parameter:', e);
                fileOrder = []; // Use default order
            }
        }

        // If no valid order provided, use sequential order
        if (fileOrder.length === 0) {
            fileOrder = Array.from({ length: files.length }, (_, i) => i);
        }

        // Create unique ID for this merge operation
        const uniqueId = uuidv4();
        const inputPaths: string[] = [];

        // Write each file to disk sequentially to reduce memory pressure
        for (let i = 0; i < files.length; i++) {
            const file = files[i] as File;

            if (!file || !file.name) {
                console.error(`File at index ${i} is invalid or missing name property`);
                continue;
            }

            // Verify it's a PDF
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                return new Response(
                    JSON.stringify({ error: `File "${file.name}" is not a PDF` }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const inputPath = join(UPLOAD_DIR, `${uniqueId}-input-${i}.pdf`);
            
            // Read and write file in a way that doesn't hold the entire file in memory
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(inputPath, buffer);
            inputPaths.push(inputPath);
            console.log(`Saved file "${file.name}" to ${inputPath}`);
        }

        if (inputPaths.length < 2) {
            return new Response(
                JSON.stringify({ error: 'Failed to process all input files' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create output path
        const outputFileName = `${uniqueId}-merged.pdf`;
        const outputPath = join(MERGE_DIR, outputFileName);

        // Order the input paths according to fileOrder
        const orderedInputPaths = fileOrder.map(i => inputPaths[i]);

        console.log(`Merging ${files.length} PDF files in specified order`);

        // Merge with qpdf with improved handling
        let mergeSuccess = false;
        try {
            mergeSuccess = await mergePdfsWithQpdf(orderedInputPaths, outputPath);
        } catch (error) {
            console.error('qpdf merge failed:', error);
            throw new Error('PDF merging failed');
        }

        // Verify the output file exists
        if (!mergeSuccess || !existsSync(outputPath)) {
            throw new Error(`Merged file was not created at ${outputPath}`);
        }

        // Get merged file size
        const mergedBuffer = await readFile(outputPath);
        const mergedSize = mergedBuffer.length;

        // Calculate total size of input files
        let totalInputSize = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i] as File;
            if (file && file.size) {
                totalInputSize += file.size;
            }
        }

        // Create relative URL for the merged file using the file API
        const fileUrl = `/api/file?folder=merges&filename=${outputFileName}`;

        // Clean up input files
        for (const inputPath of inputPaths) {
            try {
                await unlink(inputPath);
            } catch (error) {
                console.warn(`Failed to clean up input file ${inputPath}:`, error);
            }
        }

        // Return a proper JSON response using the Response API
        return new Response(
            JSON.stringify({
                success: true,
                message: 'PDF merge successful',
                fileUrl,
                filename: outputFileName,
                mergedSize,
                totalInputSize,
                fileCount: files.length
            }),
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    } catch (error) {
        console.error('Merge error:', error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'An unknown error occurred during merging',
                success: false
            }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
}