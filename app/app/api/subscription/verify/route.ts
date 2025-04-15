// app/api/subscription/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSubscriptionDetails, updateUserSubscription, PAYPAL_PLAN_IDS } from '@/lib/paypal';

// app/api/subscription/verify/route.ts - Fix subscription verification

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const subscriptionId = searchParams.get('subscription_id');

    // Ensure we have a subscription or session ID to verify
    if (!subscriptionId && !sessionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }

    // Get user with current subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user has a pending subscription - important to prevent unwanted premium access
    const hasPendingSubscription = user.subscription?.status === 'pending';
    
    // If we have a subscription ID from PayPal, verify with PayPal
    if (subscriptionId) {
      try {
        const paypalSubscriptionDetails = await getSubscriptionDetails(subscriptionId);

        if (!paypalSubscriptionDetails || !paypalSubscriptionDetails.id) {
          // If PayPal doesn't recognize the subscription, ensure user remains on free tier
          // only if they were previously marked as pending
          if (hasPendingSubscription) {
            await updateUserSubscription(session.user.id, {
              tier: 'free',
              status: 'active',
              paypalSubscriptionId: null,
              paypalPlanId: null,
            });
          }

          return NextResponse.json({ 
            success: false, 
            message: 'Subscription not found or was canceled',
            subscription: {
              tier: 'free',
              status: 'active'
            }
          });
        }

        const status = paypalSubscriptionDetails.status.toLowerCase();

        if (status === 'active' || status === 'approved') {
          const planId = paypalSubscriptionDetails.plan_id;
          let tier = 'basic';
          Object.entries(PAYPAL_PLAN_IDS).forEach(([key, value]) => {
            if (value === planId) tier = key;
          });

          const currentPeriodStart = paypalSubscriptionDetails.billing_info.last_payment?.time
            ? new Date(paypalSubscriptionDetails.billing_info.last_payment.time)
            : new Date();
          const currentPeriodEnd = paypalSubscriptionDetails.billing_info.next_billing_time
            ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
            : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

          // Update subscription only when PayPal confirms it's active
          const subscription = await updateUserSubscription(session.user.id, {
            paypalSubscriptionId: subscriptionId,
            paypalPlanId: planId,
            tier,
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
          });

          return NextResponse.json({ success: true, subscription });
        }
      } catch (paypalError) {
        console.error('PayPal verification error:', paypalError);
        // On error, don't change the user's subscription
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to verify with PayPal',
          subscription: user.subscription 
        });
      }
    }

    // If we don't have a subscription ID, or if the status check above failed,
    // make sure to reset pending subscriptions to free
    if (hasPendingSubscription) {
      await updateUserSubscription(session.user.id, {
        tier: 'free',
        status: 'active',
        paypalSubscriptionId: null,
        paypalPlanId: null,
      });
      
      return NextResponse.json({ 
        success: false, 
        message: 'Payment not completed or was canceled',
        subscription: {
          tier: 'free',
          status: 'active'
        }
      });
    }

    // If user doesn't have a pending subscription, return their current status
    return NextResponse.json({ 
      success: false, 
      message: 'No pending subscription found',
      subscription: user.subscription 
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
  }
}