// lib/operation-handler.ts
import { prisma } from '@/lib/prisma';

// Constants for operations
export const OPERATION_COST = 0.005;
export const FREE_OPERATIONS_MONTHLY = 500;

/**
 * Process an operation charge for a user
 * This is a reusable function that any API route can use
 */
export async function processOperationCharge(
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
 * Check if a user can afford an operation before attempting it
 */
export async function canUserPerformOperation(userId: string): Promise<{
  canPerform: boolean;
  hasFreeOperations: boolean;
  freeOperationsRemaining: number;
  hasBalance: boolean;
  currentBalance: number;
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
        currentBalance: 0
      };
    }

    // Check if free operations reset date has passed
    const now = new Date();
    let freeOpsUsed = user.freeOperationsUsed || 0;
    
    if (user.freeOperationsReset && user.freeOperationsReset < now) {
      // Reset would happen on actual operation, but for checking, 
      // we'll assume they have full free operations
      freeOpsUsed = 0;
    }

    // Calculate remaining free operations
    const freeOpsRemaining = Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed);
    const hasFreeOps = freeOpsRemaining > 0;
    
    // Check if user has enough balance (if no free operations)
    const hasEnoughBalance = user.balance >= OPERATION_COST;
    
    return {
      canPerform: hasFreeOps || hasEnoughBalance,
      hasFreeOperations: hasFreeOps,
      freeOperationsRemaining: freeOpsRemaining,
      hasBalance: hasEnoughBalance,
      currentBalance: user.balance
    };
  } catch (error) {
    console.error('Error checking operation eligibility:', error);
    return {
      canPerform: false,
      hasFreeOperations: false,
      freeOperationsRemaining: 0,
      hasBalance: false,
      currentBalance: 0
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