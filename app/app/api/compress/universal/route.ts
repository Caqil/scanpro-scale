// app/api/compress/universal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const COMPRESSED_DIR = join(process.cwd(), 'public', 'compressions');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(COMPRESSED_DIR)) {
        await mkdir(COMPRESSED_DIR, { recursive: true });
    }
}

// Determine file type based on extension
function getFileType(filename: string): 'pdf' | 'image' | 'office' | 'unknown' {
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    if (extension === 'pdf') {
        return 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        return 'image';
    } else if (['docx', 'pptx', 'xlsx'].includes(extension)) {
        return 'office';
    }

    return 'unknown';
}

// Handle PDF compression
async function compressPdf(
    inputPath: string,
    outputPath: string,
    quality: 'low' | 'medium' | 'high'
): Promise<{ success: boolean; originalSize: number; compressedSize: number }> {
    let fileBuffer: Buffer;
    try {
        fileBuffer = await readFile(inputPath);
        const originalSize = fileBuffer.length;

        const hasGs = await checkCommandExists('gs') || await checkCommandExists('gswin64c');

        if (hasGs) {
            let dpiValue = 150;
            let imageQuality = 90;

            if (quality === 'low') {
                dpiValue = 100;
                imageQuality = 70;
            } else if (quality === 'high') {
                dpiValue = 200;
                imageQuality = 95;
            }

            const gsCommand = process.platform === 'win32' ? 'gswin64c' : 'gs';
            const gsArgs = [
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS=/ebook',
                `-dNOPAUSE`,
                `-dQUIET`,
                `-dBATCH`,
                `-dDetectDuplicateImages=true`,
                `-dCompressFonts=true`,
                `-r${dpiValue}`,
                `-dColorImageDownsampleType=/Bicubic`,
                `-dColorImageResolution=${dpiValue}`,
                `-dGrayImageDownsampleType=/Bicubic`,
                `-dGrayImageResolution=${dpiValue}`,
                `-dMonoImageDownsampleType=/Bicubic`,
                `-dMonoImageResolution=${dpiValue}`,
                `-dColorConversionStrategy=/sRGB`,
                `-dAutoFilterColorImages=false`,
                `-dAutoFilterGrayImages=false`,
                `-dDownsampleColorImages=true`,
                `-dDownsampleGrayImages=true`,
                `-dDownsampleMonoImages=true`,
                `-dJPEGQuality=${imageQuality}`,
                `-sOutputFile=${outputPath}`,
                inputPath
            ];

            await execPromise(`${gsCommand} ${gsArgs.join(' ')}`);
            const compressedBuffer = await readFile(outputPath);
            const compressedSize = compressedBuffer.length;

            if (compressedSize >= originalSize) {
                await writeFile(outputPath, fileBuffer);
                return { success: true, originalSize, compressedSize: originalSize };
            }

            return { success: true, originalSize, compressedSize };
        } else {
            const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
            const compressedPdfBytes = await pdfDoc.save({ addDefaultPage: false });
            await writeFile(outputPath, compressedPdfBytes);

            const compressedSize = compressedPdfBytes.length;
            return { success: true, originalSize, compressedSize };
        }
    } catch (error) {
        console.error('PDF compression error:', error);
        await writeFile(outputPath, fileBuffer!); // Fallback to original if compression fails
        return { success: false, originalSize: fileBuffer!.length, compressedSize: fileBuffer!.length };
    }
}

