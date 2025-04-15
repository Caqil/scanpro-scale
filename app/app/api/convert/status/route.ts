// app/api/convert/status/route.ts 
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import os from 'os';

const execPromise = promisify(exec);

export async function GET() {
    try {
        // Storage paths
        const UPLOAD_DIR = join(process.cwd(), 'uploads');
        const CONVERSION_DIR = join(process.cwd(), 'public', 'conversions');

        // Check directory existence
        const uploadDirExists = existsSync(UPLOAD_DIR);
        const conversionDirExists = existsSync(CONVERSION_DIR);

        // Count files in directories
        let uploadCount = 0;
        let conversionCount = 0;

        if (uploadDirExists) {
            const uploadFiles = await readdir(UPLOAD_DIR);
            uploadCount = uploadFiles.length;
        }

        if (conversionDirExists) {
            const conversionFiles = await readdir(CONVERSION_DIR);
            conversionCount = conversionFiles.length;
        }

        // Check if LibreOffice is installed
        let libreOfficeVersion = 'Not installed';
        let libreOfficeInstalled = false;

        try {
            const { stdout } = await execPromise('libreoffice --version');
            libreOfficeVersion = stdout.trim();
            libreOfficeInstalled = true;
        } catch (error) {
            // LibreOffice not found or error executing command
            console.error('LibreOffice error:', error);
        }

        // System information
        const status = {
            uptime: process.uptime(),
            timestamp: Date.now(),
            nodejs: process.version,
            os: {
                platform: process.platform,
                release: os.release(),
                type: os.type(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                loadAverage: os.loadavg(),
            },
            storage: {
                uploadDirExists,
                conversionDirExists,
                uploadCount,
                conversionCount,
            },
            dependencies: {
                libreOfficeInstalled,
                libreOfficeVersion,
            },
            status: libreOfficeInstalled ? 'healthy' : 'degraded',
        };

        return NextResponse.json(status);
    } catch (error) {
        console.error('Status API error:', error);

        return NextResponse.json(
            {
                error: 'Failed to get system status',
                status: 'error'
            },
            { status: 500 }
        );
    }
}