// app/api/user/subscription/cancel/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { cancelSubscription } from '@/lib/paypal';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user's active subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }
    
    // Cancel subscription with PayPal
    if (subscription.paypalSubscriptionId) {
      await cancelSubscription(subscription.paypalSubscriptionId);
    }
    
    // Update subscription status in database
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        status: 'canceled',
        canceledAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}