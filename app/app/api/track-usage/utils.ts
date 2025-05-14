// app/api/track-usage/utils.ts
import { FREE_OPERATIONS_MONTHLY, OPERATION_COST } from '@/lib/operation-tracker';
import { prisma } from '@/lib/prisma';

/**
 * Process and charge for an operation based on user's balance and free operations.
 * This is the central utility to use when charging for operations in your API routes.
 * 
 * IMPORTANT: This should only be called AFTER an operation is successfully completed.
 */
export async function processOperationCharge(
  userId: string,
  operation: string
): Promise<{
  success: boolean;
  usedFreeOperation: boolean;
  freeOperationsRemaining: number;
  balance: number;
  error?: string;
}> {
  try {
    // Start a transaction to ensure atomicity
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
          balance: 0,
          error: 'User not found'
        };
      }

      // Check if free operations should be reset
      const now = new Date();
      let freeOpsUsed = user.freeOperationsUsed || 0;
      let resetDate = user.freeOperationsReset;
      
      if (user.freeOperationsReset < now) {
        // Calculate new reset date (first day of next month)
        const nextResetDate = new Date();
        nextResetDate.setDate(1);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setHours(0, 0, 0, 0);
        
        // Reset free operations counter
        freeOpsUsed = 0;
        resetDate = nextResetDate;
        
        await tx.user.update({
          where: { id: userId },
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
          balance: user.balance
        };
      }

      // No free operations left, use balance
      if (user.balance < OPERATION_COST) {
        return {
          success: false,
          usedFreeOperation: false,
          freeOperationsRemaining: 0,
          balance: user.balance,
          error: 'Insufficient balance'
        };
      }

      // Deduct from balance
      const newBalance = user.balance - OPERATION_COST;
      
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
          description: `Operation: ${operation}`,
          status: 'completed'
        }
      });

      // Track the operation in usage stats
      await trackOperationInTransaction(tx, userId, operation);

      return {
        success: true,
        usedFreeOperation: false,
        freeOperationsRemaining: 0,
        balance: newBalance
      };
    });
  } catch (error) {
    console.error('Error recording operation:', error);
    return {
      success: false,
      usedFreeOperation: false,
      freeOperationsRemaining: 0,
      balance: 0,
      error: 'Failed to record operation'
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
            date: today,
            updatedAt: new Date()
        }
    });
}

/**
 * Check if a user can perform an operation before actually charging them
 * Useful for preliminary checks in UI or before starting a process
 */
export async function canUserPerformOperation(
  userId: string
): Promise<{
  canPerform: boolean;
  hasFreeOperations: boolean;
  freeOperationsRemaining: number;
  hasBalance: boolean;
  currentBalance: number;
  error?: string;
}> {
  try {
    // Get user with balance information
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
      currentBalance: user.balance,
      error: (!hasFreeOps && !hasEnoughBalance) ? 'Insufficient balance and no free operations remaining' : undefined
    };
  } catch (error) {
    console.error('Error checking if user can perform operation:', error);
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