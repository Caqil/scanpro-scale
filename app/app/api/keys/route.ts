// app/api/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
        // Get the current session
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

        // Get user with their API keys
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { apiKeys: true, transactions: { take: 1 } }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Define key limits based on whether user is paid or free
        // A user is considered "paid" if they have made at least one deposit
        const isPaidUser = user.transactions.length > 0 || (user.balance && user.balance > 0);
        
        // Key limits by user type
        const keyLimits: Record<string, number> = {
            free: 1,   // Free users get 1 key
            paid: 10   // Paid users get 10 keys
        };

        // Determine user's key limit
        const userType = isPaidUser ? 'paid' : 'free';
        const keyLimit = keyLimits[userType];
        const currentKeyCount = user.apiKeys.length;

        if (currentKeyCount >= keyLimit) {
            return NextResponse.json(
                { error: `As a ${userType} user, you are limited to ${keyLimit} API ${keyLimit === 1 ? 'key' : 'keys'}. Add funds to your account to increase this limit.` },
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
        
        // If no valid permissions were provided, use defaults based on user type
        if (validatedPermissions.length === 0) {
            if (isPaidUser) {
                // Paid users get all operations
                validatedPermissions = ['*'];
            } else {
                // Free users get limited operations
                validatedPermissions = ['convert', 'compress', 'merge', 'split'];
            }
        } else {
            // Restrict free users from certain operations
            if (!isPaidUser) {
                const allowedFreeOperations = ['convert', 'compress', 'merge', 'split'];
                validatedPermissions = validatedPermissions.filter(perm => 
                    allowedFreeOperations.includes(perm) || perm === '*'
                );
                // Replace wildcard with just the allowed operations for free users
                if (validatedPermissions.includes('*')) {
                    validatedPermissions = allowedFreeOperations;
                }
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