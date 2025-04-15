// app/api/subscription/upgrade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSubscription, updateUserSubscription } from '@/lib/paypal';
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { tier } = await request.json();

        if (!tier || !['basic', 'pro', 'enterprise'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (tier === 'free') {
            if (user.subscription?.paypalSubscriptionId) {
                return NextResponse.json(
                    { success: false, message: 'Please cancel your existing subscription from the dashboard first' },
                    { status: 400 }
                );
            }

            await updateUserSubscription(user.id, {
                tier: 'free',
                status: 'active',
                paypalSubscriptionId: null,
                paypalPlanId: null,
            });

            return NextResponse.json({ success: true, message: 'Subscription downgraded to free tier' });
        }

        // Create PayPal subscription but don’t update Prisma yet
        const { subscriptionId, approvalUrl } = await createSubscription(user.id, tier);

        // Return the subscription ID and approval URL without updating the database
        return NextResponse.json({
            success: true,
            checkoutUrl: approvalUrl,
            subscriptionId,
            message: 'Please complete the payment process on PayPal',
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}