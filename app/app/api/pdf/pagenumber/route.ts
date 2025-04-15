// app/api/pdf/pagenumber/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const NUMBERED_DIR = join(process.cwd(), 'public', 'pagenumbers');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
    if (!existsSync(NUMBERED_DIR)) {
        await mkdir(NUMBERED_DIR, { recursive: true });
    }
}

// Define page number formats
type NumberFormat = 'numeric' | 'roman' | 'alphabetic';

// Convert number to Roman numerals
function toRoman(num: number): string {
    const romanNumerals = [
        { value: 1000, numeral: 'M' },
        { value: 900, numeral: 'CM' },
        { value: 500, numeral: 'D' },
        { value: 400, numeral: 'CD' },
        { value: 100, numeral: 'C' },
        { value: 90, numeral: 'XC' },
        { value: 50, numeral: 'L' },
        { value: 40, numeral: 'XL' },
        { value: 10, numeral: 'X' },
        { value: 9, numeral: 'IX' },
        { value: 5, numeral: 'V' },
        { value: 4, numeral: 'IV' },
        { value: 1, numeral: 'I' }
    ];

    let roman = '';
    let n = num;

    for (const { value, numeral } of romanNumerals) {
        while (n >= value) {
            roman += numeral;
            n -= value;
        }
    }

    return roman;
}

// Convert number to alphabetic format (A, B, C, ... Z, AA, AB, etc.)
function toAlphabetic(num: number): string {
    if (num <= 0) return '';

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let n = num;

    while (n > 0) {
        const remainder = (n - 1) % 26;
        result = alphabet[remainder] + result;
        n = Math.floor((n - 1) / 26);
    }

    return result;
}

// Format page number based on selected format
function formatPageNumber(pageNum: number, format: NumberFormat, startNumber: number): string {
    const actualNumber = pageNum + startNumber - 1;

    switch (format) {
        case 'roman':
            return toRoman(actualNumber);
        case 'alphabetic':
            return toAlphabetic(actualNumber);
        case 'numeric':
        default:
            return actualNumber.toString();
    }
}

// Parse page ranges from string format (e.g., "1,3,5-10")
function parsePageRanges(pagesString: string, totalPages: number): number[] {
    const pages: number[] = [];

    // If empty string, apply to all pages
    if (!pagesString.trim()) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

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
                for (let i = start; i <= Math.min(end, totalPages); i++) {
                    if (!pages.includes(i) && i > 0) {
                        pages.push(i);
                    }
                }
            }
        } else {
            // Single page number
            const pageNum = parseInt(trimmedPart);
            if (!isNaN(pageNum) && !pages.includes(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                pages.push(pageNum);
            }
        }
    }

    return pages.sort((a, b) => a - b);
}

