// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { USAGE_LIMITS } from '@/lib/validate-key';

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name } = await request.json();

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Get user subscription info
        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
        });
        
        // Get usage statistics
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        
        const usage = await prisma.usageStats.aggregate({
            where: {
                userId: session.user.id,
                date: { gte: firstDayOfMonth },
            },
            _sum: { count: true },
        });
        
        // Default to free tier if no subscription exists
        const tier = subscription?.tier || "free";
        const operations = usage._sum.count || 0;
        
        return NextResponse.json({
            tier,
            status: subscription?.status || "active",
            currentPeriodStart: subscription?.currentPeriodStart,
            currentPeriodEnd: subscription?.currentPeriodEnd,
            canceledAt: subscription?.canceledAt,
            operations,
            limit: USAGE_LIMITS[tier as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free,
        });
    } catch (error) {
        console.error("Error fetching user subscription data:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription data" },
            { status: 500 }
        );
    }
}