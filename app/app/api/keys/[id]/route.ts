// app/api/keys/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        // Extract the ID from the URL path
        const url = request.url;
        const pathParts = url.split('/');
        const id = pathParts[pathParts.length - 1];

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const apiKey = await prisma.apiKey.findUnique({
            where: { id }
        });

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not found' },
                { status: 404 }
            );
        }

        // Make sure user owns this key
        if (apiKey.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete the key
        await prisma.apiKey.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        console.error('Error revoking API key:', error);
        return NextResponse.json(
            { error: 'Failed to revoke API key' },
            { status: 500 }
        );
    }
}