// Calculate position based on alignment and page dimensions
function calculatePosition(
    pageWidth: number,
    pageHeight: number,
    textWidth: number,
    textHeight: number,
    position: string,
    marginX: number,
    marginY: number
): { x: number, y: number } {
    switch (position) {
        case 'bottom-center':
            return {
                x: pageWidth / 2 - textWidth / 2,
                y: marginY
            };
        case 'bottom-left':
            return {
                x: marginX,
                y: marginY
            };
        case 'bottom-right':
            return {
                x: pageWidth - textWidth - marginX,
                y: marginY
            };
        case 'top-center':
            return {
                x: pageWidth / 2 - textWidth / 2,
                y: pageHeight - textHeight - marginY
            };
        case 'top-left':
            return {
                x: marginX,
                y: pageHeight - textHeight - marginY
            };
        case 'top-right':
            return {
                x: pageWidth - textWidth - marginX,
                y: pageHeight - textHeight - marginY
            };
        default: // Default to bottom-center
            return {
                x: pageWidth / 2 - textWidth / 2,
                y: marginY
            };
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF page numbering process...');

        // Get API key either from header or query parameter
        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        // If this is a programmatic API call (not from web UI), validate the API key
        if (apiKey) {
            console.log('Validating API key for page numbering operation');
            const validation = await validateApiKey(apiKey, 'edit');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Track usage (non-blocking)
            if (validation.userId) {
                trackApiUsage(validation.userId, 'edit');
            }
        }

        await ensureDirectories();

        // Process form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
        }

        // Verify it's a PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json({ error: 'Only PDF files can be processed' }, { status: 400 });
        }

        // Get page numbering options
        const format = formData.get('format') as NumberFormat || 'numeric';
        const position = formData.get('position') as string || 'bottom-center';
        const fontFamily = formData.get('fontFamily') as string || 'Helvetica';
        const fontSize = parseInt(formData.get('fontSize') as string || '12');
        const color = formData.get('color') as string || '#000000';
        const startNumber = parseInt(formData.get('startNumber') as string || '1');
        const prefix = formData.get('prefix') as string || '';
        const suffix = formData.get('suffix') as string || '';
        const marginX = parseInt(formData.get('marginX') as string || '40');
        const marginY = parseInt(formData.get('marginY') as string || '30');
        const selectedPages = formData.get('selectedPages') as string || '';
        const skipFirstPage = formData.get('skipFirstPage') === 'true';

        // Generate unique file names
        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(NUMBERED_DIR, `${uniqueId}-numbered.pdf`);

        // Save the uploaded PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`PDF saved to ${inputPath}`);

        // Load the PDF document
        const pdfBytes = await readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // Determine which pages to number
        let pagesToNumber = parsePageRanges(selectedPages, totalPages);

        // Skip the first page if option is enabled
        if (skipFirstPage) {
            pagesToNumber = pagesToNumber.filter(pageNum => pageNum !== 1);
        }

        console.log(`Numbering ${pagesToNumber.length} pages out of ${totalPages} total pages`);

        // Map font family to pdf-lib's StandardFonts
        let fontType: typeof StandardFonts[keyof typeof StandardFonts];
        switch (fontFamily) {
            case 'Times New Roman':
                fontType = StandardFonts.TimesRoman;
                break;
            case 'Courier':
                fontType = StandardFonts.Courier;
                break;
            case 'Helvetica':
            default:
                fontType = StandardFonts.Helvetica;
                break;
        }

        // Load font
        const font = await pdfDoc.embedFont(fontType);

        // Convert color from hex to rgb
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16) / 255;
        const g = parseInt(hexColor.substring(2, 4), 16) / 255;
        const b = parseInt(hexColor.substring(4, 6), 16) / 255;

        // Add page numbers to selected pages
        for (let i = 0; i < totalPages; i++) {
            const pageNum = i + 1;

            if (!pagesToNumber.includes(pageNum)) {
                continue;
            }

            const page = pdfDoc.getPage(i);
            const { width, height } = page.getSize();

            // Format the page number
            const formattedNumber = formatPageNumber(pageNum, format, startNumber);
            const textContent = `${prefix}${formattedNumber}${suffix}`;

            // Calculate text dimensions for positioning
            const textWidth = font.widthOfTextAtSize(textContent, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            // Calculate position based on alignment
            const { x, y } = calculatePosition(
                width,
                height,
                textWidth,
                textHeight,
                position,
                marginX,
                marginY
            );

            // Draw the page number
            page.drawText(textContent, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(r, g, b),
            });
        }

        // Save the modified PDF
        const numberedPdfBytes = await pdfDoc.save();
        await writeFile(outputPath, numberedPdfBytes);
        console.log(`Numbered PDF saved to ${outputPath}`);

        // Return success response with the file URL
        return NextResponse.json({
            success: true,
            message: 'PDF page numbers added successfully',
            fileUrl: `/api/file?folder=pagenumbers&filename=${uniqueId}-numbered.pdf`,
            fileName: `${uniqueId}-numbered.pdf`,
            originalName: file.name,
            totalPages,
            numberedPages: pagesToNumber.length
        });

    } catch (error) {
        console.error('PDF page numbering error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF page numbering',
                success: false
            },
            { status: 500 }
        );
    }
}