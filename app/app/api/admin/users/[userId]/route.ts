// app/api/admin/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  return withAdminAuth(async () => {
    try {
      // Await the params object
      const { userId } = await params;
      const body = await request.json();
      const { name, email, role, subscription } = body;

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

      // Only update user if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // Update subscription if provided
      if (subscription && subscription.tier !== undefined) {
        const existingSubscription = await prisma.subscription.findUnique({
          where: { userId: userId },
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              tier: subscription.tier,
              status: subscription.status || existingSubscription.status,
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId: userId,
              tier: subscription.tier,
              status: subscription.status || 'active',
            },
          });
        }
      }

      // Fetch updated user with all relations
      const finalUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
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
      
      // Format the response to match AdminUser type
      const formattedUser = {
        id: finalUser.id,
        name: finalUser.name,
        email: finalUser.email,
        role: finalUser.role,
        createdAt: finalUser.createdAt,
        lastActive: finalUser.updatedAt,
        subscription: finalUser.subscription,
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