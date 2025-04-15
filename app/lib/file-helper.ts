// lib/file-helper.ts
import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessedFile {
    filePath: string;
    publicUrl: string;
    fileName: string;
}

export async function saveUploadedFile(
    file: Buffer,
    directory: string,
    prefix: string,
    extension: string
): Promise<ProcessedFile> {
    // Ensure directory exists
    const dir = join(process.cwd(), 'public', directory);
    if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }

    // Create unique filename
    const uniqueId = uuidv4();
    const fileName = `${prefix}-${uniqueId}.${extension}`;
    const filePath = join(dir, fileName);

    // Write file
    await writeFile(filePath, file);

    // Return file paths
    return {
        filePath,
        publicUrl: `/${directory}/${fileName}`,
        fileName
    };
}