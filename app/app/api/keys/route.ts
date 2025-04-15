// app/api/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { API_OPERATIONS } from '@/lib/validate-key';

// Define interface for API key
interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    lastUsed: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
}

// Generate a secure random API key
function generateApiKey(): string {
    return `sk_${randomBytes(24).toString('hex')}`;
}

// List API keys
export async function GET(request: NextRequest) {
    try {
        // Properly pass the request headers and cookies to getServerSession
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                name: true,
                key: true,
                permissions: true,
                lastUsed: true,
                expiresAt: true,
                createdAt: true,
            }
        });

        // Mask API keys for security
        const maskedKeys = apiKeys.map((key: ApiKey) => ({
            ...key,
            key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`
        }));

        return NextResponse.json({ keys: maskedKeys });
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API keys' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, permissions } = await request.json();

        // Check subscription limits on number of keys
        const userWithSub = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true, apiKeys: true }
        });

        const keyLimits: Record<string, number> = {
            free: 1,
            basic: 3,
            pro: 10,
            enterprise: 50
        };

        const tier = userWithSub?.subscription?.tier || 'free';
        const keyLimit = keyLimits[tier as keyof typeof keyLimits];

        // Safely check the length of apiKeys
        const currentKeyCount = userWithSub?.apiKeys?.length ?? 0;

        if (currentKeyCount >= keyLimit) {
            return NextResponse.json(
                { error: `Your ${tier} plan allows a maximum of ${keyLimit} API keys` },
                { status: 403 }
            );
        }

        // Validate permissions
        let validatedPermissions: string[] = [];
        
        // If permissions are provided, validate each one
        if (permissions && Array.isArray(permissions)) {
            // Filter to only include valid operations
            validatedPermissions = permissions.filter(perm => 
                API_OPERATIONS.includes(perm) || perm === '*'
            );
            
            // If wildcard permission is included, just use that
            if (permissions.includes('*')) {
                validatedPermissions = ['*'];
            }
        }
        
        // If no valid permissions were provided, use defaults based on subscription tier
        if (validatedPermissions.length === 0) {
            switch(tier) {
                case 'enterprise':
                    validatedPermissions = ['*']; // All permissions
                    break;
                case 'pro':
                    validatedPermissions = API_OPERATIONS; // All specific operations
                    break;
                case 'basic':
                    // Standard operations for basic tier
                    validatedPermissions = ['convert', 'compress', 'merge', 'split', 'protect', 'unlock'];
                    break;
                default: // free tier
                    // Limited operations for free tier
                    validatedPermissions = ['convert', 'compress', 'merge', 'split'];
            }
        }

        // Create new API key
        const apiKey = await prisma.apiKey.create({
            data: {
                userId: session.user.id,
                name: name || 'API Key',
                key: generateApiKey(),
                permissions: validatedPermissions,
            }
        });

        return NextResponse.json({
            success: true,
            key: apiKey
        });
    } catch (error) {
        console.error('Error creating API key:', error);
        return NextResponse.json(
            { error: 'Failed to create API key' },
            { status: 500 }
        );
    }
}