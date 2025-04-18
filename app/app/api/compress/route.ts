// app/api/compress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateApiKey, trackApiUsage } from '@/lib/validate-key';
import { PDFDocument } from 'pdf-lib';

const execPromise = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const COMPRESSION_DIR = join(process.cwd(), 'public', 'compressions');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(COMPRESSION_DIR)) {
        await mkdir(COMPRESSION_DIR, { recursive: true });
    }
}

// Process PDF compression with different quality levels
async function processPdfCompression(inputPath: string, outputPath: string, quality: 'low' | 'medium' | 'high'): Promise<boolean> {
    try {
        // Get the original file size for comparison
        const originalBuffer = await readFile(inputPath);
        const originalSize = originalBuffer.length;

        // Define quality parameters based on the quality level
        const qualitySettings = {
            low: {
                dPDFSETTINGS: '/ebook', // Lower quality, smaller size
                dCompatibilityLevel: '1.4',
                colorImageResolution: 100,
                grayImageResolution: 100,
                monoImageResolution: 150,
                jpegQuality: 60,
            },
            medium: {
                dPDFSETTINGS: '/printer', // Medium quality
                dCompatibilityLevel: '1.5',
                colorImageResolution: 150,
                grayImageResolution: 150,
                monoImageResolution: 300,
                jpegQuality: 80,
            },
            high: {
                dPDFSETTINGS: '/prepress', // Higher quality, larger size
                dCompatibilityLevel: '1.6',
                colorImageResolution: 200,
                grayImageResolution: 200,
                monoImageResolution: 300,
                jpegQuality: 95,
            }
        };

        const settings = qualitySettings[quality];

        // Determine the correct Ghostscript command based on the platform
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';

        // Try first method: Ghostscript
        try {
            // Construct Ghostscript command with quality parameters
            const gsArgs = [
                gsCommand,
                '-sDEVICE=pdfwrite',
                `-dPDFSETTINGS=${settings.dPDFSETTINGS}`,
                `-dCompatibilityLevel=${settings.dCompatibilityLevel}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                '-dCompressFonts=true',
                '-dEmbedAllFonts=true',
                '-dSubsetFonts=true',
                '-dDetectDuplicateImages=true',
                '-dOptimize=true',
                '-dDownsampleColorImages=true',
                `-dColorImageResolution=${settings.colorImageResolution}`,
                `-dGrayImageResolution=${settings.grayImageResolution}`,
                `-dMonoImageResolution=${settings.monoImageResolution}`,
                `-dJPEGQ=${settings.jpegQuality}`,
                // Properly quote the paths to handle spaces
                `-sOutputFile="${outputPath}"`,
                `"${inputPath}"`
            ];

            const gsCommand_full = gsArgs.join(' ');
            console.log('Executing Ghostscript command:', gsCommand_full);

            // Execute Ghostscript
            const { stdout, stderr } = await execPromise(gsCommand_full);
            
            if (stderr && !stderr.toLowerCase().includes('warning')) {
                console.error('Ghostscript stderr:', stderr);
                throw new Error('Ghostscript reported an error');
            }

            // Check if output file exists and is smaller
            if (existsSync(outputPath)) {
                const compressedBuffer = await readFile(outputPath);
                const compressedSize = compressedBuffer.length;
                
                if (compressedSize < originalSize) {
                    console.log(`Compression successful: ${originalSize} -> ${compressedSize} bytes (${((1 - compressedSize / originalSize) * 100).toFixed(2)}% reduction)`);
                    return true;
                } else {
                    console.log('Compression did not reduce file size. Using original file.');
                    await writeFile(outputPath, originalBuffer); // Use original if compression didn't help
                    return true;
                }
            }
        } catch (gsError) {
            console.error('Ghostscript compression failed:', gsError);
            // Fall through to next method
        }

        // Try second method: pdf-lib (more compatible but less compression)
        try {
            console.log('Attempting compression with pdf-lib...');
            const pdfDoc = await PDFDocument.load(originalBuffer);
            
            // Save with PDF-lib's compression
            const compressedBytes = await pdfDoc.save({
                addDefaultPage: false,
                useObjectStreams: true,
                // Don't update existing fields to keep file size smaller
                updateFieldAppearances: false
            });
            
            await writeFile(outputPath, compressedBytes);
            
            if (existsSync(outputPath)) {
                const compressedBuffer = await readFile(outputPath);
                const compressedSize = compressedBuffer.length;
                
                if (compressedSize < originalSize) {
                    console.log(`pdf-lib compression successful: ${originalSize} -> ${compressedSize} bytes (${((1 - compressedSize / originalSize) * 100).toFixed(2)}% reduction)`);
                    return true;
                } else {
                    console.log('pdf-lib compression did not reduce file size. Using original file.');
                    await writeFile(outputPath, originalBuffer); // Use original if compression didn't help
                    return true;
                }
            }
        } catch (pdfLibError) {
            console.error('pdf-lib compression failed:', pdfLibError);
        }

        // If we get here, both methods failed, but we'll use the original file as fallback
        console.log('All compression methods failed. Using original file as fallback.');
        await writeFile(outputPath, originalBuffer);
        return true;
    } catch (error) {
        console.error('PDF compression error:', error);
        throw new Error('Failed to compress PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
}

export async function POST(request: NextRequest) {
    let inputPath: string | null = null;
    
    try {
        console.log('Starting PDF compression process...');

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

        // Now proceed with the actual compression operation
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
                { error: 'Only PDF files can be compressed' },
                { status: 400 }
            );
        }

        // Get compression quality
        const quality = (formData.get('quality') as string) || 'medium';
        if (!['low', 'medium', 'high'].includes(quality)) {
            return NextResponse.json(
                { error: 'Invalid compression quality. Use low, medium, or high.' },
                { status: 400 }
            );
        }

        // Create unique names for files
        const uniqueId = uuidv4();
        inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(COMPRESSION_DIR, `${uniqueId}-compressed.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        console.log(`Compressing PDF: ${file.name}, size: ${file.size} bytes, quality: ${quality}`);

        // Compress the PDF
        await processPdfCompression(inputPath, outputPath, quality as 'low' | 'medium' | 'high');

        // Verify the output file exists
        if (!existsSync(outputPath)) {
            throw new Error(`Compressed file was not created at ${outputPath}`);
        }

        // Get file size information
        const originalSize = file.size;
        const compressedBuffer = await readFile(outputPath);
        const compressedSize = compressedBuffer.length;

        // Calculate compression ratio
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

        // Create relative URL for the compressed file
        const fileUrl = `/api/file?folder=compressions&filename=${uniqueId}-compressed.pdf`;

        return NextResponse.json({
            success: true,
            message: `PDF compression successful with ${compressionRatio}% reduction`,
            fileUrl,
            filename: `${uniqueId}-compressed.pdf`,
            originalName: file.name,
            originalSize,
            compressedSize,
            compressionRatio: `${compressionRatio}%`,
        });
    } catch (error) {
        console.error('Compression error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during compression',
                success: false
            },
            { status: 500 }
        );
    } finally {
        // Clean up input file
        if (inputPath && existsSync(inputPath)) {
            try {
                await unlink(inputPath);
            } catch (cleanupError) {
                console.warn('Failed to delete input file:', cleanupError);
            }
        }
    }
}