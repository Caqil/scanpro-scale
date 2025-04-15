// lib/validate-key.ts with expanded permissions
import { prisma } from '@/lib/prisma';

// Define all available operations for API permissions
export const API_OPERATIONS = [
    'convert',   // PDF conversion (to/from various formats)
    'compress',  // PDF compression
    'merge',     // Merge multiple PDFs
    'split',     // Split PDF into multiple files
    'protect',   // Password protect PDF
    'unlock',    // Remove password from PDF
    'watermark', // Add watermark to PDF
    'sign',      // Add signatures to PDF
    'rotate',    // Rotate PDF pages
    'ocr',       // Optical Character Recognition
    'repair',    // Repair corrupted PDF
    'edit',      // Edit PDF content
    'annotate',  // Add annotations to PDF
    'extract',   // Extract content from PDF
    'redact',    // Redact content from PDF
    'organize',  // Organize/rearrange PDF pages
    'chat',
];

// Define usage limits by tier (operations per month)
const usageLimits = {
    free: 1000,
    basic: 10000,
    pro: 100000,
    enterprise: 1000000,
};

/**
 * Validates an API key and checks if it has permission to perform the specified operation
 * Also verifies that usage limits haven't been exceeded
 */
export async function validateApiKey(apiKey: string, operation: string) {
    try {
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
            return { valid: false, error: 'Invalid API key' };
        }

        // Check if key is expired
        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            return { valid: false, error: 'API key has expired' };
        }

        // Check if the API key has permission for the requested operation
        if (!keyRecord.permissions.includes(operation) && !keyRecord.permissions.includes('*')) {
            return {
                valid: false,
                error: `This API key does not have permission to perform the '${operation}' operation`
            };
        }

        // Get subscription tier
        const tier = keyRecord.user.subscription?.tier || 'free';

        // Check subscription status
        if (keyRecord.user.subscription?.status !== 'active') {
            return { valid: false, error: 'Subscription is not active' };
        }

        // Check monthly usage limit
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
            return {
                valid: false,
                error: `Monthly usage limit of ${usageLimit} operations reached for your ${tier} plan`
            };
        }

        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsed: new Date() }
        });

        return {
            valid: true,
            userId: keyRecord.user.id,
            tier
        };
    } catch (error) {
        console.error('Error validating API key:', error);
        return { valid: false, error: 'Internal error validating API key' };
    }
}

/**
 * Track API usage for a user
 * This creates or updates a usage record for the current day
 */
export async function trackApiUsage(userId: string, operation: string) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // First check if there's an existing record for today
        const existingRecord = await prisma.usageStats.findUnique({
            where: {
                userId_operation_date: {
                    userId,
                    operation,
                    date: today
                }
            }
        });

        if (existingRecord) {
            // Update existing record
            await prisma.usageStats.update({
                where: {
                    id: existingRecord.id
                },
                data: {
                    count: {
                        increment: 1
                    }
                }
            });
        } else {
            // Create new record
            await prisma.usageStats.create({
                data: {
                    userId,
                    operation,
                    count: 1,
                    date: today
                }
            });
        }

        // For high-volume systems, you might want to use a queue
        // or batch updates instead of direct database writes

        return true;
    } catch (error) {
        console.error('Error tracking API usage:', error);
        // Don't fail the main operation if tracking fails
        return false;
    }
}

/**
 * Get the current usage for a user
 * Returns total operations and breakdown by operation type
 */
export async function getUserUsage(userId: string) {
    try {
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const usageStats = await prisma.usageStats.findMany({
            where: {
                userId,
                date: { gte: firstDayOfMonth }
            }
        });

        // Calculate total operations
        const totalOperations = usageStats.reduce(
            (sum, stat) => sum + stat.count,
            0
        );

        // Get usage by operation type
        const operationCounts = usageStats.reduce(
            (acc: Record<string, number>, stat) => {
                acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
                return acc;
            },
            {}
        );

        return {
            totalOperations,
            operationCounts
        };
    } catch (error) {
        console.error('Error getting user usage:', error);
        return {
            totalOperations: 0,
            operationCounts: {}
        };
    }
}

/**
 * Check if a user has exceeded their usage limit
 * Returns true if the user is over their limit
 */
export async function isUserOverUsageLimit(userId: string) {
    try {
        // Get user's subscription tier
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true }
        });

        if (!user) {
            return true; // No user found, treat as over limit
        }

        const tier = user.subscription?.tier || 'free';
        const usageLimit = usageLimits[tier as keyof typeof usageLimits];

        // Get current usage
        const { totalOperations } = await getUserUsage(userId);

        return totalOperations >= usageLimit;
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return false; // On error, allow operation to proceed
    }
}