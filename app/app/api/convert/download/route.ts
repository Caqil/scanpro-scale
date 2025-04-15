// app/api/convert/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Get content type from file extension
function getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
        pdf: "application/pdf",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        doc: "application/msword",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        xls: "application/vnd.ms-excel",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ppt: "application/vnd.ms-powerpoint",
        txt: "text/plain",
        html: "text/html",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        rtf: "application/rtf",
        odt: "application/vnd.oasis.opendocument.text",
        csv: "text/csv",
    };

    return contentTypes[extension] || "application/octet-stream";
}

export function GET(request: NextRequest) {
    try {
        // Get filename from query parameter
        const url = new URL(request.url);
        const filename = url.searchParams.get('file');

        if (!filename) {
            return NextResponse.json(
                { error: 'No filename provided' },
                { status: 400 }
            );
        }

        // Sanitize the filename
        const sanitizedFilename = filename.replace(/[^\w.-]/g, "");

        if (!sanitizedFilename) {
            return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
        }

        // Get file path
        const filePath = path.join(process.cwd(), "public", "conversions", sanitizedFilename);

        // Check if file exists
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Get file stats
        const fileStats = stat(filePath);

        // Read file
        const fileBuffer = readFile(filePath);

        // Return a promise that resolves with the response
        return Promise.all([fileStats, fileBuffer]).then(([stats, buffer]) => {
            // Get file extension
            const extension = sanitizedFilename.split(".").pop()?.toLowerCase() || "";

            // Create response with file
            return new NextResponse(buffer, {
                headers: {
                    "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
                    "Content-Type": getContentType(extension),
                    "Content-Length": stats.size.toString(),
                },
            });
        }).catch(error => {
            console.error("Download error:", error);
            return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
        });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }
}