// Handle image compression
async function compressImage(
    inputPath: string,
    outputPath: string,
    quality: 'low' | 'medium' | 'high'
): Promise<{ success: boolean; originalSize: number; compressedSize: number }> {
    let fileBuffer: Buffer;
    try {
        fileBuffer = await readFile(inputPath);
        const originalSize = fileBuffer.length;

        let qualityValue = 80;
        if (quality === 'low') qualityValue = 60;
        if (quality === 'high') qualityValue = 90;

        const imageFormat = inputPath.split('.').pop()?.toLowerCase() || 'jpeg';
        const sharpInstance = sharp(fileBuffer);
        let compressedBuffer: Buffer;

        if (imageFormat === 'png') {
            compressedBuffer = await sharpInstance
                .png({ quality: qualityValue, compressionLevel: 9 })
                .toBuffer();
        } else if (['jpg', 'jpeg'].includes(imageFormat)) {
            compressedBuffer = await sharpInstance
                .jpeg({ quality: qualityValue })
                .toBuffer();
        } else if (imageFormat === 'webp') {
            compressedBuffer = await sharpInstance
                .webp({ quality: qualityValue })
                .toBuffer();
        } else {
            compressedBuffer = await sharpInstance
                .jpeg({ quality: qualityValue })
                .toBuffer();
        }

        await writeFile(outputPath, compressedBuffer);
        const compressedSize = compressedBuffer.length;

        if (compressedSize >= originalSize) {
            await writeFile(outputPath, fileBuffer);
            return { success: true, originalSize, compressedSize: originalSize };
        }

        return { success: true, originalSize, compressedSize };
    } catch (error) {
        console.error('Image compression error:', error);
        await writeFile(outputPath, fileBuffer!);
        return {
            success: false, originalSize:// app/api/compress/universal/route.ts (continued)
                fileBuffer!.length, compressedSize: fileBuffer!.length
        };
    }
}

// Handle Office document compression
async function compressOffice(
    inputPath: string,
    outputPath: string,
    quality: 'low' | 'medium' | 'high'
): Promise<{ success: boolean; originalSize: number; compressedSize: number }> {
    let fileBuffer: Buffer;
    try {
        fileBuffer = await readFile(inputPath);
        const originalSize = fileBuffer.length;

        const hasLibreOffice = await checkCommandExists('libreoffice') || await checkCommandExists('soffice');
        const hasUnoconv = await checkCommandExists('unoconv');

        if (hasLibreOffice || hasUnoconv) {
            try {
                const inputDir = join(process.cwd(), 'uploads');
                const inputBasename = path.basename(inputPath);
                const pdfBasename = inputBasename.replace(/\.[^\.]+$/, '.pdf');
                const tempPdfPath = join(inputDir, pdfBasename);

                console.log(`Converting ${inputBasename} to PDF...`);

                if (hasLibreOffice) {
                    await execPromise(`libreoffice --headless --convert-to pdf --outdir "${inputDir}" "${inputPath}"`);
                    if (!existsSync(tempPdfPath)) {
                        console.error(`LibreOffice conversion failed. Expected PDF not found: ${tempPdfPath}`);
                        throw new Error("PDF conversion failed. Output file not found.");
                    }
                } else if (hasUnoconv) {
                    await execPromise(`unoconv -f pdf -o "${tempPdfPath}" "${inputPath}"`);
                    if (!existsSync(tempPdfPath)) {
                        console.error(`Unoconv conversion failed. Expected PDF not found: ${tempPdfPath}`);
                        throw new Error("PDF conversion failed. Output file not found.");
                    }
                }

                console.log(`Successfully converted to PDF: ${tempPdfPath}`);
                const compressedPdfPath = `${tempPdfPath}.compressed.pdf`;
                const pdfCompressed = await compressPdf(tempPdfPath, compressedPdfPath, quality);

                if (existsSync(compressedPdfPath)) {
                    await writeFile(outputPath, await readFile(compressedPdfPath));
                    try {
                        await unlink(tempPdfPath);
                        await unlink(compressedPdfPath);
                    } catch (cleanupError) {
                        console.warn("Error cleaning up temporary files:", cleanupError);
                    }

                    const compressedSize = (await readFile(outputPath)).length;
                    return { success: true, originalSize, compressedSize };
                } else {
                    throw new Error("Compressed PDF not found");
                }
            } catch (conversionError) {
                console.error("Office conversion error:", conversionError);
                await writeFile(outputPath, fileBuffer);
                return { success: true, originalSize, compressedSize: originalSize };
            }
        } else {
            console.log("No LibreOffice or unoconv available. Using fallback method.");
            await writeFile(outputPath, fileBuffer);
            return { success: true, originalSize, compressedSize: originalSize };
        }
    } catch (error) {
        console.error('Office document compression error:', error);
        await writeFile(outputPath, fileBuffer!);
        return { success: false, originalSize: fileBuffer!.length, compressedSize: fileBuffer!.length };
    }
}

