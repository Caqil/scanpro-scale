// lib/balance-service.ts
import { prisma } from '@/lib/prisma';

// Cost per operation in USD
export const OPERATION_COST = 0.005;

// Monthly free operations allowance
export const FREE_OPERATIONS_MONTHLY = 500;

/**
 * Check if a user has enough balance or free operations for a single operation
 */
export async function canPerformOperation(userId: string): Promise<{
  canPerform: boolean;
  usedFreeOperation: boolean;
  remainingFreeOps: number;
  currentBalance: number;
  error?: string;
}> {
  try {
    // Get user with current balance info
    const user = await prisma.user.findUnique({
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
        canPerform: false,
        usedFreeOperation: false,
        remainingFreeOps: 0,
        currentBalance: 0,
        error: 'User not found'
      };
    }

    // Check if free operations reset time has passed
    const now = new Date();
    if (user.freeOperationsReset < now) {
      // Reset free operations counter
      await prisma.user.update({
        where: { id: userId },
        data: {
          freeOperationsUsed: 0,
          freeOperationsReset: new Date(now.getFullYear(), now.getMonth() + 1, 1) // First day of next month
        }
      });
      
      // Update user object with reset values
      user.freeOperationsUsed = 0;
      user.freeOperationsReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Check if user has free operations remaining
    const remainingFreeOps = FREE_OPERATIONS_MONTHLY - user.freeOperationsUsed;
    
    if (remainingFreeOps > 0) {
      return {
        canPerform: true,
        usedFreeOperation: true,
        remainingFreeOps: remainingFreeOps - 1, // After this operation
        currentBalance: user.balance
      };
    }

    // If no free operations left, check balance
    if (user.balance >= OPERATION_COST) {
      return {
        canPerform: true,
        usedFreeOperation: false,
        remainingFreeOps: 0,
        currentBalance: user.balance - OPERATION_COST // Balance after operation
      };
    }

    // Not enough balance
    return {
      canPerform: false,
      usedFreeOperation: false,
      remainingFreeOps: 0,
      currentBalance: user.balance,
      error: 'Insufficient balance'
    };
  } catch (error) {
    console.error('Error checking operation eligibility:', error);
    return {
      canPerform: false,
      usedFreeOperation: false,
      remainingFreeOps: 0,
      currentBalance: 0,
      error: 'Failed to check balance'
    };
  }
}

/**
 * Record an operation, either using free operation quota or deducting from balance
 */
export async function recordOperation(
  userId: string, 
  operationType: string
): Promise<{
  success: boolean;
  usedFreeOperation: boolean;
  remainingFreeOps: number;
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
          remainingFreeOps: 0,
          newBalance: 0,
          error: 'User not found'
        };
      }

      // Check if free operations should be reset
      const now = new Date();
      let freeOpsUsed = user.freeOperationsUsed;
      let resetDate = user.freeOperationsReset;
      
      if (user.freeOperationsReset < now) {
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await tx.usageStats.upsert({
          where: {
            userId_operation_date: {
              userId,
              operation: operationType,
              date: today
            }
          },
          update: {
            count: { increment: 1 }
          },
          create: {
            userId,
            operation: operationType,
            count: 1,
            date: today
          }
        });

        return {
          success: true,
          usedFreeOperation: true,
          remainingFreeOps: FREE_OPERATIONS_MONTHLY - freeOpsUsed - 1,
          newBalance: user.balance
        };
      }

      // If no free operations, use balance
      if (user.balance < OPERATION_COST) {
        return {
          success: false,
          usedFreeOperation: false,
          remainingFreeOps: 0,
          newBalance: user.balance,
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
          description: `Operation: ${operationType}`
        }
      });

      // Track the operation in usage stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await tx.usageStats.upsert({
        where: {
          userId_operation_date: {
            userId,
            operation: operationType,
            date: today
          }
        },
        update: {
          count: { increment: 1 }
        },
        create: {
          userId,
          operation: operationType,
          count: 1,
          date: today
        }
      });

      return {
        success: true,
        usedFreeOperation: false,
        remainingFreeOps: 0,
        newBalance
      };
    });
  } catch (error) {
    console.error('Error recording operation:', error);
    return {
      success: false,
      usedFreeOperation: false,
      remainingFreeOps: 0,
      newBalance: 0,
      error: 'Failed to record operation'
    };
  }
}

