// app/api/pdf/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

// Define directories
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const EDITED_DIR = join(process.cwd(), 'public', 'edited');
const TEMP_DIR = join(process.cwd(), 'temp');

// Ensure directories exist
async function ensureDirectories() {
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
    if (!existsSync(EDITED_DIR)) await mkdir(EDITED_DIR, { recursive: true });
    if (!existsSync(TEMP_DIR)) await mkdir(TEMP_DIR, { recursive: true });
}

// Interface for text elements
interface TextElement {
    type: 'text';
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

// Interface for page data
interface PageData {
    imageUrl: string;
    width: number;
    height: number;
    drawings?: Array<TextElement>;
}

// Process PDF editing
export async function POST(request: NextRequest) {
    try {
        await ensureDirectories();

        // Parse JSON request body
        const body = await request.json();
        const { pdfName, pages } = body as { pdfName?: string; pages: PageData[] };

        if (!pages || !Array.isArray(pages) || pages.length === 0) {
            return NextResponse.json({ error: 'No page data provided' }, { status: 400 });
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const uniqueId = uuidv4();
        const outputPath = join(EDITED_DIR, `${uniqueId}-edited.pdf`);

        // Process each page
        for (let i = 0; i < pages.length; i++) {
            const pageData = pages[i];
            
            // Create a blank page with dimensions from original
            const page = pdfDoc.addPage([pageData.width || 595, pageData.height || 842]);
            
            // Add background image (the original page content)
            if (pageData.imageUrl) {
                try {
                    // Convert relative URL to absolute path
                    const imageName = pageData.imageUrl.split('/').pop();
                    const imagePath = join(process.cwd(), 'public', imageName || '');
                    
                    if (existsSync(imagePath)) {
                        // Embed the image
                        const imageBytes = await readFile(imagePath);
                        const image = await pdfDoc.embedPng(imageBytes);
                        
                        // Draw the image as the page background
                        page.drawImage(image, {
                            x: 0,
                            y: 0,
                            width: pageData.width || 595,
                            height: pageData.height || 842
                        });
                    } else {
                        console.warn(`Image not found: ${imagePath}`);
                    }
                } catch (imageError) {
                    console.error('Error adding background image:', imageError);
                }
            }
            
            // Process text elements for this page
            if (pageData.drawings && Array.isArray(pageData.drawings)) {
                // Apply text overlays
                for (const drawing of pageData.drawings) {
                    if (drawing.type === 'text' && drawing.text) {
                        await addTextToPdf(page, drawing, pageData.height || 842);
                    }
                }
            }
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        await writeFile(outputPath, pdfBytes);

        const fileUrl = `/edited/${uniqueId}-edited.pdf`;

        return NextResponse.json({
            success: true,
            message: "PDF saved successfully",
            fileUrl,
        });
    } catch (error) {
        console.error("Save error:", error);
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : "An unknown error occurred saving the PDF",
                success: false 
            },
            { status: 500 }
        );
    }
}

// Add text to the PDF
async function addTextToPdf(page: any, element: TextElement, pageHeight: number) {
    try {
        // Determine font family to use
        let fontName: keyof typeof StandardFonts = 'Helvetica';
        if (element.fontFamily) {
            if (element.fontFamily.includes('Times')) {
                fontName = 'TimesRoman';
            } else if (element.fontFamily.includes('Courier')) {
                fontName = 'Courier';
            }
        }

        // Load the font
        const font = await page.doc.embedFont(StandardFonts[fontName]);
        
        // Get font size or default to 12
        const fontSize = element.fontSize || 12;
        
        // Parse color (default to black if not provided)
        let r = 0, g = 0, b = 0;
        if (element.color && element.color.startsWith('#')) {
            const hex = element.color.slice(1);
            r = parseInt(hex.substring(0, 2), 16) / 255;
            g = parseInt(hex.substring(2, 4), 16) / 255;
            b = parseInt(hex.substring(4, 6), 16) / 255;
        }
        
        // Adjust y-coordinate (PDF uses bottom-left origin, our data uses top-left)
        const y = pageHeight - element.y - element.height;
        
        // Draw the text
        page.drawText(element.text, {
            x: element.x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(r, g, b)
        });
    } catch (error) {
        console.error('Error adding text to PDF:', error);
    }
}