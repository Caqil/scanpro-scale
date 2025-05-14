// lib/single-operation-tracker.ts - Updated with check before operation
// This is the ONLY place in the entire system that tracks and charges operations

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// Constants for operations
export const OPERATION_COST = 0.005;
export const FREE_OPERATIONS_MONTHLY = 500;

// Create a tracking system to prevent double operations
// Key is userId:operationType:timestamp (rounded to nearest minute)
const processedOperations = new Map<string, boolean>();

// Clear processed operations regularly to prevent memory leaks
setInterval(() => {
  // Keep only operations from the last 10 minutes
  const cutoff = Date.now() - 10 * 60 * 1000;
  
  for (const key of processedOperations.keys()) {
    const parts = key.split(':');
    const timestamp = parseInt(parts[2] || '0');
    
    if (timestamp < cutoff) {
      processedOperations.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * Extract user ID from request (either from API key via headers or from session)
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  // First check for user ID in headers (set by middleware for API keys)
  const userIdFromHeader = request.headers.get('x-user-id');
  if (userIdFromHeader) {
    return userIdFromHeader;
  }
  
  // Check for API key in headers or query params
  const headers = request.headers;
  const url = new URL(request.url);
  const apiKey = headers.get("x-api-key") || url.searchParams.get("api_key");
  
  if (apiKey) {
    // Look up user ID from API key
    try {
      const keyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKey },
        select: { userId: true }
      });
      
      if (keyRecord) {
        return keyRecord.userId;
      }
    } catch (error) {
      console.error('Error looking up API key:', error);
    }
  }
  
  // If not found, try to get from session (for web UI)
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get operation type from request
 */
export function getOperationType(request: NextRequest, defaultType: string = 'general'): string {
  return request.headers.get('x-operation-type') || defaultType;
}

/**
 * Check if a user can perform an operation BEFORE starting it
 * This should be called before any expensive processing
 */
export async function canPerformOperation(
  userId: string,
  operation: string
): Promise<{
  canPerform: boolean;
  hasFreeOperations: boolean;
  freeOperationsRemaining: number;
  hasBalance: boolean;
  currentBalance: number;
  error?: string;
}> {
  try {
    // Get user with balance info
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
        canPerform: false,
        hasFreeOperations: false,
        freeOperationsRemaining: 0,
        hasBalance: false,
        currentBalance: 0,
        error: 'User not found'
      };
    }

    // Check if free operations reset date has passed
    const now = new Date();
    let freeOpsUsed = user.freeOperationsUsed || 0;
    
    if (user.freeOperationsReset && user.freeOperationsReset < now) {
      // If reset date has passed, user has all free operations available
      freeOpsUsed = 0;
    }

    // Calculate remaining free operations
    const freeOpsRemaining = Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed);
    const hasFreeOps = freeOpsRemaining > 0;
    
    // Check if user has enough balance (if no free operations)
    const hasEnoughBalance = user.balance >= OPERATION_COST;
    
    // Determine if the user can perform the operation
    const canPerform = hasFreeOps || hasEnoughBalance;
    
    return {
      canPerform,
      hasFreeOperations: hasFreeOps,
      freeOperationsRemaining: freeOpsRemaining,
      hasBalance: hasEnoughBalance,
      currentBalance: user.balance,
      error: !canPerform ? 
        `Insufficient balance and no free operations remaining. Required: $${OPERATION_COST.toFixed(3)}, Available: $${user.balance.toFixed(2)}` : 
        undefined
    };
  } catch (error) {
    console.error('Error checking operation eligibility:', error);
    return {
      canPerform: false,
      hasFreeOperations: false,
      freeOperationsRemaining: 0,
      hasBalance: false,
      currentBalance: 0,
      error: 'Error checking operation eligibility'
    };
  }
}

/**
 * Process an operation charge for a user
 * This should be called AFTER the operation is successfully completed
 * It includes built-in de-duplication to prevent double counting
 */
