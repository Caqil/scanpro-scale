// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cancelSubscription, updateUserSubscription } from '@/lib/paypal';

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

    console.log('Processing subscription cancellation', {
      userId: session.user.id
    });

    // Get user's subscription
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

    if (!user.subscription || user.subscription.tier === 'free') {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      );
    }

    const paypalSubscriptionId = user.subscription.paypalSubscriptionId;

    // If no PayPal subscription ID, update to free tier immediately
    if (!paypalSubscriptionId) {
      console.log('No PayPal subscription ID found, downgrading to free tier', {
        userId: user.id
      });
      
      await updateUserSubscription(user.id, {
        tier: 'free',
        status: 'active',
        paypalSubscriptionId: null,
        paypalPlanId: null,
        canceledAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    }

    // Try to cancel with PayPal
    try {
      console.log('Requesting PayPal subscription cancellation', {
        subscriptionId: paypalSubscriptionId
      });
      
      await cancelSubscription(paypalSubscriptionId);

      // Update our database
      await updateUserSubscription(user.id, {
        status: 'active',
        tier: 'free',
        canceledAt: new Date(),
        paypalSubscriptionId: null,
        paypalPlanId: null,
      });

      console.log('Subscription successfully cancelled', {
        userId: user.id,
        subscriptionId: paypalSubscriptionId
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully.',
      });
    } catch (paypalError) {
      console.error('Error cancelling subscription with PayPal:', paypalError);

      // If PayPal cancellation fails, update our database anyway
      await updateUserSubscription(user.id, {
        status: 'active',
        tier: 'free',
        canceledAt: new Date(),
        paypalSubscriptionId: null,
        paypalPlanId: null,
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled in our system. There may have been an issue with PayPal, but your account has been updated.',
      });
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}