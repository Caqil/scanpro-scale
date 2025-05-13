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

        // Get user with balance information
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                balance: true,
                freeOperationsUsed: true,
                freeOperationsReset: true,
                transactions: {
                    where: {
                        amount: { gt: 0 },
                        status: 'completed'
                    },
                    take: 1
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Determine if user is paid or free based on having transactions
        const hasPaidDeposits = user.transactions.length > 0 || (user.balance && user.balance > 0);
        const tier = hasPaidDeposits ? "paid" : "free";

        // Calculate free operations remaining and reset date
        let freeOpsRemaining = 0;
        let resetDate = user.freeOperationsReset;
        const now = new Date();

        // Check if reset date has passed
        if (resetDate && resetDate < now) {
            // If reset date has passed, user has all free operations available
            freeOpsRemaining = USAGE_LIMITS.free;
            
            // Calculate next reset date (first day of next month)
            resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        } else {
            // Otherwise calculate remaining based on used count
            freeOpsRemaining = Math.max(0, USAGE_LIMITS.free - (user.freeOperationsUsed || 0));
        }

        // Get this month's usage
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
        
        const operations = usage._sum.count || 0;
        
        // Get user's current balance
        const currentBalance = user.balance || 0;
        
        // For backward compatibility with frontend, simulate subscription period
        // Using today as start and end of next month as end
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        
        return NextResponse.json({
            tier,
            status: "active", // Always active in pay-as-you-go
            currentPeriodStart,
            currentPeriodEnd,
            operations,
            limit: hasPaidDeposits ? USAGE_LIMITS.paid : USAGE_LIMITS.free,
            // Add pay-as-you-go specific fields
            balance: currentBalance,
            freeOperationsUsed: user.freeOperationsUsed || 0,
            freeOperationsRemaining: freeOpsRemaining,
            freeOperationsReset: resetDate
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile data" },
            { status: 500 }
        );
    }
}