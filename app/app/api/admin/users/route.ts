// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

export async function GET(request: Request) {
  return withAdminAuth(async () => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tier && tier !== 'all') {
      if (tier === 'free') {
        where.subscription = null;
      } else {
        where.subscription = { tier };
      }
    }

    if (status && status !== 'all') {
      where.subscription = { ...where.subscription, status };
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: true,
          apiKeys: {
            select: {
              id: true,
              name: true,
              lastUsed: true,
              permissions: true
            }
          },
          _count: {
            select: {
              usageStats: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Get usage data for users
    const userIds = users.map(u => u.id);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const usageData = await prisma.usageStats.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        date: { gte: firstDayOfLastMonth }
      },
      _sum: { count: true }
    });

    const thisMonthUsage = await prisma.usageStats.groupBy({
      by: ['userId'],
      where: {
        userId: { in: userIds },
        date: { gte: firstDayOfMonth }
      },
      _sum: { count: true }
    });

    // Format user data
    const formattedUsers = users.map(user => {
      const totalUsage = usageData.find(u => u.userId === user.id)?._sum.count || 0;
      const monthlyUsage = thisMonthUsage.find(u => u.userId === user.id)?._sum.count || 0;
      const lastMonthUsage = totalUsage - monthlyUsage;

      // Get last active date
      const lastApiUsed = user.apiKeys
        .map(key => key.lastUsed)
        .filter(Boolean)
        .sort((a, b) => b!.getTime() - a!.getTime())[0];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: lastApiUsed || user.updatedAt,
        subscription: user.subscription ? {
          tier: user.subscription.tier,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          paypalSubscriptionId: user.subscription.paypalSubscriptionId
        } : null,
        apiKeys: user.apiKeys,
        usage: {
          total: totalUsage,
          thisMonth: monthlyUsage,
          lastMonth: lastMonthUsage
        }
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  });
}

// Update user role or subscription
export async function PATCH(request: Request) {
  return withAdminAuth(async () => {
    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      include: {
        subscription: true,
        apiKeys: true
      }
    });

    return NextResponse.json(updatedUser);
  });
}