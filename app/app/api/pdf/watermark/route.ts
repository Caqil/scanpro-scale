// app/api/pdf/watermark/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import sharp from 'sharp';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';

const execPromise = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const WATERMARKED_DIR = join(process.cwd(), 'public', 'watermarks');
const TEMP_DIR = join(process.cwd(), 'temp');

async function ensureDirectories() {
    const dirs = [UPLOAD_DIR, WATERMARKED_DIR, TEMP_DIR];
    for (const dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
    }
}

function parsePageRanges(pagesString: string, totalPages: number): number[] {
    const pages: number[] = [];
    const parts = pagesString.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        if (trimmedPart.includes('-')) {
            const [startStr, endStr] = trimmedPart.split('-');
            const start = parseInt(startStr.trim());
            const end = parseInt(endStr.trim());

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= Math.min(end, totalPages); i++) {
                    if (!pages.includes(i) && i > 0) {
                        pages.push(i);
                    }
                }
            }
        } else {
            const pageNum = parseInt(trimmedPart);
            if (!isNaN(pageNum) && !pages.includes(pageNum) && pageNum > 0 && pageNum <= totalPages) {
                pages.push(pageNum);
            }
        }
    }

    return pages.sort((a, b) => a - b);
}

function getPagesToWatermark(
    totalPages: number,
    pageOption: string,
    customPages: string
): number[] {
    switch (pageOption) {
        case 'all':
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        case 'even':
            return Array.from({ length: Math.floor(totalPages / 2) }, (_, i) => (i + 1) * 2);
        case 'odd':
            return Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => i * 2 + 1).filter(p => p <= totalPages);
        case 'custom':
            return parsePageRanges(customPages, totalPages);
        default:
            return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
}

function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
}

function calculateWatermarkPositions(
    position: string,
    width: number,
    height: number,
    watermarkWidth: number,
    watermarkHeight: number,
    customX?: number,
    customY?: number
): { x: number; y: number }[] {
    let positions: { x: number; y: number }[] = [];

    const paddingX = width * 0.05;
    const paddingY = height * 0.05;

    // For custom positions, interpret customY as percentage from top (UI-style),
    // then invert it for pdf-lib (bottom-left origin)
    const safeCustomX = customX !== undefined ? Math.min(Math.max(customX, 0), 100) : 50;
    const safeCustomY = customY !== undefined ? Math.min(Math.max(customY, 0), 100) : 50;
    const adjustedCustomY = 100 - safeCustomY; // Invert Y for bottom-left origin

    switch (position.toLowerCase()) {
        case "center":
            positions.push({
                x: width / 2 - watermarkWidth / 2,
                y: height / 2 - watermarkHeight / 2,
            });
            break;

        case "tile": {
            const tileWidth = width / 3;
            const tileHeight = height / 3;
            for (let x = tileWidth / 2; x < width; x += tileWidth) {
                for (let y = tileHeight / 2; y < height; y += tileHeight) {
                    positions.push({
                        x: x - watermarkWidth / 2,
                        y: y - watermarkHeight / 2,
                    });
                }
            }
            break;
        }

        case "top-left":
            positions.push({
                x: paddingX,
                y: height - paddingY - watermarkHeight,
            });
            break;

        case "top-right":
            positions.push({
                x: width - paddingX - watermarkWidth,
                y: height - paddingY - watermarkHeight,
            });
            break;

        case "bottom-left":
            positions.push({
                x: paddingX,
                y: paddingY,
            });
            break;

        case "bottom-right":
            positions.push({
                x: width - paddingX - watermarkWidth,
                y: paddingY,
            });
            break;

        case "custom":
            positions.push({
                x: (safeCustomX / 100) * width - watermarkWidth / 2,
                y: (adjustedCustomY / 100) * height - watermarkHeight / 2, // Invert Y
            });
            break;

        default:
            positions.push({
                x: width / 2 - watermarkWidth / 2,
                y: height / 2 - watermarkHeight / 2,
            });
            console.warn(`Unknown position "${position}", defaulting to center`);
    }

    return positions;
}

