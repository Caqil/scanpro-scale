import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

// Define the AdminStats type for clarity
interface AdminStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    bySubscription: {
      free: number;
      basic: number;
      pro: number;
      enterprise: number;
    };
  };
  apiUsage: {
    totalRequests: number;
    byOperation: Record<string, number>;
    topUsers: Array<{
      userId: string;
      name: string;
      email: string;
      requests: number;
      tier: string;
    }>;
  };
  system: {
    health: 'healthy' | 'degraded' | 'down';
    uptime: string;
    serverLoad: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

export async function GET() {
  return withAdminAuth(async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get user statistics
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: {
          OR: [
            { sessions: { some: { expires: { gt: now } } } },
            {
              apiKeys: {
                some: { lastUsed: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
              },
            },
          ],
        },
      });

      const newUsersThisMonth = await prisma.user.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      });

      // Get subscription breakdown
      const subscriptionCounts = await prisma.subscription.groupBy({
        by: ['tier'],
        _count: { _all: true },
        where: { status: 'active' },
      });

      const subscriptionBreakdown = {
        free: 0,
        basic: 0,
        pro: 0,
        enterprise: 0,
      };

      subscriptionCounts.forEach((item) => {
        subscriptionBreakdown[item.tier as keyof typeof subscriptionBreakdown] = item._count._all;
      });

      // Add free users (those without subscription)
      const subscribedUsers = Object.values(subscriptionBreakdown).reduce((a, b) => a + b, 0);
      subscriptionBreakdown.free = totalUsers - subscribedUsers;

      // Get API usage statistics
      const apiUsageTotal = await prisma.usageStats.aggregate({
        _sum: { count: true },
      });

      const apiUsageByOperation = await prisma.usageStats.groupBy({
        by: ['operation'],
        _sum: { count: true },
        orderBy: { _sum: { count: 'desc' } },
      });

      const operationCounts: Record<string, number> = {};
      apiUsageByOperation.forEach((item) => {
        operationCounts[item.operation] = item._sum.count || 0;
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
        include: {
          subscription: true,
        },
      });

      const topUsersWithDetails = topUsers.map((user) => {
        const details = topUserDetails.find((u) => u.id === user.userId);
        return {
          userId: user.userId,
          name: details?.name || 'Unknown',
          email: details?.email || 'Unknown',
          requests: user._sum.count || 0,
          tier: details?.subscription?.tier || 'free',
        };
      });

      // System health (mock data for now)
      const systemStats = {
        health: 'healthy' as const,
        uptime: '30d 14h 23m',
        serverLoad: 42,
        memoryUsage: 68,
        diskUsage: 54,
      };

      const stats: AdminStats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          bySubscription: subscriptionBreakdown,
        },
        apiUsage: {
          totalRequests: apiUsageTotal._sum.count || 0,
          byOperation: operationCounts,
          topUsers: topUsersWithDetails,
        },
        system: systemStats,
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}