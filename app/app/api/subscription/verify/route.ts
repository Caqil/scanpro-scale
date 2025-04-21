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
    console.log('Starting subscription verification', {
      userId: session.user.id,
      subscriptionId,
      hasPendingSubscription,
    });

    try {
      // Fetch PayPal subscription details
      console.log('Fetching PayPal subscription details', { subscriptionId });
      const paypalSubscriptionDetails = await getSubscriptionDetails(subscriptionId);

      if (!paypalSubscriptionDetails || !paypalSubscriptionDetails.id) {
        console.warn('PayPal subscription not found or invalid', { subscriptionId });
        if (hasPendingSubscription) {
          console.log('Reverting pending subscription to free', { userId: session.user.id });
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

      const status = paypalSubscriptionDetails.status.toLowerCase();
      console.log('PayPal subscription status', {
        subscriptionId,
        status,
        planId: paypalSubscriptionDetails.plan_id,
      });

      // Handle active or approved subscriptions
      if (status === 'active' || status === 'approved') {
        const planId = paypalSubscriptionDetails.plan_id;
        // Determine tier from plan_id
        let tier = 'basic';
        Object.entries(PAYPAL_PLAN_IDS).forEach(([key, value]) => {
          if (value === planId) tier = key;
        });

        // Calculate billing dates
        const currentPeriodStart = paypalSubscriptionDetails.billing_info?.last_payment?.time
          ? new Date(paypalSubscriptionDetails.billing_info.last_payment.time)
          : new Date();
        const currentPeriodEnd = paypalSubscriptionDetails.billing_info?.next_billing_time
          ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
          : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        const lastPaymentDate = paypalSubscriptionDetails.billing_info?.last_payment?.time
          ? new Date(paypalSubscriptionDetails.billing_info.last_payment.time)
          : new Date();
        const nextBillingDate = paypalSubscriptionDetails.billing_info?.next_billing_time
          ? new Date(paypalSubscriptionDetails.billing_info.next_billing_time)
          : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

        console.log('Updating subscription to active', {
          userId: session.user.id,
          subscriptionId,
          tier,
          currentPeriodStart,
          currentPeriodEnd,
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

        console.log('Subscription successfully verified and activated', {
          userId: session.user.id,
          subscriptionId,
          tier,
          status: 'active',
        });

        return NextResponse.json({
          success: true,
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
      } else {
        // Handle non-active subscriptions (e.g., pending, suspended)
        console.warn('Subscription not active', { subscriptionId, status });
        if (hasPendingSubscription && status !== 'pending') {
          // Revert to free if the subscription is not pending (e.g., cancelled, suspended)
          console.log('Reverting pending subscription to free due to non-pending status', {
            userId: session.user.id,
            status,
          });
          await updateUserSubscription(session.user.id, {
            tier: 'free',
            status: 'active',
            paypalSubscriptionId: null,
            paypalPlanId: null,
            canceledAt: null,
          });
          return NextResponse.json({
            success: false,
            message: `Subscription not active (status: ${status})`,
            subscription: { tier: 'free', status: 'active' },
          });
        }
        // If status is pending, inform user to wait
        return NextResponse.json({
          success: false,
          message: `Subscription is still pending. Please wait a moment and try again.`,
          subscription: { tier: user.subscription?.tier || 'free', status: 'pending' },
        });
      }
    } catch (paypalError) {
      console.error('PayPal verification error', {
        subscriptionId,
        userId: session.user.id,
        error: paypalError instanceof Error ? paypalError.message : paypalError,
      });
      if (hasPendingSubscription) {
        console.log('Reverting pending subscription to free due to PayPal error', {
          userId: session.user.id,
        });
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
        subscription: { tier: 'free', status: 'active' },
      });
    }
  } catch (error) {
    console.error('Error verifying subscription', {
      subscriptionId: request.body ? (await request.json()).subscriptionId : 'unknown',
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