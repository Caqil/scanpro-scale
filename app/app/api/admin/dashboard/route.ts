// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import os from 'os';
import { AdminStats, RecentActivity } from '@/src/types/admin';

function getSystemMetrics() {
  // Get system uptime in seconds
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
  const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
  const uptime = `${days}d ${hours}h ${minutes}m`;

  // Get CPU load (1 minute average)
  const loadAverage = os.loadavg()[0];
  const cpuCount = os.cpus().length;
  const serverLoad = Math.round((loadAverage / cpuCount) * 100);

  // Get memory usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = Math.round((usedMemory / totalMemory) * 100);

  // Mock disk usage (you'll need a proper library like 'node-disk-info' for real data)
  const diskUsage = Math.round(Math.random() * 30 + 50); // 50-80%

  // Determine health status
  let health: 'healthy' | 'degraded' | 'down' = 'healthy';
  if (serverLoad > 80 || memoryUsage > 90) {
    health = 'degraded';
  } else if (serverLoad > 95 || memoryUsage > 95) {
    health = 'down';
  }

  return {
    health,
    uptime,
    serverLoad,
    memoryUsage,
    diskUsage,
  };
}

export async function GET() {
  return withAdminAuth(async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get user statistics
      const totalUsers = await prisma.user.count();
      
      // Get active users (logged in within last 30 days)
      const activeUsers = await prisma.user.count({
        where: {
          OR: [
            { sessions: { some: { expires: { gt: now } } } },
            {
              apiKeys: {
                some: { lastUsed: { gt: thirtyDaysAgo } },
              },
            },
          ],
        },
      });

      const newUsersThisMonth = await prisma.user.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      });

      // Get balance/transaction breakdown
      const balanceStats = await prisma.user.aggregate({
        _sum: { balance: true },
        _avg: { balance: true },
        _max: { balance: true }
      });

      const transactionStats = await prisma.transaction.aggregate({
        where: { 
          createdAt: { gte: thirtyDaysAgo },
          amount: { gt: 0 } // Only deposits
        },
        _sum: { amount: true },
        _count: { id: true }
      });

      // Usage statistics by category
      const freeUsersCount = await prisma.user.count({
        where: { 
          freeOperationsUsed: { gt: 0 },
          transactions: { none: {} }
        }
      });

      const paidUsersCount = await prisma.user.count({
        where: { 
          transactions: { some: {} } 
        }
      });

      // Build user distribution data
      const userDistribution = {
        free: freeUsersCount || 0,
        paid: paidUsersCount || 0,
        inactive: totalUsers - (freeUsersCount + paidUsersCount)
      };

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
        select: {
          id: true,
          name: true,
          email: true,
          balance: true
        }
      });

      const topUsersWithDetails = topUsers.map((user) => {
        const details = topUserDetails.find((u) => u.id === user.userId);
        return {
          userId: user.userId,
          name: details?.name || 'Unknown',
          email: details?.email || 'Unknown',
          requests: user._sum.count || 0,
          balance: details?.balance || 0
        };
      });

      // Get user growth data for last 12 months
      const userGrowth: { date: string; users: number; active: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const usersCount = await prisma.user.count({
          where: {
            createdAt: { lte: endOfMonth }
          }
        });

        // Count active users based on API usage or valid sessions
        const activeCount = await prisma.user.count({
          where: {
            createdAt: { lte: endOfMonth },
            OR: [
              { 
                sessions: { 
                  some: { 
                    expires: { gte: startOfMonth }
                  } 
                } 
              },
              {
                apiKeys: {
                  some: { 
                    lastUsed: { gte: startOfMonth, lte: endOfMonth } 
                  },
                },
              },
              {
                usageStats: {
                  some: {
                    date: { gte: startOfMonth, lte: endOfMonth }
                  }
                }
              }
            ],
          }
        });

        userGrowth.push({
          date: startOfMonth.toLocaleDateString('en-US', { month: 'short' }),
          users: usersCount,
          active: activeCount,
        });
      }

      // Get recent activity
      const recentActivity: RecentActivity[] = [];
      
      // Get recent API usage
      const recentApiUsage = await prisma.usageStats.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
        take: 20,
        include: {
          user: true,
        },
      });

      recentApiUsage.forEach((usage) => {
        recentActivity.push({
          id: usage.id,
          userId: usage.userId,
          userName: usage.user.name || 'Unknown',
          userEmail: usage.user.email || 'Unknown',
          action: 'api_call',
          resource: usage.operation,
          details: `Used ${usage.operation} operation ${usage.count} times`,
          timestamp: usage.date,
          type: 'api' as const,
        });
      });

      // Get recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          user: true,
        }
      });

      recentTransactions.forEach((tx) => {
        const isDeposit = tx.amount > 0;
        recentActivity.push({
          id: tx.id,
          userId: tx.userId,
          userName: tx.user.name || 'Unknown',
          userEmail: tx.user.email || 'Unknown',
          action: isDeposit ? 'balance_deposit' : 'operation_charge',
          resource: 'transaction',
          details: isDeposit 
            ? `Deposited $${tx.amount.toFixed(2)} to account balance` 
            : `Charged $${Math.abs(tx.amount).toFixed(3)} for operation`,
          timestamp: tx.createdAt,
          type: 'subscription' as const,
        });
      });

      // Get recent user registrations
      const recentUsers = await prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 15,
      });

      recentUsers.forEach((user) => {
        recentActivity.push({
          id: user.id,
          userId: user.id,
          userName: user.name || 'Unknown',
          userEmail: user.email || 'Unknown',
          action: 'user_registered',
          resource: 'user',
          details: 'New user registration',
          timestamp: user.createdAt,
          type: 'user' as const,
        });
      });

      // Get recent API key creations
      const recentApiKeys = await prisma.apiKey.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: true,
        },
      });

      recentApiKeys.forEach((apiKey) => {
        recentActivity.push({
          id: apiKey.id,
          userId: apiKey.userId,
          userName: apiKey.user.name || 'Unknown',
          userEmail: apiKey.user.email || 'Unknown',
          action: 'api_key_created',
          resource: 'api_key',
          details: `Created API key: ${apiKey.name}`,
          timestamp: apiKey.createdAt,
          type: 'api' as const,
        });
      });

      // Sort all activities by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Take only the most recent 20
      const finalRecentActivity = recentActivity.slice(0, 10);

      // Get system metrics
      const systemMetrics = getSystemMetrics();

      // Calculate revenues
      const monthlyRevenue = transactionStats._sum.amount || 0;
      const estimatedAnnualRevenue = monthlyRevenue * 12;

      const stats: AdminStats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          bySubscription: userDistribution, // Updated to use our new categories
        },
        apiUsage: {
          totalRequests: apiUsageTotal._sum.count || 0,
          byOperation: operationCounts,
          topUsers: topUsersWithDetails,
        },
        revenue: {
          thisMonth: monthlyRevenue,
          growth: 0, // Would need historical data to calculate this
          annual: estimatedAnnualRevenue
        },
        system: systemMetrics,
        userGrowth,
        recentActivity: finalRecentActivity,
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