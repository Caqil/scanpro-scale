// app/api/subscription/reset-pending/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Get the current session
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get the user with current subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Only reset if the subscription is in 'pending' status
        if (user.subscription?.status === 'pending') {
            // Reset to free tier
            await prisma.subscription.update({
                where: { userId: user.id },
                data: {
                    tier: 'free',
                    status: 'active',
                    paypalSubscriptionId: null,
                    paypalPlanId: null,
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Pending subscription reset to free tier'
            });
        }

        // If not pending, no change needed
        return NextResponse.json({
            success: true,
            message: 'No pending subscription to reset'
        });
    } catch (error) {
        console.error('Error resetting pending subscription:', error);

        return NextResponse.json(
            { error: 'Failed to reset pending subscription' },
            { status: 500 }
        );
    }
}