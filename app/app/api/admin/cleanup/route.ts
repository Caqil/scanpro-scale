// app/api/admin/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cleanupFiles } from '@/lib/cleanup-service';
import { prisma } from '@/lib/prisma';

// Get all admin users from database
async function getAdminUsers(): Promise<string[]> {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true }
    });
    
    return adminUsers.map((user: { id: string }) => user.id);
  }
export async function GET(request: NextRequest) {
    try {
        // Get API key from header or query param
        const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 401 }
            );
        }

        // Look up the API key in the database
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: {
                user: true
            }
        });

        if (!keyRecord) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // Check if user has admin role
        if (keyRecord.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        // Get max age from query string or use default
        const searchParams = request.nextUrl.searchParams;
        const maxAgeMinutes = parseInt(searchParams.get('maxAge') || '60');

        // Run cleanup
        const result = await cleanupFiles(maxAgeMinutes);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Cleanup completed. Removed ${result.stats?.totalCleaned} files (${formatBytes(result.stats?.totalSize || 0)})`,
            details: result.stats
        });
    } catch (error) {
        console.error('Cleanup API error:', error);

        return NextResponse.json(
            { error: 'Failed to run cleanup' },
            { status: 500 }
        );
    }
}

// Helper to format bytes into human-readable format
function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}