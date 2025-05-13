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

    // Handle tier filtering in pay-as-you-go model
    if (tier && tier !== 'all') {
      if (tier === 'free') {
        // Free users have no transactions
        where.transactions = { none: {} };
      } else if (tier === 'paid') {
        // Paid users have at least one transaction
        where.transactions = { some: {} };
      }
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
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
              usageStats: true,
              transactions: true
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

    // Format user data to include balance information
    const formattedUsers = users.map(user => {
      const totalUsage = usageData.find(u => u.userId === user.id)?._sum.count || 0;
      const monthlyUsage = thisMonthUsage.find(u => u.userId === user.id)?._sum.count || 0;
      const lastMonthUsage = totalUsage - monthlyUsage;

      // Get last active date
      const lastApiUsed = user.apiKeys
        .map(key => key.lastUsed)
        .filter(Boolean)
        .sort((a, b) => b!.getTime() - a!.getTime())[0];

      // Determine user tier based on transaction history
      const hasPaid = user._count.transactions > 0;
      const accountTier = hasPaid ? 'paid' : 'free';

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: lastApiUsed || user.updatedAt,
        balance: user.balance || 0,
        freeOperationsUsed: user.freeOperationsUsed || 0,
        freeOperationsRemaining: Math.max(0, 500 - (user.freeOperationsUsed || 0)), // 500 is FREE_OPERATIONS_MONTHLY
        // Map to subscription format for backward compatibility
        subscription: {
          tier: accountTier,
          status: 'active' // Always active in pay-as-you-go
        },
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

// Update user role or balance
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
    const updateData: any = {};
    
    // Only update fields that are explicitly provided in the request
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.balance !== undefined) updateData.balance = parseFloat(updates.balance);
    if (updates.freeOperationsUsed !== undefined) updateData.freeOperationsUsed = parseInt(updates.freeOperationsUsed);
    
    // Handle suspended status
    if (updates.suspended !== undefined) {
      updateData.role = updates.suspended ? 'suspended' : 'user';
    }

    // Only update user if there are fields to update
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // If balance was changed, create a transaction record
    if (updates.balance !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      });

      if (user) {
        // Calculate the amount added (positive) or subtracted (negative)
        const currentBalance = user.balance || 0;
        const previousBalance = currentBalance - (parseFloat(updates.balance) - currentBalance);
        const amount = currentBalance - previousBalance;

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId,
            amount,
            balanceAfter: currentBalance,
            description: amount > 0 
              ? 'Admin balance adjustment (added funds)' 
              : 'Admin balance adjustment (removed funds)',
            status: 'completed'
          }
        });
      }
    }

    // Fetch updated user with all relations
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        apiKeys: {
          select: {
            id: true,
            name: true,
            lastUsed: true,
            permissions: true,
          },
        },
        // Calculate usage statistics
        usageStats: {
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
            },
          },
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
    });

    if (!finalUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate usage data
    const totalUsage = await prisma.usageStats.aggregate({
      where: { userId },
      _sum: { count: true },
    });

    const thisMonthUsage = finalUser.usageStats.reduce((sum, stat) => sum + stat.count, 0);
    
    // Format the response
    const hasPaid = finalUser._count.transactions > 0;
    const formattedUser = {
      id: finalUser.id,
      name: finalUser.name,
      email: finalUser.email,
      role: finalUser.role,
      createdAt: finalUser.createdAt,
      lastActive: finalUser.updatedAt,
      balance: finalUser.balance || 0,
      freeOperationsUsed: finalUser.freeOperationsUsed || 0,
      freeOperationsRemaining: Math.max(0, 500 - (finalUser.freeOperationsUsed || 0)),
      subscription: {
        tier: hasPaid ? 'paid' : 'free',
        status: 'active'
      },
      apiKeys: finalUser.apiKeys,
      usage: {
        total: totalUsage._sum.count || 0,
        thisMonth: thisMonthUsage,
        lastMonth: 0, // You can calculate this if needed
      },
    };

    return NextResponse.json({ success: true, user: formattedUser });
  });
}