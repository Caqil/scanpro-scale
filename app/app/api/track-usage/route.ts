// app/api/track-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Queue to batch usage updates
interface UsageEvent {
    userId: string;
    operation: string;
    timestamp: Date;
    attempts: number;
}

const usageQueue: UsageEvent[] = [];
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 3;
let processingQueue = false;

// Process the queue in batches to reduce database load
async function processQueue() {
    if (processingQueue || usageQueue.length === 0) return;

    processingQueue = true;
    console.log(`Processing usage queue with ${usageQueue.length} events`);

    try {
        // Take a batch of events from the queue
        const batch = usageQueue.splice(0, 50);

        // Group by user and operation
        const groupedEvents = batch.reduce((acc, event) => {
            const key = `${event.userId}:${event.operation}:${event.timestamp.toDateString()}`;
            if (!acc[key]) {
                acc[key] = {
                    userId: event.userId,
                    operation: event.operation,
                    date: new Date(event.timestamp.setHours(0, 0, 0, 0)),
                    count: 0
                };
            }
            acc[key].count++;
            return acc;
        }, {} as Record<string, {
            userId: string;
            operation: string;
            date: Date;
            count: number;
        }>);

        // Update database in a transaction
        await prisma.$transaction(
            Object.values(groupedEvents).map(event => {
                return prisma.usageStats.upsert({
                    where: {
                        userId_operation_date: {
                            userId: event.userId,
                            operation: event.operation,
                            date: event.date
                        }
                    },
                    update: {
                        count: { increment: event.count }
                    },
                    create: {
                        userId: event.userId,
                        operation: event.operation,
                        date: event.date,
                        count: event.count
                    }
                });
            })
        );
    } catch (error) {
        console.error('Error processing usage queue:', error);

        
    } finally {
        processingQueue = false;

        // If there are more events, process them after a short delay
        if (usageQueue.length > 0) {
            setTimeout(processQueue, 1000);
        }
    }
}

// Schedule periodic processing
if (typeof global !== 'undefined') {
    const intervalId = setInterval(() => {
        if (usageQueue.length > 0) {
            processQueue();
        }
    }, 30000); // Process every 30 seconds

    // Prevent memory leaks in development with hot reloading
    if (process.env.NODE_ENV === 'development') {
        // @ts-ignore
        if (global._trackUsageIntervalId) {
            // @ts-ignore
            clearInterval(global._trackUsageIntervalId);
        }
        // @ts-ignore
        global._trackUsageIntervalId = intervalId;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, operation, timestamp } = await request.json();

        if (!userId || !operation) {
            return NextResponse.json(
                { error: 'User ID and operation are required' },
                { status: 400 }
            );
        }

        // Add to queue
        usageQueue.push({
            userId,
            operation,
            timestamp: new Date(timestamp || Date.now()),
            attempts: 0
        });

        // Process queue immediately if it's getting large
        if (usageQueue.length >= MAX_QUEUE_SIZE) {
            processQueue();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking API usage:', error);
        return NextResponse.json(
            { error: 'Failed to track usage' },
            { status: 500 }
        );
    }
}

// GET endpoint that returns current statistics for a user
export async function GET(request: NextRequest) {
    try {
        // This endpoint should require authentication, so we'll check for an API key
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 401 }
            );
        }

        // Get user ID from API key
        try {
            const keyRecord = await prisma.apiKey.findUnique({
                where: { key: apiKey },
                select: { userId: true }
            });

            if (!keyRecord) {
                return NextResponse.json(
                    { error: 'Invalid API key' },
                    { status: 401 }
                );
            }

            // Get start of current month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            // Get usage stats for current month
            const stats = await prisma.usageStats.findMany({
                where: {
                    userId: keyRecord.userId,
                    date: { gte: startOfMonth }
                }
            });

            // Calculate totals
            const totalOperations = stats.reduce((sum, stat) => sum + stat.count, 0);

            // Group by operation
            const operationCounts = stats.reduce((acc, stat) => {
                acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
                return acc;
            }, {} as Record<string, number>);

            return NextResponse.json({
                success: true,
                totalOperations,
                operationCounts,
                period: {
                    start: startOfMonth,
                    end: new Date()
                }
            });
        } catch (error) {
            console.error('Error retrieving usage stats:', error);
            return NextResponse.json(
                { error: 'Failed to retrieve usage stats' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error processing usage stats request:', error);
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}