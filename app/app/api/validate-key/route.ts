import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory API key cache for faster validation
type ApiKeyCache = {
    [key: string]: {
        userId: string;
        permissions: string[];
        tier: string;
        valid: boolean;
        timestamp: number;
    }
};

const API_KEY_CACHE: ApiKeyCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

const rateLimits = {
    free: { limit: 100, window: '1 h' },
    basic: { limit: 1000, window: '1 h' },
    pro: { limit: 2000, window: '1 h' },
    enterprise: { limit: 5000, window: '1 h' },
};

// Schedule cache cleanup
if (typeof global !== 'undefined') {
    const intervalId = setInterval(() => {
        const now = Date.now();
        Object.entries(API_KEY_CACHE).forEach(([key, data]) => {
            if (now - data.timestamp > CACHE_TTL) {
                delete API_KEY_CACHE[key];
            }
        });
    }, CACHE_CLEANUP_INTERVAL);

    if (process.env.NODE_ENV === 'development') {
        // @ts-ignore
        if (global._apiValidatorIntervalId) {
            // @ts-ignore
            clearInterval(global._apiValidatorIntervalId);
        }
        // @ts-ignore
        global._apiValidatorIntervalId = intervalId;
    }
}

// Core validation logic
async function validateApiKey(apiKey: string, operation?: string) {
    if (!apiKey) {
        return { valid: false, error: 'API key is required', status: 400 };
    }

    // Check cache first
    if (API_KEY_CACHE[apiKey] && Date.now() - API_KEY_CACHE[apiKey].timestamp < CACHE_TTL) {
        const cachedData = API_KEY_CACHE[apiKey];
        if (!cachedData.valid) {
            return { valid: false, error: 'Invalid API key', status: 401 };
        }
        if (operation && !cachedData.permissions.includes('*') && !cachedData.permissions.includes(operation)) {
            return { valid: false, error: `This API key does not have permission to perform the '${operation}' operation`, status: 403 };
        }
        return {
            valid: true,
            userId: cachedData.userId,
            tier: cachedData.tier,
            permissions: cachedData.permissions,
            limit: rateLimits[cachedData.tier as keyof typeof rateLimits].limit
        };
    }

    // Validate against database
    try {
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { user: { include: { subscription: true } } }
        });

        if (!keyRecord) {
            API_KEY_CACHE[apiKey] = { userId: '', permissions: [], tier: 'free', valid: false, timestamp: Date.now() };
            return { valid: false, error: 'Invalid API key', status: 401 };
        }

        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            API_KEY_CACHE[apiKey] = {
                userId: keyRecord.userId,
                permissions: keyRecord.permissions,
                tier: keyRecord.user.subscription?.tier || 'free',
                valid: false,
                timestamp: Date.now()
            };
            return { valid: false, error: 'API key has expired', status: 401 };
        }

        if (operation && !keyRecord.permissions.includes('*') && !keyRecord.permissions.includes(operation)) {
            return { valid: false, error: `This API key does not have permission to perform the '${operation}' operation`, status: 403 };
        }

        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsed: new Date() }
        });

        const tier = keyRecord.user.subscription?.tier || 'free';
        API_KEY_CACHE[apiKey] = {
            userId: keyRecord.userId,
            permissions: keyRecord.permissions,
            tier,
            valid: true,
            timestamp: Date.now()
        };

        return {
            valid: true,
            userId: keyRecord.userId,
            tier,
            permissions: keyRecord.permissions,
            limit: rateLimits[tier as keyof typeof rateLimits].limit
        };
    } catch (error) {
        console.error('Database error during API key validation:', error);
        if (apiKey === process.env.SYSTEM_API_KEY) {
            return {
                valid: true,
                userId: 'system',
                tier: 'enterprise',
                permissions: ['*'],
                limit: rateLimits.enterprise.limit,
                emergency: true
            };
        }
        return { valid: false, error: 'Error validating API key', status: 500 };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { apiKey, operation } = await request.json();
        const result = await validateApiKey(apiKey, operation);
        return NextResponse.json(result, { status: result.status || 200 });
    } catch (error) {
        console.error('Error processing API key validation request:', error);
        return NextResponse.json({ valid: false, error: 'Invalid request format' }, { status: 400 });
    }
}

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');
    const operation = request.nextUrl.searchParams.get('operation');
    const result = await validateApiKey(apiKey || '', operation || undefined);
    return NextResponse.json(result, { status: result.status || 200 });
}