export async function processOperation(
  userId: string,
  operation: string
): Promise<{
  success: boolean;
  usedFreeOperation: boolean;
  freeOperationsRemaining: number;
  currentBalance: number;
  error?: string;
}> {
  try {
    // Create a unique operation key (user ID + operation type + rounded timestamp)
    // This prevents the same operation being charged multiple times
    const roundedTime = Math.floor(Date.now() / 60000) * 60000; // Round to nearest minute
    const operationKey = `${userId}:${operation}:${roundedTime}`;
    
    // Check if this operation has already been processed
    if (processedOperations.has(operationKey)) {
      console.log(`Operation already processed: ${operationKey}`);
      
      // Return success without charging again
      // We'll get user's current info so we can return accurate values
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          balance: true,
          freeOperationsUsed: true,
          freeOperationsReset: true
        }
      });
      
      // Calculate free operations remaining
      let freeOpsRemaining = 0;
      if (user) {
        // Check if reset date has passed
        const now = new Date();
        if (user.freeOperationsReset && user.freeOperationsReset < now) {
          freeOpsRemaining = FREE_OPERATIONS_MONTHLY;
        } else {
          freeOpsRemaining = Math.max(0, FREE_OPERATIONS_MONTHLY - (user.freeOperationsUsed || 0));
        }
      }
      
      return {
        success: true,
        usedFreeOperation: freeOpsRemaining > 0, 
        freeOperationsRemaining: freeOpsRemaining,
        currentBalance: user?.balance || 0
      };
    }
    
    // Mark this operation as being processed
    processedOperations.set(operationKey, true);
    
    // Use a transaction for atomicity
    return await prisma.$transaction(async (tx) => {
      // Get user data
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
        processedOperations.delete(operationKey); // Remove from processed operations
        return {
          success: false,
          usedFreeOperation: false,
          freeOperationsRemaining: 0,
          currentBalance: 0,
          error: 'User not found'
        };
      }

      // Check if free operations should be reset
      const now = new Date();
      let freeOpsUsed = user.freeOperationsUsed || 0;
      
      if (user.freeOperationsReset && user.freeOperationsReset < now) {
        // Calculate new reset date (first day of next month)
        const nextResetDate = new Date();
        nextResetDate.setDate(1);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setHours(0, 0, 0, 0);
        
        // Reset free operations counter
        freeOpsUsed = 0;
        
        await tx.user.update({
          where: { id: user.id },
          data: {
            freeOperationsUsed: 0,
            freeOperationsReset: nextResetDate
          }
        });
      }
      
      // Check if free operations are available
      if (freeOpsUsed < FREE_OPERATIONS_MONTHLY) {
        // Use a free operation
        await tx.user.update({
          where: { id: user.id },
          data: {
            freeOperationsUsed: { increment: 1 }
          }
        });
        
        // Track the operation in usage statistics
        await trackOperationUsage(tx, user.id, operation);
        
        return {
          success: true,
          usedFreeOperation: true,
          freeOperationsRemaining: FREE_OPERATIONS_MONTHLY - freeOpsUsed - 1,
          currentBalance: user.balance
        };
      }
      
      // No free operations left, check if user has enough balance
      if (user.balance < OPERATION_COST) {
        processedOperations.delete(operationKey); // Remove from processed operations
        return {
          success: false,
          usedFreeOperation: false,
          freeOperationsRemaining: 0,
          currentBalance: user.balance,
          error: `Insufficient balance. Required: $${OPERATION_COST.toFixed(3)}, Available: $${user.balance.toFixed(2)}`
        };
      }
      
      // User has enough balance, deduct payment
      const newBalance = user.balance - OPERATION_COST;
      
      // Update user's balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: newBalance
        }
      });
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -OPERATION_COST,
          balanceAfter: newBalance,
          description: `Operation: ${operation}`,
          status: 'completed'
        }
      });
      
      // Track the operation in usage statistics
      await trackOperationUsage(tx, user.id, operation);
      
      return {
        success: true,
        usedFreeOperation: false,
        freeOperationsRemaining: 0,
        currentBalance: newBalance
      };
    });
  } catch (error) {
    console.error('Error processing operation charge:', error);
    return {
      success: false,
      usedFreeOperation: false,
      freeOperationsRemaining: 0,
      currentBalance: 0,
      error: 'Failed to process operation'
    };
  }
}

/**
 * Helper function to track operation usage within a transaction
 */
async function trackOperationUsage(tx: any, userId: string, operation: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    await tx.usageStats.upsert({
      where: {
        userId_operation_date: {
          userId,
          operation,
          date: today
        }
      },
      update: {
        count: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        userId,
        operation,
        count: 1,
        date: today,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error tracking operation usage:', error);
    // Continue execution even if tracking fails
  }
}