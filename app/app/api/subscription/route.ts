// app/api/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSubscription, updateUserSubscription } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tier } = await request.json();
    if (!tier || !['basic', 'pro', 'enterprise', 'free'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    console.log('Processing subscription request', {
      userId: session.user.id,
      tier
    });

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

    // Handle downgrade to free tier
    if (tier === 'free') {
      if (user.subscription?.paypalSubscriptionId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Please cancel your existing subscription from the dashboard first',
          },
          { status: 400 }
        );
      }

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

    // Handle upgrade or changing paid tiers
    try {
      const { subscriptionId, approvalUrl } = await createSubscription(user.id, tier);

      return NextResponse.json({
        success: true,
        checkoutUrl: approvalUrl,
        subscriptionId,
        message: 'Please complete the payment process on PayPal',
      });
    } catch (createError) {
      console.error('Error creating PayPal subscription:', createError);
      return NextResponse.json(
        {
          error: 'Failed to create subscription with payment provider',
          message: createError instanceof Error ? createError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing subscription request:', error);
    return NextResponse.json(
      {
        error: 'Failed to process subscription request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get subscription details
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
      // Add usage limits based on tier
      limit: tier === 'basic' ? 5000 : 
             tier === 'pro' ? 50000 : 
             tier === 'enterprise' ? 100000 : 500,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}