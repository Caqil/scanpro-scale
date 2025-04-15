import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
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
const ROTATIONS_DIR = join(process.cwd(), 'public', 'rotations');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(ROTATIONS_DIR)) {
        await mkdir(ROTATIONS_DIR, { recursive: true });
    }
}

interface PageRotation {
    pageNumber: number;
    angle: number;
    original: number;
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

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF rotation process...');

        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for rotation operation');
            const validation = await validateApiKey(apiKey, 'rotate');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'rotate');
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
            return NextResponse.json({ error: 'Only PDF files can be rotated' }, { status: 400 });
        }

        // Check if rotations information is provided
        const rotationsStr = formData.get('rotations') as string | null;

        if (!rotationsStr) {
            return NextResponse.json({ error: 'No rotation instructions provided' }, { status: 400 });
        }

        let rotations: PageRotation[];
        try {
            rotations = JSON.parse(rotationsStr);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid rotation instructions format' }, { status: 400 });
        }

        // Filter out rotations that don't change the page orientation
        const effectiveRotations = rotations.filter(r => r.angle !== 0);

        if (effectiveRotations.length === 0) {
            return NextResponse.json({ error: 'No pages to rotate' }, { status: 400 });
        }

        // Generate unique file names
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(ROTATIONS_DIR, `${uniqueId}-rotated.pdf`);

        // Save the uploaded PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`PDF saved to ${inputPath}`);

        // Get total pages using qpdf
        const pageCount = await getTotalPages(inputPath);

        // Validate page numbers
        for (const rotation of effectiveRotations) {
            const { pageNumber } = rotation;
            if (pageNumber < 1 || pageNumber > pageCount) {
                console.warn(`Skipping invalid page number: ${pageNumber}`);
                return NextResponse.json(
                    { error: `Invalid page number: ${pageNumber}` },
                    { status: 400 }
                );
            }
        }

        // Build qpdf rotation command
        const rotationParams: string[] = [];
        for (let i = 1; i <= pageCount; i++) {
            const rotation = effectiveRotations.find(r => r.pageNumber === i);
            if (rotation) {
                // Normalize angle to 0, 90, 180, 270
                const normalizedAngle = ((rotation.angle % 360) + 360) % 360;
                if ([0, 90, 180, 270].includes(normalizedAngle)) {
                    rotationParams.push(`--rotate=${normalizedAngle}:${i}`);
                } else {
                    console.warn(`Unsupported rotation angle ${normalizedAngle} for page ${i}`);
                    continue;
                }
            }
        }

        // Construct qpdf command
        const command = `qpdf "${inputPath}" ${rotationParams.join(' ')} "${outputPath}"`;

        // Execute qpdf command
        await execAsync(command);
        console.log(`Rotated PDF saved to ${outputPath}`);

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
            message: 'PDF rotated successfully',
            fileUrl: `/api/file?folder=rotations&filename=${uniqueId}-rotated.pdf`,
            fileName: `${uniqueId}-rotated.pdf`,
            originalName: file.name,
            pagesRotated: effectiveRotations.length
        });

    } catch (error) {
        console.error('PDF rotation error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF rotation',
                success: false
            },
            { status: 500 }
        );
    }
}