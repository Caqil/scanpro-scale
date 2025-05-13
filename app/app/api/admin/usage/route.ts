// app/api/admin/usage/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import { ApiUsageData } from '@/src/types/admin';
import { OPERATION_COST } from '@/lib/balance-service';

export async function GET() {
  return withAdminAuth(async () => {
    try {
      // Get daily usage for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get daily statistics
      const daily = await prisma.$transaction(async (tx) => {
        const result = [];
        
        // Process last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          // Count operations for this day
          const dayOperations = await tx.usageStats.aggregate({
            where: {
              date: {
                gte: date,
                lt: nextDate
              }
            },
            _sum: { count: true },
            _count: { userId: true }
          });
          
          result.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            requests: dayOperations._sum.count || 0,
            users: dayOperations._count.userId || 0,
            revenue: (dayOperations._sum.count || 0) * OPERATION_COST
          });
        }
        
        return result;
      });

      // Get usage by operation
      const operationUsage = await prisma.usageStats.groupBy({
        by: ['operation'],
        _sum: { count: true },
        orderBy: { _sum: { count: 'desc' } }
      });

      const byOperation: Record<string, number> = {};
      operationUsage.forEach(op => {
        byOperation[op.operation] = op._sum.count || 0;
      });

      // Get usage breakdown by user type (free vs paid)
      const userTypeUsage = await prisma.$transaction(async (tx) => {
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
        
        // Get usage for paid users
        const paidUsage = await tx.usageStats.aggregate({
          where: {
            userId: { in: paidIds }
          },
          _sum: { count: true }
        });
        
        // Get usage for free users
        const freeUsage = await tx.usageStats.aggregate({
          where: {
            userId: { notIn: paidIds }
          },
          _sum: { count: true }
        });
        
        return {
          free: freeUsage._sum.count || 0,
          paid: paidUsage._sum.count || 0
        };
      });

      // Get top API users
      const topUsers = await prisma.usageStats.groupBy({
        by: ['userId'],
        _sum: { count: true },
        orderBy: { _sum: { count: 'desc' } },
        take: 10,
      });

      // Get user details for top users
      const topUserDetails = await prisma.user.findMany({
        where: {
          id: { in: topUsers.map((u) => u.userId) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          transactions: {
            select: {
              id: true
            },
            take: 1
          }
        }
      });

      // Format top users with details
      const topUsersWithDetails = topUsers.map((user) => {
        const details = topUserDetails.find((u) => u.id === user.userId);
        const isPaid = details?.transactions.length ? true : false;
        
        return {
          userId: user.userId,
          name: details?.name || 'Unknown',
          email: details?.email || 'Unknown',
          requests: user._sum.count || 0,
          balance: details?.balance || 0,
          tier: isPaid ? 'paid' : 'free'
        };
      });

      // Mock endpoint performance data (would need real monitoring system in production)
      const topEndpoints = Object.entries(byOperation)
        .map(([operation, count]) => ({
          endpoint: `/api/${operation}`,
          count,
          avgResponseTime: Math.floor(Math.random() * 500) + 100 // Mock response time between 100-600ms
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Format final response
      const usageData: ApiUsageData = {
        daily,
        byOperation,
        byTier: {
          free: userTypeUsage.free,
          paid: userTypeUsage.paid
        },
        topEndpoints,
        topUsers: topUsersWithDetails,
        revenue: {
          total: Object.values(byOperation).reduce((sum, count) => sum + count, 0) * OPERATION_COST,
          byOperation: Object.entries(byOperation).reduce((acc, [op, count]) => {
            acc[op] = count * OPERATION_COST;
            return acc;
          }, {} as Record<string, number>)
        }
      };

      return NextResponse.json(usageData);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}