/**
 * Add balance to a user's account
 */
export async function addBalance(
  userId: string, 
  amount: number, 
  paymentId: string,
  description: string = 'Balance deposit'
): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  if (amount <= 0) {
    return {
      success: false,
      newBalance: 0,
      error: 'Amount must be positive'
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Get latest user data
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          balance: true
        }
      });

      if (!user) {
        return {
          success: false,
          newBalance: 0,
          error: 'User not found'
        };
      }

      // Add to balance
      const newBalance = user.balance + amount;
      
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
          amount,
          balanceAfter: newBalance,
          description,
          paymentId,
          status: 'completed'
        }
      });

      return {
        success: true,
        newBalance
      };
    });
  } catch (error) {
    console.error('Error adding balance:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Failed to add balance'
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
  transactions: any[];
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
        transactions: [],
        error: 'User not found'
      };
    }

    // Check if free operations should be reset
    const now = new Date();
    let freeOpsUsed = user.freeOperationsUsed;
    let resetDate = user.freeOperationsReset;
    
    if (user.freeOperationsReset < now) {
      // Reset would happen on next operation, but for display purposes
      // we'll show that they have full free operations available
      freeOpsUsed = 0;
      resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10 // Get last 10 transactions
    });

    return {
      balance: user.balance,
      freeOperationsUsed: freeOpsUsed,
      freeOperationsRemaining: FREE_OPERATIONS_MONTHLY - freeOpsUsed,
      freeOperationsResetDate: resetDate,
      transactions
    };
  } catch (error) {
    console.error('Error getting user balance info:', error);
    return {
      balance: 0,
      freeOperationsUsed: 0,
      freeOperationsRemaining: 0,
      freeOperationsResetDate: new Date(),
      transactions: [],
      error: 'Failed to get balance information'
    };
  }
}

/**
 * Reset free operations for all users (scheduled job)
 */
export async function resetMonthlyFreeOperations(): Promise<number> {
  try {
    const now = new Date();
    
    // Find users whose reset date has passed
    const usersToReset = await prisma.user.findMany({
      where: {
        freeOperationsReset: {
          lt: now
        }
      },
      select: { id: true }
    });

    if (usersToReset.length === 0) {
      return 0;
    }

    // Calculate next reset date (first day of next month)
    const nextReset = new Date();
    nextReset.setDate(1); // First day of current month
    nextReset.setMonth(nextReset.getMonth() + 1); // First day of next month
    nextReset.setHours(0, 0, 0, 0);

    // Reset free operations for these users
    await prisma.user.updateMany({
      where: {
        id: {
          in: usersToReset.map(user => user.id)
        }
      },
      data: {
        freeOperationsUsed: 0,
        freeOperationsReset: nextReset
      }
    });

    return usersToReset.length;
  } catch (error) {
    console.error('Error resetting monthly free operations:', error);
    throw error;
  }
}

/**
 * Schedule a job to reset free operations monthly
 */
export function scheduleBalanceJobs() {
  if (typeof global !== 'undefined') {
    // Reset free operations at the start of each month
    const resetFreeOpsInterval = setInterval(async () => {
      try {
        const resetCount = await resetMonthlyFreeOperations();
        console.log(`Reset free operations for ${resetCount} users`);
      } catch (error) {
        console.error('Error in scheduled free operations reset:', error);
      }
    }, 60 * 60 * 1000); // Check hourly

    // Clean up in development environment
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      if (global._balanceJobIntervals) {
        // @ts-ignore
        global._balanceJobIntervals.forEach((interval: NodeJS.Timeout) => clearInterval(interval));
      }

      // @ts-ignore
      global._balanceJobIntervals = [resetFreeOpsInterval];
    }
  }
}

// Start scheduled jobs
scheduleBalanceJobs();