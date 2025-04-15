// middleware/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';

// Set up rate limiting with Upstash Redis
let redis: Redis;
try {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_URL!,
        token: process.env.UPSTASH_REDIS_TOKEN!,
    });
} catch (error) {
    console.warn('Redis configuration error. Using fallback rate limiting.', error);
}

// Define rate limits based on subscription tier
const rateLimits = {
    free: {
        limit: 100,
        window: 3600, // 100 requests per hour (3600 seconds)
    },
    basic: {
        limit: 1000,
        window: 3600, // 1000 requests per hour
    },
    pro: {
        limit: 2000,
        window: 3600, // 2000 requests per hour
    },
    enterprise: {
        limit: 5000,
        window: 3600, // 5000 requests per hour
    },
};

// Define usage limits by tier (operations per month)
const usageLimits = {
    free: 100,
    basic: 1000,
    pro: 10000,
    enterprise: 100000,
};

// Web UI bypass check - this function identifies browser-based requests
function isWebUIRequest(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const acceptHeader = request.headers.get('accept') || '';

    // Browser user agent patterns
    const browserPatterns = [
        'Mozilla/',
        'Chrome/',
        'Safari/',
        'Firefox/',
        'Edge/',
        'Opera/'
    ];

    // Check for browser user agent
    const isBrowser = browserPatterns.some(pattern => userAgent.includes(pattern));

    // Check if accepts HTML
    const acceptsHtml = acceptHeader.includes('text/html');

    // Check if referred from our own website
    const ownSiteReferer = referer.includes(process.env.NEXT_PUBLIC_APP_URL || '');

    // Consider it a web UI request if:
    // 1. It comes from a browser
    // 2. It accepts HTML or is referred from our own site
    return isBrowser && (acceptsHtml || ownSiteReferer);
}

export async function apiMiddleware(request: NextRequest) {
    // Always allow web UI requests to bypass API key check
    if (isWebUIRequest(request)) {
        console.log('Detected web UI request - bypassing API key check');
        return NextResponse.next();
    }

    // Get API key from header or query param
    const apiKey = request.headers.get('x-api-key');

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
            user: {
                include: { subscription: true }
            }
        }
    });

    if (!keyRecord) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        );
    }

    // Check if key is expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
        return NextResponse.json(
            { error: 'API key has expired' },
            { status: 401 }
        );
    }

    // Extract operation from URL path
    const path = request.nextUrl.pathname;
    const operation = path.split('/').pop() || 'unknown';

    // Check if the API key has permission for the requested operation
    if (!keyRecord.permissions.includes(operation) && !keyRecord.permissions.includes('*')) {
        return NextResponse.json(
            { error: `This API key does not have permission to perform the '${operation}' operation` },
            { status: 403 }
        );
    }

    // Get subscription tier
    const tier = keyRecord.user.subscription?.tier || 'free';

    // Apply rate limiting based on subscription tier
    if (redis) {
        const { limit, window } = rateLimits[tier as keyof typeof rateLimits];
        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${window}s`), // Explicitly add 's' for seconds
            analytics: true,
            prefix: 'scanpro:ratelimit',
        });

        // Use the API key as the identifier for rate limiting
        const { success, remaining, reset } = await ratelimit.limit(apiKey);

        if (!success) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    limit,
                    remaining: 0,
                    reset: new Date(reset).toISOString(),
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(reset).toISOString(),
                    },
                }
            );
        }
    }

    // Update last used timestamp for the API key
    await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsed: new Date() }
    });

    // Check monthly usage limit BEFORE incrementing
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.usageStats.aggregate({
        where: {
            userId: keyRecord.user.id,
            date: { gte: firstDayOfMonth }
        },
        _sum: {
            count: true
        }
    });

    const totalUsage = monthlyUsage._sum.count || 0;
    const usageLimit = usageLimits[tier as keyof typeof usageLimits];

    if (totalUsage >= usageLimit) {
        return NextResponse.json(
            {
                error: `Monthly usage limit of ${usageLimit} operations reached for your ${tier} plan`,
                usage: totalUsage,
                limit: usageLimit
            },
            { status: 403 }
        );
    }

    // Now we can safely track usage statistics (AFTER checking the limit)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageStats.upsert({
        where: {
            userId_operation_date: {
                userId: keyRecord.user.id,
                operation,
                date: today
            }
        },
        update: {
            count: { increment: 1 }
        },
        create: {
            userId: keyRecord.user.id,
            operation,
            count: 1,
            date: today
        }
    });

    // Continue with the request
    const response = NextResponse.next();

    // Add rate limit headers
    if (redis) {
        const { limit, window } = rateLimits[tier as keyof typeof rateLimits];
        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${window}s`),
            analytics: true,
            prefix: 'scanpro:ratelimit',
        });

        const { remaining, reset } = await ratelimit.limit(apiKey);

        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
    }

    return response;
}