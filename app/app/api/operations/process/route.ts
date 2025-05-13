// app/api/operations/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Constants for operations
const OPERATION_COST = 0.005;
const FREE_OPERATIONS_MONTHLY = 500;

/**
 * Processes an operation and handles the charging logic
 * This is the core function to handle all operations requiring payment
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 2. Parse request to determine operation type
    const { operationType, ...operationParams } = await request.json();
    
    // Use a default operation type if not provided
    const operation = operationType || 'general';
    
    // 3. Process the operation charge using a transaction for atomicity
    try {
      // Start a transaction to ensure all database operations are atomic
      const chargeResult = await prisma.$transaction(async (tx) => {
        // Get latest user data
        const user = await tx.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            balance: true,
            freeOperationsUsed: true,
            freeOperationsReset: true
          }
        });

        if (!user) {
          throw new Error('User not found');
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
      
      // 4. Check if the operation was successfully charged
      if (!chargeResult.success) {
        return NextResponse.json(
          { 
            error: chargeResult.error || 'Failed to process operation',
            details: {
              balance: chargeResult.currentBalance,
              freeOperationsRemaining: chargeResult.freeOperationsRemaining
            }
          },
          { status: 402 } // Payment Required status code
        );
      }
      
      // 5. Proceed with the actual operation since payment was successful
      const operationResult = await performOperation(operation, operationParams);
      
      // 6. Return successful response with payment details
      return NextResponse.json({
        success: true,
        operation: {
          type: operation,
          usedFreeOperation: chargeResult.usedFreeOperation,
          cost: chargeResult.usedFreeOperation ? 0 : OPERATION_COST
        },
        account: {
          freeOperationsRemaining: chargeResult.freeOperationsRemaining,
          currentBalance: chargeResult.currentBalance
        },
        result: operationResult
      });
    } catch (txError) {
      console.error('Transaction error:', txError);
      return NextResponse.json(
        { error: txError instanceof Error ? txError.message : 'Operation transaction failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing operation:', error);
    return NextResponse.json(
      { error: 'Failed to process operation request' },
      { status: 500 }
    );
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

/**
 * Performs the actual operation after charging
 * Replace this with your actual operation logic
 */
async function performOperation(operation: string, params: any) {
  // This is a placeholder function - replace with your actual operation implementation
  // For example, if operation is 'convert', call your PDF conversion logic
  
  switch (operation) {
    case 'convert':
      // return await convertPdf(params);
      return { message: 'Conversion successful', operation };
      
    case 'compress':
      // return await compressPdf(params);
      return { message: 'Compression successful', operation };
      
    case 'merge':
      // return await mergePdfs(params);
      return { message: 'Merge successful', operation };
      
    case 'extract':
      // return await extractFromPdf(params);
      return { message: 'Extraction successful', operation };
    
    // Add other operation types as needed
      
    default:
      return { message: 'Operation processed successfully', operation };
  }
}