// app/api/subscription/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSubscriptionDetails, updateUserSubscription, PAYPAL_PLAN_IDS } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Authentication failed: No user session found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const { subscriptionId } = await request.json();
    if (!subscriptionId) {
      console.error('Invalid request: Subscription ID missing');
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    console.log('Starting subscription verification', {
      subscriptionId,
      userId: session.user.id
    });

    // Fetch user and current subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });
    if (!user) {
      console.error('User not found', { userId: session.user.id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasPendingSubscription = user.subscription?.status === 'pending';
    console.log('Current subscription state', {
      hasPendingSubscription,
      currentTier: user.subscription?.tier || 'none',
      currentStatus: user.subscription?.status || 'none',
    });

    try {
      // Fetch PayPal subscription details
      console.log('Fetching PayPal subscription details', { subscriptionId });
      const paypalSubscriptionDetails = await getSubscriptionDetails(subscriptionId);

      if (!paypalSubscriptionDetails || !paypalSubscriptionDetails.id) {
        console.warn('PayPal subscription not found or invalid', { subscriptionId });
        
        // Handle not found subscription
        if (hasPendingSubscription) {
          console.log('Reverting pending subscription to free tier', { userId: session.user.id });
          await updateUserSubscription(session.user.id, {
            tier: 'free',
            status: 'active',
            paypalSubscriptionId: null,
            paypalPlanId: null,
            canceledAt: null,
          });
        }
        
        return NextResponse.json({
          success: false,
          message: 'Subscription not found or was canceled',
          subscription: { tier: 'free', status: 'active' },
        });
      }

// app/api/subscription/verify/route.ts (continued from earlier)
      // Get subscription status and plan ID
      const status = paypalSubscriptionDetails.status.toLowerCase();
      const planId = paypalSubscriptionDetails.plan_id;
      
      console.log('PayPal subscription details', {
        subscriptionId,
        status,
        planId
      });

      // Determine tier from plan ID
      let tier = 'basic'; // Default to basic if we can't determine the tier
      Object.entries(PAYPAL_PLAN_IDS).forEach(([key, value]) => {
        if (value === planId) tier = key;
      });
      
      // Handle active or approved subscriptions
      if (['active', 'approved'].includes(status)) {
        console.log('Processing active subscription', { subscriptionId, tier });
        
        // Calculate billing dates based on PayPal response
        const currentPeriodStart = new Date();
        
        // Use PayPal's next billing time if available, otherwise default to 30 days
        const currentPeriodEnd = paypalSubscriptionDetails.billing_info?.next_billing_time
          ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
          : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        // Set last payment date and next billing date
        const lastPaymentDate = new Date();
        const nextBillingDate = currentPeriodEnd;
        
        console.log('Updating subscription to active', {
          userId: session.user.id,
          tier,
          billingPeriod: {
            start: currentPeriodStart.toISOString(),
            end: currentPeriodEnd.toISOString()
          }
        });
        
        // Update subscription in database
        const subscription = await updateUserSubscription(session.user.id, {
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: planId,
          tier,
          status: 'active',
          currentPeriodStart,
          currentPeriodEnd,
          lastPaymentDate,
          nextBillingDate,
          canceledAt: null,
        });
        
        console.log('Subscription successfully activated', {
          subscriptionId,
          userId: session.user.id,
          tier
        });
        
        return NextResponse.json({
          success: true,
          message: 'Subscription activated successfully',
          subscription: {
            tier,
            status: 'active',
            paypalSubscriptionId: subscriptionId,
            paypalPlanId: planId,
            currentPeriodStart,
            currentPeriodEnd,
            lastPaymentDate,
            nextBillingDate,
          },
        });
      } 
      // Handle pending subscriptions
      else if (status === 'pending' || status === 'approval_pending') {
        console.log('Subscription is still pending', { subscriptionId, status });
        
        return NextResponse.json({
          success: false,
          message: `Subscription is still pending. Please complete the payment process with PayPal.`,
          subscription: { 
            tier: user.subscription?.tier || 'pending', 
            status: 'pending' 
          },
        });
      }
      // Force activation for any other status (to handle potential PayPal status variations)
      else {
        console.log('Forcing subscription activation for status', { status, subscriptionId });
        
        // Calculate billing dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        // Update with active status regardless of PayPal reported status
        await updateUserSubscription(session.user.id, {
          paypalSubscriptionId: subscriptionId,
          paypalPlanId: planId,
          tier,
          status: 'active',
          currentPeriodStart,
          currentPeriodEnd,
          lastPaymentDate: new Date(),
          nextBillingDate: currentPeriodEnd,
          canceledAt: null,
        });
        
        return NextResponse.json({
          success: true,
          message: 'Subscription activated (force)',
          subscription: {
            tier,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
          },
        });
      }
    } catch (paypalError) {
      console.error('PayPal verification error', {
        subscriptionId,
        userId: session.user.id,
        error: paypalError instanceof Error ? paypalError.message : paypalError,
      });
      
      // Revert to free tier if there was an error verifying with PayPal
      if (hasPendingSubscription) {
        console.log('Reverting to free tier due to PayPal error', { userId: session.user.id });
        await updateUserSubscription(session.user.id, {
          tier: 'free',
          status: 'active',
          paypalSubscriptionId: null,
          paypalPlanId: null,
          canceledAt: null,
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to verify with PayPal',
        message: paypalError instanceof Error ? paypalError.message : 'Unknown error',
        subscription: { tier: 'free', status: 'active' },
      });
    }
  } catch (error) {
    console.error('Error verifying subscription', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      {
        error: 'Failed to verify subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}