// Helper to check if a command exists
async function checkCommandExists(command: string): Promise<boolean> {
    try {
        const checkCmd = process.platform === 'win32' ?
            `where ${command} 2>nul` :
            `which ${command} 2>/dev/null`;

        await execPromise(checkCmd);
        return true;
    } catch (error) {
        return false;
    }
}

export async function POST(request: NextRequest) {
    let file: File | null = null;
    let inputPath = '';
    let outputPath = '';
    let outputFileName = '';
    let fileType: 'pdf' | 'image' | 'office' | 'unknown' = 'unknown';
    let buffer: Buffer | null = null;

    try {
        console.log('Starting file compression process...');
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
        await ensureDirectories();

        const formData = await request.formData();
        file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const quality = (formData.get('quality') as string || 'medium') as 'low' | 'medium' | 'high';
        const uniqueId = uuidv4();
        inputPath = join(UPLOAD_DIR, `${uniqueId}-input-${file.name}`);
        fileType = getFileType(file.name);
        const fileExtension = file.name.split('.').pop() || '';
        outputFileName = `${uniqueId}-compressed.${fileExtension}`;
        outputPath = join(COMPRESSED_DIR, outputFileName);

        buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        let compressionResult;

        try {
            switch (fileType) {
                case 'pdf':
                    compressionResult = await compressPdf(inputPath, outputPath, quality);
                    break;
                case 'image':
                    compressionResult = await compressImage(inputPath, outputPath, quality);
                    break;
                case 'office':
                    compressionResult = await compressOffice(inputPath, outputPath, quality);
                    break;
                default:
                    await writeFile(outputPath, buffer);
                    compressionResult = {
                        success: true,
                        originalSize: buffer.length,
                        compressedSize: buffer.length
                    };
            }

            if (!compressionResult.success || !existsSync(outputPath)) {
                console.log("Compression was not successful or output file missing. Using original file.");
                await writeFile(outputPath, buffer);
                compressionResult = {
                    success: true,
                    originalSize: buffer.length,
                    compressedSize: buffer.length
                };
            }
        } catch (processingError) {
            console.error("Error during file processing:", processingError);
            await writeFile(outputPath, buffer);
            compressionResult = {
                success: true,
                originalSize: buffer.length,
                compressedSize: buffer.length
            };
        }

        const compressionRatio = ((compressionResult.originalSize - compressionResult.compressedSize) / compressionResult.originalSize * 100).toFixed(2);

        // Use the file API endpoint rather than direct path
        const fileUrl = `/api/file?folder=compressions&filename=${outputFileName}`;

        return NextResponse.json({
            success: true,
            message: `File compressed successfully with ${compressionRatio}% reduction`,
            fileUrl,
            filename: outputFileName,
            originalName: file.name,
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            compressionRatio: `${compressionRatio}%`,
            fileType
        });
    } catch (error) {
        console.error('Compression error:', error);

        try {
            if (file && inputPath && outputPath && buffer && !existsSync(outputPath)) {
                await writeFile(outputPath, buffer);
                return NextResponse.json({
                    success: true,
                    message: `File could not be compressed due to an error, original file provided instead`,
                    fileUrl: `/api/file?folder=compressions&filename=${outputFileName}`,
                    filename: outputFileName,
                    originalName: file.name,
                    originalSize: buffer.length,
                    compressedSize: buffer.length,
                    compressionRatio: '0%',
                    fileType,
                    error: error instanceof Error ? error.message : 'An unknown error occurred during compression'
                });
            }

            return NextResponse.json(
                {
                    error: error instanceof Error ? error.message : 'An unknown error occurred during compression',
                    success: false
                },
                { status: 500 }
            );
        } catch (fallbackError) {
            console.error('Error in fallback handling:', fallbackError);
            return NextResponse.json(
                {
                    error: 'Critical error during compression process',
                    success: false
                },
                { status: 500 }
            );
        }
    } finally {
        if (inputPath && existsSync(inputPath)) {
            try {
                await unlink(inputPath);
            } catch (cleanupError) {
                console.warn('Error cleaning up input file:', cleanupError);
            }
        }
    }
}