// app/api/compress/download-zip/route.ts
import { NextResponse } from 'next/server';
import { createReadStream, createWriteStream } from 'fs';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import JSZip from 'jszip';

// Define directory
const ZIPS_DIR = join(process.cwd(), 'public', 'zips');
const COMPRESSED_DIR = join(process.cwd(), 'public', 'compressions');

// Ensure directory exists
async function ensureDirectories() {
    if (!existsSync(ZIPS_DIR)) {
        await mkdir(ZIPS_DIR, { recursive: true });
    }
}

// Create ZIP file with archiver (Node.js native approach)
function createZipWithArchiver(files: {filename: string, originalName: string}[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', function() {
            console.log('Archive created successfully: ' + archive.pointer() + ' total bytes');
            resolve();
        });

        archive.on('error', function(err) {
            reject(err);
        });

        archive.pipe(output);

        // Add each file to the archive
        for (const file of files) {
            const filePath = join(COMPRESSED_DIR, file.filename);
            if (existsSync(filePath)) {
                // Use original name for the file within the ZIP
                archive.file(filePath, { name: file.originalName });
            }
        }

        // Finalize the archive
        archive.finalize();
    });
}

// Create ZIP file using JSZip (alternative approach that doesn't depend on file system writes)
async function createZipWithJSZip(files: {filename: string, originalName: string}[]): Promise<Buffer> {
    const zip = new JSZip();

    // Add each file to the ZIP
    for (const file of files) {
        const filePath = join(COMPRESSED_DIR, file.filename);
        if (existsSync(filePath)) {
            const fileData = await readFile(filePath);
            // Use original name for the file within the ZIP
            zip.file(file.originalName, fileData);
        }
    }

    // Generate ZIP file
    return zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });
}

export async function POST(request: Request) {
    try {
        await ensureDirectories();

        // Get file list from request body
        const body = await request.json();
        const files = body.files as { filename: string, originalName: string }[];

        if (!files || !Array.isArray(files) || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided for ZIP creation' },
                { status: 400 }
            );
        }

        // Create unique filename for the ZIP
        const zipFilename = `${uuidv4()}-compressed-files.zip`;
        const zipFilePath = join(ZIPS_DIR, zipFilename);

        // Create ZIP file - choose one method or the other based on your needs
        try {
            // Method 1: Using archiver (file system based)
            await createZipWithArchiver(files, zipFilePath);
            
            // Read the created ZIP file
            const zipData = await readFile(zipFilePath);
            
            // Return the ZIP file
            return new NextResponse(zipData, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="compressed-files.zip"`,
                }
            });
        } catch (archiverError) {
            console.error('Error creating ZIP with archiver:', archiverError);
            
            // Method 2: Fallback to JSZip (in-memory)
            console.log('Trying fallback ZIP creation method with JSZip...');
            const zipBuffer = await createZipWithJSZip(files);
            
            // Return the ZIP file
            return new NextResponse(zipBuffer, {
                headers: {
                    'Content-Type': 'application/zip',
                    'Content-Disposition': `attachment; filename="compressed-files.zip"`,
                }
            });
        }
    } catch (error) {
        console.error('ZIP creation error:', error);
        
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred during ZIP creation' },
            { status: 500 }
        );
    }
}