import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';
import { canPerformOperation, getOperationType, getUserId, processOperation } from '@/lib/operation-tracker';

// Promisify exec for async/await
const execAsync = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const SPLIT_DIR = join(process.cwd(), 'public', 'splits');
const STATUS_DIR = join(process.cwd(), 'public', 'status');

// Cleanup timeout (5 minutes)
const CLEANUP_TIMEOUT = 5 * 60 * 1000;

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
    const parts = pagesString.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr.trim());
            const end = parseInt(endStr.trim());

            if (!isNaN(start) && !isNaN(end) && start <= end) {
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
            const pageNum = parseInt(trimmedPart);
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                result.push([pageNum]);
            }
        }
    }

    return result;
}

// Get total pages using pdfcpu
async function getTotalPages(inputPath: string): Promise<number> {
    try {
        // Use pdfcpu info command to get PDF information
        const { stdout } = await execAsync(`pdfcpu info "${inputPath}"`);
        
        // Parse the output to find the number of pages
        // Based on the actual output format: "Page count: X"
        const pagesMatch = stdout.match(/Page count:\s*(\d+)/);
        if (pagesMatch && pagesMatch[1]) {
            return parseInt(pagesMatch[1], 10);
        }
        
        // If we can't find the exact pattern, try a more general approach
        const lines = stdout.split('\n');
        for (const line of lines) {
            // Look for any line containing both "page" and "count"
            if (line.toLowerCase().includes('page') && line.toLowerCase().includes('count')) {
                const match = line.match(/\d+/);
                if (match) {
                    return parseInt(match[0], 10);
                }
            }
        }
        
        console.error('pdfcpu info output:', stdout);
        throw new Error('Could not parse page count from pdfcpu output');
    } catch (error) {
        console.error('Error getting page count:', error);
        throw new Error(`Failed to get page count: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Process a single PDF split using pdfcpu
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
    try {
        // Build page selection string for pdfcpu
        let pageSelection = '';
        if (pages.length === 1) {
            pageSelection = pages[0].toString();
        } else {
            // Group consecutive pages into ranges
            const ranges: string[] = [];
            let start = pages[0];
            let end = pages[0];
            
            for (let i = 1; i < pages.length; i++) {
                if (pages[i] === end + 1) {
                    end = pages[i];
                } else {
                    ranges.push(start === end ? `${start}` : `${start}-${end}`);
                    start = pages[i];
                    end = pages[i];
                }
            }
            // Add the last range
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
            pageSelection = ranges.join(',');
        }

        // Use pdfcpu collect command to extract specific pages
        // The command syntax is: pdfcpu collect input output pages
        const command = `pdfcpu collect -pages "${pageSelection}" "${inputPath}" "${outputPath}"`;
        console.log('Executing:', command);
        
        await execAsync(command);

        return {
            fileUrl: `/api/file?folder=splits&filename=${outputFileName}`,
            filename: outputFileName,
            pages: pages,
            pageCount: pages.length,
        };
    } catch (error) {
        console.error('Error in processOneSplit:', error);
        throw new Error(`Failed to split pages ${pages.join(',')}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Find output files created by pdfcpu split
async function findSplitOutputFiles(outputDir: string, inputBaseName: string): Promise<string[]> {
    try {
        // List all PDF files in the output directory
        const { stdout } = await execAsync(`ls "${outputDir}"/*.pdf 2>/dev/null | sort`);
        const allFiles = stdout.trim().split('\n').filter(f => f);
        
        console.log('All PDF files in output directory:', allFiles);
        
        // Filter files that match the expected pattern from pdfcpu
        const outputFiles = allFiles.filter(filePath => {
            const fileName = filePath.split('/').pop() || '';
            // Check if the file name starts with our input base name and has the expected pattern
            return fileName.startsWith(inputBaseName) && fileName.includes('_') && fileName.endsWith('.pdf');
        });
        
        console.log('Filtered output files from pdfcpu:', outputFiles);
        return outputFiles;
    } catch (error) {
        console.error('Error finding output files:', error);
        return [];
    }
}

// Process different split methods using pdfcpu
async function processSplitsByMethod(
    inputPath: string,
    sessionId: string,
    splitMethod: string,
    pageRanges: string,
    everyNPages: number,
    totalPages: number
): Promise<Array<{ fileUrl: string; filename: string; pages: number[]; pageCount: number; }>> {
    const splitResults = [];
    const outputDir = SPLIT_DIR;

    if (splitMethod === 'range' && pageRanges) {
        // Use pdfcpu's collect command for specific page ranges
        const pageSets = parsePageRanges(pageRanges, totalPages);
        
        for (let i = 0; i < pageSets.length; i++) {
            const pages = pageSets[i];
            const outputFileName = `${sessionId}-split-${i + 1}.pdf`;
            const outputPath = join(SPLIT_DIR, outputFileName);
            
            const result = await processOneSplit(inputPath, pages, outputFileName, outputPath);
            splitResults.push(result);
        }
    } else if (splitMethod === 'extract' || splitMethod === 'every') {
        // Extract the base name from the input path
        const inputBaseName = inputPath.split('/').pop()?.replace('.pdf', '') || 'document';
        console.log('Input base name:', inputBaseName);
        
        // Execute the split command
        const span = splitMethod === 'extract' ? 1 : Math.max(1, everyNPages || 1);
        const command = `pdfcpu split "${inputPath}" "${outputDir}" ${span}`;
        console.log('Executing split command:', command);
        
        try {
            await execAsync(command);
            
            // Find all output files created by pdfcpu
            const outputFiles = await findSplitOutputFiles(outputDir, inputBaseName);
            
            if (outputFiles.length === 0) {
                console.error('No output files found after split operation');
                throw new Error('No output files generated by pdfcpu split');
            }
            
            // Sort files to ensure correct order
            outputFiles.sort();
            
            // Process each output file
            for (let i = 0; i < outputFiles.length; i++) {
                const originalPath = outputFiles[i];
                const newFileName = `${sessionId}-split-${i + 1}.pdf`;
                const newPath = join(outputDir, newFileName);
                
                // Rename the file
                await execAsync(`mv "${originalPath}" "${newPath}"`);
                console.log(`Renamed ${originalPath} to ${newPath}`);
                
                // Calculate pages in this split based on the method and index
                let pages: number[] = [];
                let pageCount = 0;
                
                if (splitMethod === 'extract') {
                    // Each file contains a single page
                    pages = [i + 1];
                    pageCount = 1;
                } else {
                    // Each file contains 'span' pages
                    const start = i * span + 1;
                    const end = Math.min(start + span - 1, totalPages);
                    pageCount = end - start + 1;
                    pages = Array.from({ length: pageCount }, (_, idx) => start + idx);
                }
                
                splitResults.push({
                    fileUrl: `/api/file?folder=splits&filename=${newFileName}`,
                    filename: newFileName,
                    pages,
                    pageCount,
                });
            }
        } catch (error) {
            console.error('Error during split operation:', error);
            throw error;
        }
    }

    return splitResults;
}

// Cleanup function to delete status, input, and split files
async function cleanupJob(sessionId: string) {
    try {
        // Delete status file
        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        await unlink(statusPath).catch(() => {}); // Ignore if file doesn't exist

        // Delete input file
        const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);
        await unlink(inputPath).catch(() => {});

        // Read status file to get split files (if it still exists)
        let splitFiles: string[] = [];
        try {
            const statusContent = await readFile(statusPath, 'utf-8');
            const status = JSON.parse(statusContent);
            splitFiles = status.results.map((result: any) => result.filename);
        } catch {}

        // Delete split files
        for (const filename of splitFiles) {
            const outputPath = join(SPLIT_DIR, filename);
            await unlink(outputPath).catch(() => {});
        }

        console.log(`Cleaned up job ${sessionId}`);
    } catch (error) {
        console.error(`Error cleaning up job ${sessionId}:`, error);
    }
}

// Process PDF splitting in the background
async function processSplitsInBackground(
    sessionId: string, 
    inputPath: string, 
    splitMethod: string,
    pageRanges: string,
    everyNPages: number,
    totalPages: number
): Promise<void> {
    try {
        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        const initialStatus = {
            id: sessionId,
            status: 'processing',
            progress: 0,
            total: 0,
            completed: 0,
            results: [],
            error: null,
        };
        await writeFile(statusPath, JSON.stringify(initialStatus));

        const results = await processSplitsByMethod(
            inputPath,
            sessionId,
            splitMethod,
            pageRanges,
            everyNPages,
            totalPages
        );

        const finalStatus = {
            id: sessionId,
            status: 'completed',
            progress: 100,
            total: results.length,
            completed: results.length,
            results,
            error: null,
        };
        await writeFile(statusPath, JSON.stringify(finalStatus));

        // Schedule cleanup after timeout
        setTimeout(() => cleanupJob(sessionId), CLEANUP_TIMEOUT);
    } catch (error) {
        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        const errorStatus = {
            id: sessionId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error during processing',
            results: [],
        };
        await writeFile(statusPath, JSON.stringify(errorStatus));
        console.error('Error in background processing:', error);

        // Schedule cleanup even on failure
        setTimeout(() => cleanupJob(sessionId), CLEANUP_TIMEOUT);
    }
}

// Status endpoint to retrieve job status
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('id');

        if (!sessionId) {
            return new Response(
                JSON.stringify({ error: 'No job ID provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const statusPath = join(STATUS_DIR, `${sessionId}-status.json`);
        if (!existsSync(statusPath)) {
            return new Response(
                JSON.stringify({ error: 'Job not found or expired' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const statusContent = await readFile(statusPath, 'utf-8');
        const status = JSON.parse(statusContent);

        // Optionally trigger immediate cleanup if status is 'completed'
        if (status.status === 'completed') {
            setTimeout(() => cleanupJob(sessionId), 1000); // Delay slightly to ensure response is sent
        }

        return new Response(JSON.stringify(status), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error retrieving status:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to retrieve job status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
export async function POST(request: NextRequest) {
    try {
      console.log("Starting PDF splitting process...");
      
      // Get user ID from either API key (via headers) or session
      const userId = await getUserId(request);
      const operationType = getOperationType(request, 'split');
      
      // IMPORTANT: Check if the user can perform this operation BEFORE processing
      // This prevents starting expensive operations for users who can't pay
      if (userId) {
        const canPerform = await canPerformOperation(userId, operationType);
        
        if (!canPerform.canPerform) {
          return NextResponse.json(
            {
              error: canPerform.error || "Insufficient balance or free operations",
              details: {
                balance: canPerform.currentBalance,
                freeOperationsRemaining: canPerform.freeOperationsRemaining,
                operationCost: 0.005,
              },
            },
            { status: 402 } // Payment Required status code
          );
        }
      }
  
      await ensureDirectories();
  
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const splitMethodRaw = (formData.get('splitMethod') as string) || 'range';
      const splitMethod = ['range', 'extract', 'every'].includes(splitMethodRaw) ? splitMethodRaw : 'range';
      const pageRanges = (formData.get('pageRanges') as string) || '';
      const everyNPages = parseInt((formData.get('everyNPages') as string) || '1');
  
      if (!file) {
        return NextResponse.json(
          { error: 'No PDF file provided' },
          { status: 400 }
        );
      }
  
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { error: 'Only PDF files can be split' },
          { status: 400 }
        );
      }
  
      const sessionId = uuidv4();
      const inputPath = join(UPLOAD_DIR, `${sessionId}-input.pdf`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);
  
      const totalPages = await getTotalPages(inputPath);
      console.log(`Loaded PDF with ${totalPages} pages`);
  
      // Estimate job size based on split method
      let estimatedSplits = 0;
      if (splitMethod === 'range' && pageRanges) {
        const pageSets = parsePageRanges(pageRanges, totalPages);
        estimatedSplits = pageSets.length;
      } else if (splitMethod === 'extract') {
        estimatedSplits = totalPages;
      } else if (splitMethod === 'every') {
        estimatedSplits = Math.ceil(totalPages / Math.max(1, everyNPages));
      }
  
      const isLargeJob = estimatedSplits > 15 || totalPages > 100;
  
      // If it's a large job, process in background and return status URL
      if (isLargeJob) {
        console.log(`Large job detected: ~${estimatedSplits} splits from ${totalPages} pages. Using two-phase approach.`);
        
        // Charge for the operation before starting background processing
        let billingInfo = {};
        
        if (userId) {
          const operationResult = await processOperation(userId, operationType);
          
          if (!operationResult.success) {
            return NextResponse.json(
              {
                error: operationResult.error || "Failed to process operation charge",
                details: {
                  balance: operationResult.currentBalance,
                  freeOperationsRemaining: operationResult.freeOperationsRemaining,
                  operationCost: 0.005,
                },
              },
              { status: 402 } // Payment Required status code
            );
          }
          
          // Add billing info to the response
          billingInfo = {
            billing: {
              usedFreeOperation: operationResult.usedFreeOperation,
              freeOperationsRemaining: operationResult.freeOperationsRemaining,
              currentBalance: operationResult.currentBalance,
              operationCost: operationResult.usedFreeOperation ? 0 : 0.005,
            }
          };
        }
        
        // Start background processing after successful payment
        processSplitsInBackground(sessionId, inputPath, splitMethod, pageRanges, everyNPages, totalPages);
  
        return NextResponse.json({
          success: true,
          message: 'PDF splitting started',
          jobId: sessionId,
          statusUrl: `/api/pdf/split/status?id=${sessionId}`,
          originalName: file.name,
          totalPages,
          estimatedSplits,
          isLargeJob: true,
          ...billingInfo // Include billing info if available
        }, { status: 202 });
      } else {
        // For small jobs, process immediately
        console.log(`Small job: ~${estimatedSplits} splits. Processing immediately.`);
        const splitResults = await processSplitsByMethod(
          inputPath,
          sessionId,
          splitMethod,
          pageRanges,
          everyNPages,
          totalPages
        );
  
        // Clean up small job files immediately
        await cleanupJob(sessionId);
        
        // Charge for the operation after successful processing
        let billingInfo = {};
        
        if (userId) {
          const operationResult = await processOperation(userId, operationType);
          
          if (!operationResult.success) {
            return NextResponse.json(
              {
                error: operationResult.error || "Failed to process operation charge",
                details: {
                  balance: operationResult.currentBalance,
                  freeOperationsRemaining: operationResult.freeOperationsRemaining,
                  operationCost: 0.005,
                },
              },
              { status: 402 } // Payment Required status code
            );
          }
          
          // Add billing info to the response
          billingInfo = {
            billing: {
              usedFreeOperation: operationResult.usedFreeOperation,
              freeOperationsRemaining: operationResult.freeOperationsRemaining,
              currentBalance: operationResult.currentBalance,
              operationCost: operationResult.usedFreeOperation ? 0 : 0.005,
            }
          };
        }
  
        return NextResponse.json({
          success: true,
          message: `PDF split into ${splitResults.length} files`,
          originalName: file.name,
          totalPages,
          splitParts: splitResults,
          isLargeJob: false,
          ...billingInfo // Include billing info if available
        });
      }
    } catch (error) {
      console.error('PDF splitting error:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'An unknown error occurred during PDF splitting',
          success: false,
        },
        { status: 500 }
      );
    }
  }