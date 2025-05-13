// lib/validate-key.ts updated for pay-as-you-go model
import { prisma } from '@/lib/prisma';

// Cost per operation in USD
export const OPERATION_COST = 0.005;

// Monthly free operations allowance
export const FREE_OPERATIONS_MONTHLY = 500;

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
    'extract',  // Extract text/images from PDF
    'remove'
];

// Define limits based on free/paid status only
export const USAGE_LIMITS = {
    free: FREE_OPERATIONS_MONTHLY,
    paid: Number.MAX_SAFE_INTEGER  // Paid users limited only by their balance
};

/**
 * Validates an API key and checks if it has permission to perform the specified operation
 * Also checks if the user has enough free operations or balance
 */
export async function validateApiKey(
    apiKey: string,
    operation: string
): Promise<{ 
    valid: boolean; 
    userId?: string; 
    freeOperationsRemaining?: number;
    balance?: number;
    error?: string 
}> {
    try {
        // Look up the key
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
            return { valid: false, error: 'Invalid API key' };
        }

        // Check expiration
        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            return { valid: false, error: 'API key has expired' };
        }

        // Check permissions
        if (!keyRecord.permissions.includes(operation) && !keyRecord.permissions.includes('*')) {
            return {
                valid: false,
                error: `This API key does not have permission to perform the '${operation}' operation`
            };
        }

        // Get user
        const user = keyRecord.user;
        if (!user) {
            return { valid: false, error: 'User not found' };
        }

        // Update API key last used timestamp
        await prisma.apiKey.update({
            where: { id: keyRecord.id },
            data: { lastUsed: new Date() }
        });

        // Check if free operations should be reset
        const now = new Date();
        let freeOpsUsed = user.freeOperationsUsed || 0;
        let freeOpsReset = user.freeOperationsReset;
        
        if (user.freeOperationsReset && user.freeOperationsReset < now) {
            // Reset free operations counter
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    freeOperationsUsed: 0,
                    freeOperationsReset: new Date(now.getFullYear(), now.getMonth() + 1, 1) // First day of next month
                }
            });
            
            // Update local variables
            freeOpsUsed = 0;
            freeOpsReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }

        // Calculate remaining free operations
        const freeOperationsRemaining = Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed);

        // Check if free operations are available
        if (freeOperationsRemaining > 0) {
            return { 
                valid: true, 
                userId: user.id,
                freeOperationsRemaining,
                balance: user.balance || 0
            };
        }

        // If no free operations left, check if user has enough balance
        const userBalance = user.balance || 0;
        
        if (userBalance < OPERATION_COST) {
            return {
                valid: false,
                userId: user.id,
                freeOperationsRemaining: 0,
                balance: userBalance,
                error: `Insufficient balance. Current balance: $${userBalance.toFixed(2)}, Operation cost: $${OPERATION_COST.toFixed(3)}`
            };
        }

        // User has enough balance
        return {
            valid: true,
            userId: user.id,
            freeOperationsRemaining: 0,
            balance: userBalance
        };
    } catch (error) {
        console.error('Error validating API key:', error);
        return { valid: false, error: 'Internal server error' };
    }
}

/**
 * Process an operation for a user - uses a free operation or deducts from balance
 * Returns success/failure and updated balance info
 */
export async function processOperation(
    userId: string,
    operation: string
): Promise<{
    success: boolean;
    usedFreeOperation: boolean;
    freeOperationsRemaining: number;
    newBalance: number;
    error?: string;
}> {
    try {
        // Start a transaction to ensure atomicity
        return await prisma.$transaction(async (tx) => {
            // Get latest user data
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    balance: true,
                    freeOperationsUsed: true,
                    freeOperationsReset: true
                }
            });

            if (!user) {
                return {
                    success: false,
                    usedFreeOperation: false,
                    freeOperationsRemaining: 0,
                    newBalance: 0,
                    error: 'User not found'
                };
            }

            // Check if free operations should be reset
            const now = new Date();
            let freeOpsUsed = user.freeOperationsUsed || 0;
            let resetDate = user.freeOperationsReset;
            
            if (user.freeOperationsReset && user.freeOperationsReset < now) {
                // Reset free operations counter
                freeOpsUsed = 0;
                resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        freeOperationsUsed: 0,
                        freeOperationsReset: resetDate
                    }
                });
            }

            // Check if free operations are available
            if (freeOpsUsed < FREE_OPERATIONS_MONTHLY) {
                // Use a free operation
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        freeOperationsUsed: { increment: 1 }
                    }
                });

                // Track the operation in usage stats
                await trackOperationInTransaction(tx, userId, operation);

                return {
                    success: true,
                    usedFreeOperation: true,
                    freeOperationsRemaining: FREE_OPERATIONS_MONTHLY - freeOpsUsed - 1,
                    newBalance: user.balance || 0
                };
            }

            // If no free operations, use balance
            const userBalance = user.balance || 0;
            
            if (userBalance < OPERATION_COST) {
                return {
                    success: false,
                    usedFreeOperation: false,
                    freeOperationsRemaining: 0,
                    newBalance: userBalance,
                    error: 'Insufficient balance'
                };
            }

            // Deduct from balance
            const newBalance = userBalance - OPERATION_COST;
            
            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: newBalance
                }
            });

            // Record transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount: -OPERATION_COST,
                    balanceAfter: newBalance,
                    description: `Operation: ${operation}`
                }
            });

            // Track the operation in usage stats
            await trackOperationInTransaction(tx, userId, operation);

            return {
                success: true,
                usedFreeOperation: false,
                freeOperationsRemaining: 0,
                newBalance
            };
        });
    } catch (error) {
        console.error('Error processing operation:', error);
        return {
            success: false,
            usedFreeOperation: false,
            freeOperationsRemaining: 0,
            newBalance: 0,
            error: 'Failed to process operation'
        };
    }
}

/**
 * Helper function to track operation usage within a transaction
 */
async function trackOperationInTransaction(tx: any, userId: string, operation: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await tx.usageStats.upsert({
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
}

/**
 * Track API usage for a user
 * This creates or updates a usage record for the current day
 */
export async function trackApiUsage(userId: string, operation: string) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upsert the usage record (creates or updates)
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
 * Get user's balance information
 */
export async function getUserBalanceInfo(userId: string): Promise<{
    balance: number;
    freeOperationsUsed: number;
    freeOperationsRemaining: number;
    freeOperationsResetDate: Date;
    error?: string;
}> {
    try {
        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                balance: true,
                freeOperationsUsed: true,
                freeOperationsReset: true
            }
        });

        if (!user) {
            return {
                balance: 0,
                freeOperationsUsed: 0,
                freeOperationsRemaining: 0,
                freeOperationsResetDate: new Date(),
                error: 'User not found'
            };
        }

        // Check if free operations should be reset
        const now = new Date();
        let freeOpsUsed = user.freeOperationsUsed || 0;
        let resetDate = user.freeOperationsReset;
        
        if (user.freeOperationsReset && user.freeOperationsReset < now) {
            // Reset would happen on next operation, but for display purposes
            // we'll show that they have full free operations available
            freeOpsUsed = 0;
            resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }

        return {
            balance: user.balance || 0,
            freeOperationsUsed: freeOpsUsed,
            freeOperationsRemaining: Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed),
            freeOperationsResetDate: resetDate
        };
    } catch (error) {
        console.error('Error getting user balance info:', error);
        return {
            balance: 0,
            freeOperationsUsed: 0,
            freeOperationsRemaining: 0,
            freeOperationsResetDate: new Date(),
            error: 'Failed to get balance information'
        };
    }
}