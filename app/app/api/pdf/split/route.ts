// app/api/pdf/split/route.ts
import { NextRequest } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

// Promisify exec for async/await
const execAsync = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const SPLIT_DIR = join(process.cwd(), 'public', 'splits');
const STATUS_DIR = join(process.cwd(), 'public', 'status');

// Ensure directories exist
async function ensureDirectories() {
    const dirs = [UPLOAD_DIR, SPLIT_DIR, STATUS_DIR];
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
}

// Parse page ranges from string format
function parsePageRanges(pagesString: string, totalPages: number): number[][] {
    const result: number[][] = [];

    // Split by commas
    const parts = pagesString.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        // Check if it's a range (contains '-')
        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr.trim());
            const end = parseInt(endStr.trim());

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                // Add all pages in range (ensure within document bounds)
                const pagesInRange: number[] = [];
                for (let i = start; i <= Math.min(end, totalPages); i++) {
                    if (i > 0) {
                        pagesInRange.push(i);
                    }
                }
                if (pagesInRange.length > 0) {
                    result.push(pagesInRange);
                }
            }
        } else {
            // Single page number
            const pageNum = parseInt(trimmedPart);
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                result.push([pageNum]);
            }
        }
    }

    return result;
}

// Get total pages using qpdf
async function getTotalPages(inputPath: string): Promise<number> {
    try {
        const { stdout } = await execAsync(`qpdf --show-npages "${inputPath}"`);
        return parseInt(stdout.trim(), 10);
    } catch (error) {
        throw new Error(`Failed to get page count: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Process a single PDF split
async function processOneSplit(
    inputPath: string,
    pages: number[],
    outputFileName: string,
    outputPath: string
): Promise<{
    fileUrl: string;
    filename: string;
    pages: number[];
    pageCount: number;
}> {
    // Convert page numbers to qpdf range format
    const pageRange = pages.length === 1
        ? `${pages[0]}`
        : `${pages[0]}-${pages[pages.length - 1]}`;

    // Construct qpdf command
    const command = `qpdf "${inputPath}" --pages . ${pageRange} -- "${outputPath}"`;

    // Execute qpdf command
    await execAsync(command);

    return {
        fileUrl: `/api/file?folder=splits&filename=${outputFileName}`,
        filename: outputFileName,
        pages: pages,
        pageCount: pages.length
    };
}

// Process PDF splitting in the background
async function processSplitsInBackground(
    sessionId: string,
    inputPath: string,
    pageSets: number[][]
): Promise<void> {
    try {
        // Create status file with initial state
        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        const initialStatus = {
            id: sessionId,
            status: 'processing',
            progress: 0,
            total: pageSets.length,
            completed: 0,
            results: [],
            error: null
        };
        await writeFile(statusPath, JSON.stringify(initialStatus));

        // Process in smaller batches
        const batchSize = 5;
        const results = [];

        for (let i = 0; i < pageSets.length; i += batchSize) {
            // Process a batch of splits
            const batch = pageSets.slice(i, Math.min(i + batchSize, pageSets.length));
            const batchPromises = batch.map(async (pages, batchIndex) => {
                const index = i + batchIndex;
                const outputFileName = `${sessionId}-split-${index + 1}.pdf`;
                const outputPath = join(SPLIT_DIR, outputFileName);

                try {
                    return await processOneSplit(inputPath, pages, outputFileName, outputPath);
                } catch (error) {
                    console.error(`Error processing split ${index + 1}:`, error);
                    throw error;
                }
            });

            // Wait for current batch to complete
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process batch results
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
            }

            // Update status after each batch
            const completedCount = results.length;
            const progress = Math.round((completedCount / pageSets.length) * 100);
            
            const updatedStatus = {
                ...initialStatus,
                status: completedCount === pageSets.length ? 'completed' : 'processing',
                progress,
                completed: completedCount,
                results
            };
            
            await writeFile(statusPath, JSON.stringify(updatedStatus));
            
            // Small delay between batches
            if (i + batchSize < pageSets.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Final status update
        const finalStatus = {
            id: sessionId,
            status: 'completed',
            progress: 100,
            total: pageSets.length,
            completed: results.length,
            results,
            error: null
        };
        
        await writeFile(statusPath, JSON.stringify(finalStatus));
    } catch (error) {
        // Update status with error
        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        const errorStatus = {
            id: sessionId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error during processing',
            results: [] // Include any results processed so far
        };
        
        await writeFile(statusPath, JSON.stringify(errorStatus));
        console.error('Error in background processing:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF splitting process...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for split operation');
            const validation = await validateApiKey(apiKey, 'split');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return new Response(
                    JSON.stringify({ error: validation.error || 'Invalid API key' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'split');
            }
        }
        
        await ensureDirectories();

        // Process form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const splitMethodRaw = formData.get('splitMethod') as string || 'range';
        const splitMethod = ['range', 'extract', 'every'].includes(splitMethodRaw) ? splitMethodRaw : 'range';

        // Get specific options based on the split method
        const pageRanges = formData.get('pageRanges') as string || '';
        const everyNPages = parseInt(formData.get('everyNPages') as string || '1');

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'No PDF file provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return new Response(
                JSON.stringify({ error: 'Only PDF files can be split' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create session ID and file paths
        const sessionId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // Get total pages using qpdf
        const totalPages = await getTotalPages(inputPath);

        console.log(`Loaded PDF with ${totalPages} pages`);

        // Determine which pages to extract/how to split based on method
        let pageSets: number[][] = [];

        if (splitMethod === 'range' && pageRanges) {
            // Custom page ranges
            pageSets = parsePageRanges(pageRanges, totalPages);
        } else if (splitMethod === 'extract') {
            // Extract each page as a separate PDF
            pageSets = Array.from({ length: totalPages }, (_, i) => [i + 1]);
        } else if (splitMethod === 'every') {
            // Split every N pages
            const n = Math.max(1, everyNPages || 1);
            for (let i = 1; i <= totalPages; i += n) {
                const end = Math.min(i + n - 1, totalPages);
                const pagesInRange = Array.from({ length: end - i + 1 }, (_, idx) => i + idx);
                pageSets.push(pagesInRange);
            }
        }

        if (pageSets.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No valid page ranges specified' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // If we have a large number of splits, use the two-phase approach
        const isLargeJob = pageSets.length > 15 || totalPages > 100;
        
        if (isLargeJob) {
            console.log(`Large job detected: ${pageSets.length} splits from ${totalPages} pages. Using two-phase approach.`);
            
            // Start background processing
            // Note: We don't await this to allow it to run in the background
            processSplitsInBackground(sessionId, inputPath, pageSets);
            
            // Return immediate response with status endpoint
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'PDF splitting started',
                    jobId: sessionId,
                    statusUrl: `/api/pdf/split/status?id=${sessionId}`,
                    originalName: file.name,
                    totalPages,
                    totalSplits: pageSets.length,
                    isLargeJob: true
                }),
                { status: 202, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            // For smaller jobs, process immediately
            console.log(`Small job: ${pageSets.length} splits. Processing immediately.`);
            
            // Process all splits
            const splitResults = [];
            for (let i = 0; i < pageSets.length; i++) {
                const pages = pageSets[i];
                const outputFileName = `${sessionId}-split-${i + 1}.pdf`;
                const outputPath = join(SPLIT_DIR, outputFileName);
                
                const result = await processOneSplit(inputPath, pages, outputFileName, outputPath);
                splitResults.push(result);
            }
            
            // Return complete results
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `PDF split into ${splitResults.length} files`,
                    originalName: file.name,
                    totalPages,
                    splitParts: splitResults,
                    isLargeJob: false
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error('PDF splitting error:', error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF splitting',
                success: false
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}