async function addTextWatermark(
    pdfDoc: PDFDocument,
    pages: number[],
    options: {
        text: string;
        fontSize: number;
        fontFamily: string;
        color: string;
        opacity: number;
        rotation: number;
        position: string;
        customX?: number;
        customY?: number;
    }
): Promise<void> {
    try {
        let fontType: typeof StandardFonts[keyof typeof StandardFonts];
        switch (options.fontFamily) {
            case 'Times New Roman':
                fontType = StandardFonts.TimesRoman;
                break;
            case 'Courier':
                fontType = StandardFonts.Courier;
                break;
            case 'Helvetica':
                fontType = StandardFonts.Helvetica;
                break;
            default:
                fontType = StandardFonts.Helvetica;
        }

        const font = await pdfDoc.embedFont(fontType);
        const [r, g, b] = hexToRgb(options.color);

        for (const pageNum of pages) {
            const pageIndex = pageNum - 1;
            if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

            const page = pdfDoc.getPage(pageIndex);
            const { width, height } = page.getSize();

            const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
            const textHeight = font.heightAtSize(options.fontSize);

            const positions = calculateWatermarkPositions(
                options.position,
                width,
                height,
                textWidth,
                textHeight,
                options.customX,
                options.customY
            );

            for (const pos of positions) {
                page.drawText(options.text, {
                    x: pos.x,
                    y: pos.y,
                    size: options.fontSize,
                    font,
                    color: rgb(r, g, b),
                    opacity: options.opacity / 100,
                    rotate: degrees(options.rotation),
                });
            }
        }
    } catch (error) {
        console.error('Error adding text watermark:', error);
        throw error;
    }
}

async function addImageWatermark(
    pdfDoc: PDFDocument,
    pages: number[],
    imageBuffer: Buffer,
    options: {
        scale: number;
        opacity: number;
        rotation: number;
        position: string;
        customX?: number;
        customY?: number;
    }
): Promise<void> {
    try {
        const imageType = await determineImageType(imageBuffer);
        let embeddedImage;

        if (imageType === 'svg') {
            const pngBuffer = await sharp(imageBuffer).png().toBuffer();
            embeddedImage = await pdfDoc.embedPng(pngBuffer);
        } else if (imageType === 'png') {
            embeddedImage = await pdfDoc.embedPng(imageBuffer);
        } else {
            embeddedImage = await pdfDoc.embedJpg(imageBuffer);
        }

        const { width: imgWidth, height: imgHeight } = embeddedImage;
        const scaleFactor = options.scale / 100;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;

        for (const pageNum of pages) {
            const pageIndex = pageNum - 1;
            if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;

            const page = pdfDoc.getPage(pageIndex);
            const { width: pageWidth, height: pageHeight } = page.getSize();

            const positions = calculateWatermarkPositions(
                options.position,
                pageWidth,
                pageHeight,
                scaledWidth,
                scaledHeight,
                options.customX,
                options.customY
            );

            for (const pos of positions) {
                page.drawImage(embeddedImage, {
                    x: pos.x,
                    y: pos.y,
                    width: scaledWidth,
                    height: scaledHeight,
                    opacity: options.opacity / 100,
                    rotate: degrees(options.rotation),
                });
            }
        }
    } catch (error) {
        console.error('Error adding image watermark:', error);
        throw error;
    }
}

async function determineImageType(buffer: Buffer): Promise<'jpeg' | 'png' | 'svg'> {
    if (buffer.length < 4) {
        return 'jpeg';
    }

    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47
    ) {
        return 'png';
    }

    const headerStr = buffer.slice(0, 100).toString('utf-8').toLowerCase();
    if (
        (headerStr.includes('<?xml') && headerStr.includes('<svg')) ||
        headerStr.startsWith('<svg')
    ) {
        return 'svg';
    }

    return 'jpeg';
}

