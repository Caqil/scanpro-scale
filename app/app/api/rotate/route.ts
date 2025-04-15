import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const ROTATE_DIR = join(process.cwd(), 'public', 'rotations');
const TEMP_DIR = join(process.cwd(), 'temp'); // For temporary PostScript files

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
    if (!existsSync(ROTATE_DIR)) await mkdir(ROTATE_DIR, { recursive: true });
    if (!existsSync(TEMP_DIR)) await mkdir(TEMP_DIR, { recursive: true });
}

// Get page count using Ghostscript
async function getPageCount(filePath: string): Promise<number> {
    try {
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
        const command = `${gsCommand} -q -dNODISPLAY -c "(${filePath}) (r) file runpdfbegin pdfpagecount = quit"`;
        console.log(`Getting page count with command: ${command}`);
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.error(`Ghostscript page count stderr: ${stderr}`);
            throw new Error(`Failed to get page count: ${stderr}`);
        }
        const count = parseInt(stdout.trim(), 10);
        if (isNaN(count) || count <= 0) throw new Error('Invalid page count returned');
        console.log(`Page count: ${count}`);
        return count;
    } catch (error) {
        console.error('Error getting page count:', error);
        console.warn('Falling back to default page count of 100');
        return 100; // Fallback
    }
}

// Rotate PDF pages using Ghostscript
async function rotatePdfPages(inputPath: string, outputPath: string, rotationInfo: {
    pageNumbers: number[],
    angle: number
}) {
    try {
        const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
        const normalizedAngle = (rotationInfo.angle + 360) % 360; // Normalize to 0, 90, 180, 270
        if (![0, 90, 180, 270].includes(normalizedAngle)) {
            throw new Error('Ghostscript only supports rotation angles of 0, 90, 180, or 270 degrees');
        }

        const totalPages = await getPageCount(inputPath);
        const rotateAll = rotationInfo.pageNumbers.length === 0;
        const pagesToRotate = rotateAll ? Array.from({ length: totalPages }, (_, i) => i + 1) : rotationInfo.pageNumbers.map(p => p + 1);

        // Validate page numbers
        const invalidPages = pagesToRotate.filter(p => p < 1 || p > totalPages);
        if (invalidPages.length > 0) {
            throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. Must be between 1 and ${totalPages}`);
        }

        // Generate PostScript for rotation
        let psContent: string;
        if (rotateAll) {
            // Simple rotation for all pages using a loop in PostScript
            psContent = `
        /rotatepage { % pageNum rotatepage
          1 dict dup /Rotate ${normalizedAngle} put .setpageparams
        } def
        1 ${totalPages} { rotatepage } for
      `;
        } else {
            // Specific pages
            psContent = pagesToRotate.map(page =>
                `${page} 1 dict dup /Rotate ${normalizedAngle} put .setpageparams`
            ).join('\n');
        }

        // Write PostScript to a temporary file
        const tempPsFile = join(TEMP_DIR, `${uuidv4()}.ps`);
        await writeFile(tempPsFile, psContent);
        console.log(`Wrote PostScript to: ${tempPsFile}`);

        // Construct Ghostscript command
        const gsArgs = [
            '-sDEVICE=pdfwrite',
            '-dAutoRotatePages=/None',
            `-o "${outputPath}"`,
            '-q',
            '-dNOPAUSE',
            '-dBATCH',
            `-f "${tempPsFile}"`, // Include the PostScript file
            `-f "${inputPath}"`,  // Input PDF
        ];

        const fullCommand = `${gsCommand} ${gsArgs.join(' ')}`;
        console.log(`Executing Ghostscript rotation command: ${fullCommand}`);

        const { stdout, stderr } = await execPromise(fullCommand);
        console.log(`Ghostscript stdout: ${stdout}`);
        if (stderr) {
            console.error(`Ghostscript rotation stderr: ${stderr}`);
            throw new Error(`Ghostscript execution failed: ${stderr}`);
        }

        // Clean up temporary file
        await unlink(tempPsFile).catch(err => console.warn(`Failed to delete temp file ${tempPsFile}: ${err}`));

        // Verify output file
        if (!existsSync(outputPath)) throw new Error('Rotated PDF file was not created');

        return {
            totalPages,
            rotatedPages: pagesToRotate.length,
            pageNumbers: pagesToRotate
        };
    } catch (error) {
        console.error('Ghostscript rotation error:', error);
        throw new Error('Failed to rotate PDF with Ghostscript: ' + (error instanceof Error ? error.message : String(error)));
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF rotation process with Ghostscript...');
        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for compression operation');
            const validation = await validateApiKey(apiKey, 'rotation');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'rotation');
            }
        }
        await ensureDirectories();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files can be rotated' }, { status: 400 });
        }

        const angle = parseInt(formData.get('angle') as string || '90');
        if (![-270, -180, -90, 90, 180, 270].includes(angle)) {
            return NextResponse.json(
                { error: 'Invalid rotation angle. Must be 90, 180, 270, -90, -180, or -270 degrees' },
                { status: 400 }
            );
        }

        let pageNumbers: number[] = [];
        const pagesParam = formData.get('pages') as string;
        if (pagesParam) {
            try {
                if (pagesParam.startsWith('[')) {
                    pageNumbers = JSON.parse(pagesParam);
                } else {
                    pageNumbers = pagesParam.split(',')
                        .map(p => p.trim())
                        .filter(p => /^\d+$/.test(p))
                        .map(p => parseInt(p) - 1); // 0-based
                }
            } catch (e) {
                console.error('Invalid pages parameter:', e);
                pageNumbers = []; // Default to all pages
            }
        }

        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(ROTATE_DIR, `${uniqueId}-rotated.pdf`);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        const fileStats = await stat(inputPath);
        console.log(`Input file written: ${inputPath}, size: ${fileStats.size} bytes`);

        const rotationResult = await rotatePdfPages(inputPath, outputPath, {
            pageNumbers,
            angle
        });

        const fileUrl = `/rotations/${uniqueId}-rotated.pdf`;

        return NextResponse.json({
            success: true,
            message: 'PDF rotation successful',
            angle,
            fileUrl,
            filename: `${uniqueId}-rotated.pdf`,
            totalPages: rotationResult.totalPages,
            rotatedPages: rotationResult.rotatedPages,
            pageNumbers: rotationResult.pageNumbers
        });
    } catch (error) {
        console.error('Rotation error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during rotation',
                success: false
            },
            { status: 500 }
        );
    }
}