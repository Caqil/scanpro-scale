// app/api/compress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateApiKey, trackApiUsage } from '@/lib/validate-key';

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
async function processPdfCompression(inputPath: string, outputPath: string, quality: 'low' | 'medium' | 'high') {
    try {
        // Define quality parameters based on the quality level
        const qualitySettings = {
            low: {
                dPDFSETTINGS: '/ebook', // Lower quality, smaller size
                dCompatibilityLevel: '1.4',
                dCompression: true,
                dEmbedAllFonts: false,
            },
            medium: {
                dPDFSETTINGS: '/printer', // Medium quality
                dCompatibilityLevel: '1.5',
                dCompression: true,
                dEmbedAllFonts: true,
            },
            high: {
                dPDFSETTINGS: '/prepress', // Higher quality, larger size
                dCompatibilityLevel: '1.6',
                dCompression: true,
                dEmbedAllFonts: true,
            }
        };

        const settings = qualitySettings[quality];

        // Determine the correct Ghostscript command based on the platform
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';

        // Construct Ghostscript command with quality parameters
        const gsArgs = [
            '-sDEVICE=pdfwrite',
            `-dPDFSETTINGS=${settings.dPDFSETTINGS}`,
            `-dCompatibilityLevel=${settings.dCompatibilityLevel}`,
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            settings.dCompression ? '-dCompressFonts=true' : '-dCompressFonts=false',
            settings.dEmbedAllFonts ? '-dEmbedAllFonts=true' : '-dEmbedAllFonts=false',
            '-dSubsetFonts=true',
            '-dOptimize=true',
            '-dDownsampleColorImages=true',
            '-dColorImageResolution=150',
            '-dGrayImageResolution=150',
            '-dMonoImageResolution=150',
            `-sOutputFile="${outputPath}"`,
            `"${inputPath}"`
        ];

        const gsCommand_full = `${gsCommand} ${gsArgs.join(' ')}`;
        console.log('Executing Ghostscript command:', gsCommand_full);

        // Execute Ghostscript
        const { stdout, stderr } = await execPromise(gsCommand_full);
        console.log('Ghostscript stdout:', stdout);
        if (stderr) console.error('Ghostscript stderr:', stderr);

        return true;
    } catch (error) {
        console.error('PDF compression error:', error);
        throw new Error('Failed to compress PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
}

export async function POST(request: NextRequest) {
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
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
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
            message: 'PDF compression successful',
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
    }
}