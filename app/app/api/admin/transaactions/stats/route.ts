// app/api/admin/transactions/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

export async function GET() {
  return withAdminAuth(async () => {
    try {
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get total transaction overview
      const depositTransactions = await prisma.transaction.aggregate({
        where: {
          amount: { gt: 0 }, // Only deposits
          status: 'completed',
        },
        _sum: { amount: true },
        _count: { id: true }
      });
      
      const operationTransactions = await prisma.transaction.aggregate({
        where: {
          amount: { lt: 0 }, // Only operation charges
          status: 'completed',
        },
        _sum: { amount: true },
        _count: { id: true }
      });
      
      // Get operations performed today
      const todayOperations = await prisma.transaction.count({
        where: {
          amount: { lt: 0 }, // Only operation charges
          status: 'completed',
          createdAt: { gte: today }
        }
      });
      
      // Calculate average deposit
      const averageDeposit = depositTransactions._sum.amount && depositTransactions._count.id
        ? depositTransactions._sum.amount / depositTransactions._count.id
        : 0;
        
      // Get trends for last 14 days
      const trends = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // Get deposits for this day
        const dayDeposits = await prisma.transaction.aggregate({
          where: {
            amount: { gt: 0 },
            status: 'completed',
            createdAt: {
              gte: date,
              lt: nextDate
            }
          },
          _sum: { amount: true }
        });
        
        // Get operations for this day
        const dayOperations = await prisma.transaction.count({
          where: {
            amount: { lt: 0 },
            status: 'completed',
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        });
        
        trends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income: dayDeposits._sum.amount || 0,
          operations: dayOperations
        });
      }
      
      // Get transaction stats by user type
      const paidUserStats = await prisma.$transaction(async (tx) => {
        // Get users who have made deposits (paid users)
        const paidUserIds = await tx.transaction.findMany({
          where: {
            amount: { gt: 0 },
            status: 'completed'
          },
          distinct: ['userId'],
          select: { userId: true }
        });
        
        const paidIds = paidUserIds.map(u => u.userId);
        
        // Get deposit totals for paid users
        const paidDeposits = await tx.transaction.aggregate({
          where: {
            userId: { in: paidIds },
            amount: { gt: 0 },
            status: 'completed'
          },
          _sum: { amount: true },
          _count: { id: true }
        });
        
        return {
          income: paidDeposits._sum.amount || 0,
          count: paidDeposits._count.id || 0,
          userCount: paidIds.length
        };
      });
      
      const freeUserStats = await prisma.$transaction(async (tx) => {
        // Get users who have not made deposits (free users)
        const paidUserIds = await tx.transaction.findMany({
          where: {
            amount: { gt: 0 },
            status: 'completed'
          },
          distinct: ['userId'],
          select: { userId: true }
        });
        
        const paidIds = paidUserIds.map(u => u.userId);
        
        // Get all user IDs
        const allUserIds = await tx.user.findMany({
          select: { id: true }
        });
        
        // Filter for free users (those not in paid)
        const freeIds = allUserIds
          .map(u => u.id)
          .filter(id => !paidIds.includes(id));
        
        // Get operation charges for free users
        const freeOperations = await tx.transaction.aggregate({
          where: {
            userId: { in: freeIds },
            amount: { lt: 0 },
            status: 'completed'
          },
          _sum: { amount: true },
          _count: { id: true }
        });
        
        return {
          income: 0, // Free users don't contribute direct income
          count: freeOperations._count.id || 0,
          userCount: freeIds.length
        };
      });
      
      // Format response
      const response = {
        overview: {
          total: (depositTransactions._count.id || 0) + (operationTransactions._count.id || 0),
          income: depositTransactions._sum.amount || 0,
          expenses: Math.abs(operationTransactions._sum.amount || 0),
          averageDeposit,
          depositCount: depositTransactions._count.id || 0,
          operationsToday: todayOperations,
          totalOperations: operationTransactions._count.id || 0
        },
        trends,
        byUserType: [
          {
            type: 'paid',
            income: paidUserStats.income,
            count: paidUserStats.count,
            userCount: paidUserStats.userCount
          },
          {
            type: 'free',
            income: freeUserStats.income,
            count: freeUserStats.count,
            userCount: freeUserStats.userCount
          }
        ]
      };
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transaction statistics' },
        { status: 500 }
      );
    }
  });
}