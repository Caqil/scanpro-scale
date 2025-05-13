// app/api/user/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

// Monthly free operations allowance
const FREE_OPERATIONS_MONTHLY = 500;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with balance information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        balance: true,
        freeOperationsUsed: true,
        freeOperationsReset: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if free operations should be reset
    const now = new Date();
    let freeOpsUsed = user.freeOperationsUsed || 0;
    let resetDate = user.freeOperationsReset;
    
    if (user.freeOperationsReset && user.freeOperationsReset < now) {
      // Reset would happen on next operation, but for display purposes
      // we'll show that they have full free operations available
      freeOpsUsed = 0;
      resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10 // Get last 10 transactions
    });

    // Get usage statistics for current month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const usageStats = await prisma.usageStats.findMany({
      where: {
        userId: session.user.id,
        date: { gte: firstDayOfMonth }
      }
    });

    // Calculate total operations and operation counts
    const totalOperations = usageStats.reduce((sum, stat) => sum + stat.count, 0);
    
    const operationCounts = usageStats.reduce((acc, stat) => {
      acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      balance: user.balance || 0,
      freeOperationsUsed: freeOpsUsed,
      freeOperationsRemaining: Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed),
      freeOperationsTotal: FREE_OPERATIONS_MONTHLY,
      nextResetDate: resetDate,
      transactions,
      totalOperations,
      operationCounts
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance information' },
      { status: 500 }
    );
  }
}