export async function POST(request: NextRequest) {
    try {
        console.log('Starting PDF watermarking process...');

        const headers = request.headers;
        const url = new URL(request.url);
        const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

        if (apiKey) {
            console.log('Validating API key for watermarking operation');
            const validation = await validateApiKey(apiKey, 'watermark');

            if (!validation.valid) {
                console.error('API key validation failed:', validation.error);
                return NextResponse.json(
                    { error: validation.error || 'Invalid API key' },
                    { status: 401 }
                );
            }

            if (validation.userId) {
                trackApiUsage(validation.userId, 'watermark');
            }
        }

        await ensureDirectories();

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const watermarkType = (formData.get('watermarkType') as string) || 'text';

        const position = (formData.get('position') as string) || 'center';
        const pages = (formData.get('pages') as string) || 'all';
        const customPages = (formData.get('customPages') as string) || '';
        const opacity = parseInt(formData.get('opacity') as string || '30');
        const rotation = parseInt(formData.get('rotation') as string || '45');

        const customX = position === 'custom' ? parseFloat(formData.get('customX') as string || '50') : undefined;
        const customY = position === 'custom' ? parseFloat(formData.get('customY') as string || '50') : undefined;

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return NextResponse.json(
                { error: 'Only PDF files can be watermarked' },
                { status: 400 }
            );
        }

        const uniqueId = uuidv4();
        const inputPath = join(UPLOAD_DIR, `${uniqueId}-input.pdf`);
        const outputPath = join(WATERMARKED_DIR, `${uniqueId}-watermarked.pdf`);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);
        console.log(`PDF saved to ${inputPath}`);

        const pdfBytes = await readFile(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        const pagesToWatermark = getPagesToWatermark(totalPages, pages, customPages);

        if (pagesToWatermark.length === 0) {
            return NextResponse.json(
                { error: 'No valid pages selected for watermarking' },
                { status: 400 }
            );
        }

        if (watermarkType === 'text') {
            const text = (formData.get('text') as string) || 'WATERMARK';
            const textColor = (formData.get('textColor') as string) || '#FF0000';
            const fontSize = parseInt(formData.get('fontSize') as string || '48');
            const fontFamily = (formData.get('fontFamily') as string) || 'Arial';

            await addTextWatermark(pdfDoc, pagesToWatermark, {
                text,
                fontSize,
                fontFamily,
                color: textColor,
                opacity,
                rotation,
                position,
                customX,
                customY,
            });
        } else if (watermarkType === 'image') {
            const watermarkImage = formData.get('watermarkImage') as File;

            if (!watermarkImage) {
                return NextResponse.json(
                    { error: 'No watermark image provided' },
                    { status: 400 }
                );
            }

            const scale = parseInt(formData.get('scale') as string || '50');
            const imageBuffer = Buffer.from(await watermarkImage.arrayBuffer());

            await addImageWatermark(pdfDoc, pagesToWatermark, imageBuffer, {
                scale,
                opacity,
                rotation,
                position,
                customX,
                customY,
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid watermark type' },
                { status: 400 }
            );
        }

        const watermarkedPdfBytes = await pdfDoc.save();
        await writeFile(outputPath, watermarkedPdfBytes);

        const fileUrl = `/api/file?folder=watermarks&filename=${uniqueId}-watermarked.pdf`;

        return NextResponse.json({
            success: true,
            message: 'PDF watermarked successfully',
            fileUrl,
            filename: `${uniqueId}-watermarked.pdf`,
            originalName: file.name,
            pagesWatermarked: pagesToWatermark.length,
        });
    } catch (error) {
        console.error('PDF watermarking error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'An unknown error occurred during PDF watermarking',
                success: false,
            },
            { status: 500 }
        );
    }
}