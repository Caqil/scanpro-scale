// lib/paypal.ts
import { prisma } from '@/lib/prisma';

// Define plan IDs for different subscription tiers
export const PAYPAL_PLAN_IDS: Record<string, string> = {
  basic: process.env.PAYPAL_PLAN_BASIC || 'plan_basic_default',
  pro: process.env.PAYPAL_PLAN_PRO || 'plan_pro_default',
  enterprise: process.env.PAYPAL_PLAN_ENTERPRISE || 'plan_enterprise_default',
};

// Set up PayPal API base URLs based on environment
export const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

export async function getPayPalAccessToken(): Promise<string> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('PayPal credentials missing');
      throw new Error('PayPal credentials are not configured');
    }

    console.log('Requesting PayPal access token');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PayPal token request failed:', {
        status: response.status,
        error: errorData
      });
      throw new Error(`Failed to get PayPal access token: ${response.status} - ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    console.log('PayPal access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error(`PayPal authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createSubscription(userId: string, tier: string): Promise<{ subscriptionId: string; approvalUrl: string }> {
  try {
    const planId = PAYPAL_PLAN_IDS[tier];
    if (!planId) {
      console.error('Invalid tier specified:', tier);
      throw new Error(`No PayPal plan ID configured for tier: ${tier}`);
    }

    console.log('Initiating subscription creation', { userId, tier, planId });
    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${appUrl}/en/dashboard/subscription/success`;
    const cancelUrl = `${appUrl}/en/dashboard/subscription/cancel`;

    console.log('Subscription URLs', { appUrl, returnUrl, cancelUrl });

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `sub_${Date.now()}_${userId.substring(0, 8)}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: userId,
        application_context: {
          brand_name: "ScanPro",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error('PayPal subscription creation failed:', {
        status: response.status,
        error: errorData
      });
      throw new Error(`PayPal API error: ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('PayPal subscription created successfully', {
      subscriptionId: data.id,
      userId,
      tier
    });

    const approvalUrl = data.links.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      console.error('No approval URL in PayPal response', data);
      throw new Error("No approval URL found in PayPal response");
    }

    console.log('Updating subscription in database', { userId, tier, subscriptionId: data.id });
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        status: "pending",
        paypalSubscriptionId: data.id,
        paypalPlanId: planId,
        currentPeriodStart: new Date(),
      },
      create: {
        userId,
        tier,
        status: "pending",
        paypalSubscriptionId: data.id,
        paypalPlanId: planId,
        currentPeriodStart: new Date(),
      },
    });

    return {
      subscriptionId: data.id,
      approvalUrl,
    };
  } catch (error) {
    console.error('Failed to create PayPal subscription:', {
      userId,
      tier,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`Error creating subscription: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function handlePayPalWebhook(event: any): Promise<{ success: boolean; message: string }> {
  try {
    const eventType = event.event_type;
    const resource = event.resource;

    console.log('Received PayPal webhook', {
      eventType,
      resourceId: resource.id
    });

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log('Processing subscription created event', { subscriptionId: resource.id });
        await handleSubscriptionCreated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('Processing subscription activated event', { subscriptionId: resource.id });
        await handleSubscriptionActivated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.UPDATED':
        console.log('Processing subscription updated event', { subscriptionId: resource.id });
        await handleSubscriptionUpdated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('Processing subscription canceled event', { subscriptionId: resource.id });
        await handleSubscriptionCanceled(resource);
        break;
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        console.log('Processing payment failed event', { subscriptionId: resource.id });
        await handlePaymentFailed(resource);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        console.log('Processing payment completed event', { subscriptionId: resource.billing_agreement_id });
        await handlePaymentCompleted(resource);
        break;
      default:
        console.warn('Received unhandled PayPal event type', { eventType });
    }

    console.log('Webhook processed successfully', { eventType });
    return { success: true, message: `Successfully processed ${eventType}` };
  } catch (error) {
    console.error('Failed to process PayPal webhook:', {
      eventType: event?.event_type,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  try {
    console.log('Fetching subscription details', { subscriptionId });
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch subscription details:', {
        subscriptionId,
        status: response.status,
        error: errorData
      });
      throw new Error(`Failed to get subscription details: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Subscription details retrieved', { subscriptionId, status: data.status });
    return data;
  } catch (error) {
    console.error('Error getting subscription details:', {
      subscriptionId,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`PayPal subscription details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    console.log('Initiating subscription cancellation', { subscriptionId });
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        reason: 'Canceled by customer'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      console.error('Subscription cancellation failed:', {
        subscriptionId,
        status: response.status,
        error: errorData
      });
      throw new Error(`Failed to cancel subscription: ${errorData.message || response.statusText}`);
    }

    console.log('Subscription cancelled successfully', { subscriptionId });
    return;
  } catch (error) {
    console.error('Error cancelling subscription:', {
      subscriptionId,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`PayPal subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateUserSubscription(
  userId: string,
  data: {
    tier: string;
    status: string;
    paypalSubscriptionId?: string | null;
    paypalPlanId?: string | null;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    lastPaymentDate?: Date;
    nextBillingDate?: Date;
    canceledAt?: Date | null;
  }
): Promise<any> {
  try {
    console.log('Updating user subscription in database', { userId, data });

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    let result;
    if (existingSubscription) {
      console.log('Updating existing subscription', { userId });
      result = await prisma.subscription.update({
        where: { userId },
        data
      });
    } else {
      console.log('Creating new subscription', { userId });
      result = await prisma.subscription.create({
        data: {
          userId,
          ...data
        }
      });
    }

    console.log('Subscription update completed', { userId, status: data.status });
    return result;
  } catch (error) {
    console.error('Failed to update user subscription:', {
      userId,
      error: error instanceof Error ? error.message : error
    });
    throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSubscriptionCreated(resource: any) {
  const subscriptionId = resource.id;
  const planId = resource.plan_id;
  const userId = resource.custom_id;

  console.log('Handling subscription created', { subscriptionId, planId, userId });

  if (!userId) {
    console.error('Missing user ID in subscription created event', { subscriptionId });
    return;
  }

  const tier = Object.keys(PAYPAL_PLAN_IDS).find(
    key => PAYPAL_PLAN_IDS[key as keyof typeof PAYPAL_PLAN_IDS] === planId
  ) || 'Basic';

  console.log('Updating subscription for created event', { userId, tier });
  await updateUserSubscription(userId, {
    tier,
    status: 'pending',
    paypalSubscriptionId: subscriptionId,
    paypalPlanId: planId,
    currentPeriodStart: new Date(),
  });
}

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling subscription activation', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found for activation', { subscriptionId });
    return;
  }

  console.log('Activating subscription', { userId: subscription.userId });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      usageResetDate: new Date(),
    }
  });

  console.log('Subscription activated', { subscriptionId });
}

async function handleSubscriptionUpdated(resource: any) {
  const subscriptionId = resource.id;
  const status = resource.status.toLowerCase();

  console.log('Handling subscription update', { subscriptionId, status });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for update', { subscriptionId });
    return;
  }

  console.log('Updating subscription status', { subscriptionId, newStatus: status });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: status === 'active' ? 'active' :
        status === 'cancelled' ? 'canceled' :
          status === 'suspended' ? 'suspended' : subscription.status,
    }
  });

  console.log('Subscription updated', { subscriptionId, status });
}

async function handleSubscriptionCanceled(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling subscription cancellation', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for cancellation', { subscriptionId });
    return;
  }

  console.log('Marking subscription as canceled', { subscriptionId });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    }
  });

  console.log('Subscription canceled', { subscriptionId });
}

async function handlePaymentFailed(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling payment failure', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for payment failure', { subscriptionId });
    return;
  }

  console.log('Incrementing failed payment count', { subscriptionId });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      failedPaymentCount: { increment: 1 },
    }
  });

  console.log('Payment failure processed', { subscriptionId });
}

async function handlePaymentCompleted(resource: any) {
  const subscriptionId = resource.billing_agreement_id;

  console.log('Handling payment completion', { subscriptionId });

  if (!subscriptionId) {
    console.error('Missing subscription ID in payment completed event');
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for payment completion', { subscriptionId });
    return;
  }

  console.log('Fetching subscription details for payment', { subscriptionId });
  const details = await getSubscriptionDetails(subscriptionId);

  console.log('Updating subscription with payment details', { subscriptionId });
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      lastPaymentDate: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(details.billing_info.next_billing_time || getDefaultBillingEndDate()),
      nextBillingDate: new Date(details.billing_info.next_billing_time || getDefaultBillingEndDate()),
      failedPaymentCount: 0,
      usageResetDate: new Date(),
    }
  });

  console.log('Resetting user usage stats', { userId: subscription.userId });
  await resetUserUsageStats(subscription.userId);

  console.log('Payment completion processed', { subscriptionId });
}

function getDefaultBillingEndDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  console.log('Calculated default billing end date', { date });
  return date;
}

async function resetUserUsageStats(userId: string): Promise<void> {
  console.log('Resetting usage stats', { userId });

  await prisma.usageStats.deleteMany({
    where: { userId }
  });

  const operations = ['convert', 'compress', 'merge', 'split', 'protect', 'unlock', 'watermark', 'extract', 'edit', 'sign', 'repair', 'rotate'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('Creating initial usage stats', { userId, operations });
  await Promise.all(operations.map(operation =>
    prisma.usageStats.create({
      data: {
        userId,
        operation,
        count: 0,
        date: today
      }
    })
  ));

  console.log('Usage stats reset completed', { userId });
}