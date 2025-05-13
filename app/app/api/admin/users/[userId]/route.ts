// app/api/admin/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import { USAGE_LIMITS } from '@/lib/validate-key';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAdminAuth(async () => {
    try {
      // Await the params object
      const { userId } = await params;
      const body = await request.json();
      const { name, email, role, balance, freeOperationsUsed, freeOperationsReset } = body;

      // Validate input
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Update user data - handle null/undefined values properly
      const updateData: any = {};
      
      // Only update fields that are explicitly provided in the request
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      
      // Handle pay-as-you-go fields
      if (balance !== undefined) updateData.balance = parseFloat(balance);
      if (freeOperationsUsed !== undefined) updateData.freeOperationsUsed = parseInt(freeOperationsUsed);
      if (freeOperationsReset !== undefined) updateData.freeOperationsReset = new Date(freeOperationsReset);

      // Only update user if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // If balance was modified, create a transaction record
      if (balance !== undefined) {
        // Get current user data to determine balance difference
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { balance: true }
        });

        if (currentUser) {
          // Create transaction for the balance adjustment
          await prisma.transaction.create({
            data: {
              userId,
              amount: updateData.balance - (currentUser.balance || 0), // Positive for addition, negative for subtraction
              balanceAfter: updateData.balance,
              description: 'Admin balance adjustment',
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
          // Get transaction count to determine if user is paid
          _count: {
            select: {
              transactions: {
                where: {
                  amount: { gt: 0 },
                  status: 'completed'
                }
              }
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
        where: { userId: userId },
        _sum: { count: true },
      });

      const thisMonthUsage = finalUser.usageStats.reduce((sum, stat) => sum + stat.count, 0);
      
      // Determine user tier based on whether they've made deposits
      const hasPaidDeposits = finalUser._count.transactions > 0;
      const userTier = hasPaidDeposits ? USAGE_LIMITS.paid : USAGE_LIMITS.free;
      // Format the response to match AdminUser type
      const formattedUser = {
        id: finalUser.id,
        name: finalUser.name,
        email: finalUser.email,
        role: finalUser.role,
        createdAt: finalUser.createdAt,
        lastActive: finalUser.updatedAt,
        balance: finalUser.balance || 0,
        freeOperationsUsed: finalUser.freeOperationsUsed || 0,
        freeOperationsReset: finalUser.freeOperationsReset,
        freeOperationsRemaining: Math.max(0, 500 - (finalUser.freeOperationsUsed || 0)), // Assuming 500 free ops
        // Include subscription for backward compatibility with frontend
        subscription: {
          tier: userTier,
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
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAdminAuth(async () => {
    try {
      // Await the params object
      const { userId } = await params;

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Delete user and all related data (cascade delete)
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  });
}