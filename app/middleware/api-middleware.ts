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

// Cost per operation in USD
const OPERATION_COST = 0.005;

// Monthly free operations allowance
const FREE_OPERATIONS_MONTHLY = 500;

// API rate limits (separate from operation charging)
const API_RATE_LIMITS = {
    limit: 300, // 5 requests per minute
    window: 60, // 1 minute window
};

// Web UI bypass check
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
            user: {
                select: {
                    id: true,
                    balance: true,
                    freeOperationsUsed: true,
                    freeOperationsReset: true
                }
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

    // Apply rate limiting
    if (redis) {
        const { limit, window } = API_RATE_LIMITS;
        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${window}s`),
            analytics: true,
            prefix: 'MegaPDF:ratelimit',
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

    // --- Handle charging for operations ---
    try {
        // Get the user from the API key
        const user = keyRecord.user;

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 500 }
            );
        }

        // Current date for comparison
        const now = new Date();
        
        // Initialize operation counters and user data for possible updates
        let freeOpsUsed = user.freeOperationsUsed || 0;
        let newBalance = user.balance || 0;
        let resetDate = user.freeOperationsReset;
        let usedFreeOperation = false;
        
        // Check if free operations should be reset
        if (resetDate && resetDate < now) {
            // Calculate new reset date (first day of next month)
            const nextResetDate = new Date();
            nextResetDate.setDate(1); // First day of current month
            nextResetDate.setMonth(nextResetDate.getMonth() + 1); // First day of next month
            nextResetDate.setHours(0, 0, 0, 0);
            
            // Reset free operations counter
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    freeOperationsUsed: 0,
                    freeOperationsReset: nextResetDate
                }
            });
            
            freeOpsUsed = 0;
            resetDate = nextResetDate;
        }
        
        // Check if free operations are available
        if (freeOpsUsed < FREE_OPERATIONS_MONTHLY) {
            // Use a free operation
            usedFreeOperation = true;
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    freeOperationsUsed: { increment: 1 }
                }
            });
            
            freeOpsUsed++;
        } else {
            // No free operations left, use balance
            if (newBalance < OPERATION_COST) {
                return NextResponse.json(
                    {
                        error: 'Insufficient balance',
                        currentBalance: newBalance,
                        requiredBalance: OPERATION_COST,
                        message: `Please add funds to your account. Each operation costs $${OPERATION_COST.toFixed(3)}.`
                    },
                    { status: 402 } // 402 Payment Required
                );
            }
            
            // Deduct the cost from balance
            newBalance -= OPERATION_COST;
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    balance: newBalance
                }
            });
            
            // Record transaction
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: -OPERATION_COST,
                    balanceAfter: newBalance,
                    description: `Operation: ${operation}`,
                    status: 'completed'
                }
            });
        }
        
        // Track the operation in usage stats (regardless of whether it was free or paid)
        await recordOperationUsage(user.id, operation);
        
        // Continue with the request
        const response = NextResponse.next();
        
        // Add header information about the operation cost and remaining balance
        if (usedFreeOperation) {
            response.headers.set('X-Operation-Cost', '0'); // Free operation
            response.headers.set('X-Free-Operations-Used', freeOpsUsed.toString());
            response.headers.set('X-Free-Operations-Remaining', (FREE_OPERATIONS_MONTHLY - freeOpsUsed).toString());
        } else {
            response.headers.set('X-Operation-Cost', OPERATION_COST.toString());
            response.headers.set('X-Current-Balance', newBalance.toString());
            response.headers.set('X-Free-Operations-Used', FREE_OPERATIONS_MONTHLY.toString()); 
            response.headers.set('X-Free-Operations-Remaining', '0');
        }
        
        return response;
    } catch (error) {
        console.error('Error processing operation charge:', error);
        return NextResponse.json(
            { error: 'Failed to process operation' },
            { status: 500 }
        );
    }
}

// Helper function to record operation usage
async function recordOperationUsage(userId: string, operation: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
        await prisma.usageStats.upsert({
            where: {
                userId_operation_date: {
                    userId,
                    operation,
                    date: today
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                userId,
                operation,
                count: 1,
                date: today
            }
        });
    } catch (error) {
        console.error('Error recording operation usage:', error);
        // Continue execution even if recording usage fails
    }
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};