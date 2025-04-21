// app/api/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSubscription, updateUserSubscription } from '@/lib/paypal';

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

        // Get the request body
        const { tier } = await request.json();

        if (!tier || !['basic', 'pro', 'enterprise', 'free'].includes(tier)) {
            return NextResponse.json(
                { error: 'Invalid subscription tier' },
                { status: 400 }
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

        // If downgrading to free, handle separately
        if (tier === 'free') {
            if (user.subscription?.paypalSubscriptionId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Please cancel your existing subscription from the dashboard first'
                    },
                    { status: 400 }
                );
            }

            // Update to free tier directly
            await updateUserSubscription(user.id, {
                tier: 'free',
                status: 'active',
                paypalSubscriptionId: null,
                paypalPlanId: null,
            });

            return NextResponse.json({
                success: true,
                message: 'Subscription downgraded to free tier',
            });
        }

        try {
            // Create PayPal subscription
            const { subscriptionId, approvalUrl } = await createSubscription(user.id, tier);

            // Mark subscription as pending until user completes PayPal flow
            await updateUserSubscription(user.id, {
                paypalSubscriptionId: subscriptionId,
                tier: user.subscription?.tier || 'free', // Keep current tier
                status: 'pending', // Mark as pending until confirmed
            });

            // Return the PayPal approval URL
            return NextResponse.json({
                success: true,
                checkoutUrl: approvalUrl,
                message: 'Please complete the payment process on PayPal',
            });
        } catch (createError) {
            console.error('Error creating PayPal subscription:', createError);
            
            return NextResponse.json(
                {
                    error: 'Failed to create subscription with payment provider',
                    message: createError instanceof Error ? createError.message : 'Unknown error'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error processing subscription request:', error);

        return NextResponse.json(
            {
                error: 'Failed to process subscription request',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}