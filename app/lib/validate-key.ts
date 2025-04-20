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
export const USAGE_LIMITS = {
    free: 500,      // 500 operations total
    basic: 5000,    // 5k operations
    pro: 50000,     // 50k operations
    enterprise: 100000 // 100k operations
  };

/**
 * Validates an API key and checks if it has permission to perform the specified operation
 * Also verifies that usage limits haven't been exceeded
 */
export async function validateApiKey(
    apiKey: string,
    operation: string
  ): Promise<{ valid: boolean; userId?: string; error?: string }> {
    try {
      // Look up the key
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
  
      // Check subscription status
      const subscription = keyRecord.user.subscription;
      if (!subscription) {
        // Default to free tier if no subscription
        const canProceed = await checkUsageLimit(keyRecord.user.id, 'free');
        return canProceed 
          ? { valid: true, userId: keyRecord.user.id }
          : { valid: false, error: 'Free tier usage limit reached' };
      }
  
      // Check if subscription is active
      if (subscription.status !== 'active') {
        // Allow usage of free tier even with inactive subscription
        const canProceed = await checkUsageLimit(keyRecord.user.id, 'free');
        return canProceed 
          ? { valid: true, userId: keyRecord.user.id }
          : { valid: false, error: 'Free tier usage limit reached' };
      }
  
      // Check if subscription is expired
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
        // Automatically downgrade to free tier
        await downgradeToFreeTier(keyRecord.user.id);
        
        // Check free tier usage
        const canProceed = await checkUsageLimit(keyRecord.user.id, 'free');
        return canProceed 
          ? { valid: true, userId: keyRecord.user.id }
          : { valid: false, error: 'Free tier usage limit reached' };
      }
  
      // Check usage limit for their tier
      const canProceed = await checkUsageLimit(keyRecord.user.id, subscription.tier);
      return canProceed 
        ? { valid: true, userId: keyRecord.user.id }
        : { valid: false, error: `${subscription.tier} tier usage limit reached` };
  
    } catch (error) {
      console.error('Error validating API key:', error);
      return { valid: false, error: 'Internal server error' };
    }
  }
  
  // Check if the user has exceeded their usage limit
  async function checkUsageLimit(userId: string, tier: string): Promise<boolean> {
    try {
      // Get the current month's usage
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
  
      const usage = await prisma.usageStats.aggregate({
        where: {
          userId,
          date: { gte: firstDayOfMonth }
        },
        _sum: {
          count: true
        }
      });
  
      // Compare with the limit for their tier
      const totalUsage = usage._sum.count || 0;
      const limit = USAGE_LIMITS[tier as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;
  
      return totalUsage < limit;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      // In case of an error, allow the operation to proceed
      return true;
    }
  }
  
  // Downgrade a user to the free tier
  async function downgradeToFreeTier(userId: string): Promise<void> {
    try {
      await prisma.subscription.update({
        where: { userId },
        data: {
          tier: 'free',
          status: 'expired',
        }
      });
    } catch (error) {
      console.error('Error downgrading to free tier:', error);
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