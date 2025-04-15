// app/api/pdf/split/status/route.ts
import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Directory for status files
const STATUS_DIR = join(process.cwd(), 'public', 'status');

export async function GET(request: NextRequest) {
    try {
        // Get job ID from query parameter
        const url = new URL(request.url);
        const jobId = url.searchParams.get('id');

        if (!jobId) {
            return new Response(
                JSON.stringify({ error: 'No job ID provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate job ID format (should be a UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(jobId)) {
            return new Response(
                JSON.stringify({ error: 'Invalid job ID format' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if status file exists
        const statusPath = join(STATUS_DIR, `${jobId}-status.json`);
        
        if (!existsSync(statusPath)) {
            return new Response(
                JSON.stringify({ error: 'Job not found', jobId }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Read status file
        const statusData = await readFile(statusPath, 'utf-8');
        let status;
        
        try {
            status = JSON.parse(statusData);
        } catch (error) {
            return new Response(
                JSON.stringify({ error: 'Invalid status data', jobId }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Return status
        return new Response(
            JSON.stringify({
                ...status,
                jobId
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching job status:', error);
        
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                success: false
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}