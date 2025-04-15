// app/api/compress/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
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
    const sanitizedFilename = filename.replace(/[^\w.-]/g, '');

    if (!sanitizedFilename) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Get file path
    const filePath = join(process.cwd(), 'public', 'compressions', sanitizedFilename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get file stats
    const stats = await stat(filePath);

    // Read file
    const fileBuffer = await readFile(filePath);

    // Create response with file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        'Content-Type': 'application/pdf',
        'Content-Length': stats.size.toString()
      }
    });
  } catch (error) {
    console.error('Download error:', error);

    return NextResponse.json(
      { error: 'Failed to download compressed file' },
      { status: 500 }
    );
  }
}