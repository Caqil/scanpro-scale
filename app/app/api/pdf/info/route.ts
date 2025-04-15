// app/api/pdf/info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from 'pdf-lib';

// Define upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure directory exists
async function ensureDirectory() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
}

export async function POST(request: NextRequest) {
    try {
        await ensureDirectory();

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
                { error: 'Only PDF files are supported' },
                { status: 400 }
            );
        }

        // Create a temporary file
        const tempId = uuidv4();
        const tempPath = join(UPLOAD_DIR, `${tempId}-info.pdf`);

        // Write file to disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(tempPath, buffer);

        // Load the PDF to get information
        const pdfBytes = await readFile(tempPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get basic information
        const pageCount = pdfDoc.getPageCount();

        // Get page dimensions (from first page)
        let width = 0;
        let height = 0;

        if (pageCount > 0) {
            const firstPage = pdfDoc.getPage(0);
            const { width: pageWidth, height: pageHeight } = firstPage.getSize();
            width = pageWidth;
            height = pageHeight;
        }

        // Return information
        return NextResponse.json({
            success: true,
            filename: file.name,
            fileSize: file.size,
            pageCount,
            dimensions: { width, height }
        });
    } catch (error) {
        console.error('Error getting PDF info:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred while analyzing the PDF',
                success: false
            },
            { status: 500 }
        );
    }
}