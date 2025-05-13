// app/api/track-usage/utils.ts
import { prisma } from '@/lib/prisma';
import { OPERATION_COST, FREE_OPERATIONS_MONTHLY } from '@/lib/balance-service';

/**
 * Process and charge for an operation based on user's balance and free operations.
 * This is the central utility to use when charging for operations in your API routes.
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
        await trackOperationUsage(tx, userId, operation);

        return {
          success: true,
          usedFreeOperation: true,
          freeOperationsRemaining: FREE_OPERATIONS_MONTHLY - freeOpsUsed - 1,
          balance: user.balance
        };
      }

      // No free operations left, check if user has enough balance
      if (user.balance < OPERATION_COST) {
        return {
          success: false,
          usedFreeOperation: false,
          freeOperationsRemaining: 0,
          balance: user.balance,
          error: `Insufficient balance. Required: $${OPERATION_COST.toFixed(3)}, Available: $${user.balance.toFixed(2)}`
        };
      }

      // User has enough balance, deduct payment
      const newBalance = user.balance - OPERATION_COST;
      
      // Update user's balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: newBalance
        }
      });

      // Create transaction record
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
      await trackOperationUsage(tx, userId, operation);

      return {
        success: true,
        usedFreeOperation: false,
        freeOperationsRemaining: 0,
        balance: newBalance
      };
    });
  } catch (error) {
    console.error('Error processing operation charge:', error);
    return {
      success: false,
      usedFreeOperation: false,
      freeOperationsRemaining: 0,
      balance: 0,
      error: 'Failed to process operation'
    };
  }
}

/**
 * Helper function to track operation usage within a transaction
 */
async function trackOperationUsage(tx: any, userId: string, operation: string) {
  try {
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