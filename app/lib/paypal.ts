// lib/paypal.ts
import { prisma } from '@/lib/prisma';
import {
  sendSubscriptionInvoiceEmail,
  sendSubscriptionRenewalReminderEmail,
  sendSubscriptionExpiredEmail
} from '@/lib/email';

// Plan IDs configuration
export const PAYPAL_PLAN_IDS: Record<string, string> = {
  basic: process.env.PAYPAL_PLAN_BASIC || '',
  pro: process.env.PAYPAL_PLAN_PRO || '',
  enterprise: process.env.PAYPAL_PLAN_ENTERPRISE || '',
};

// API base URL based on environment
export const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal access token for API requests
 */
export async function getPayPalAccessToken(): Promise<string> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials are not configured');
    }

    console.log('Requesting PayPal access token');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to get PayPal access token: ${response.status} - ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error(`PayPal authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new PayPal subscription
 */
export async function createSubscription(userId: string, tier: string): Promise<{ subscriptionId: string; approvalUrl: string }> {
  try {
    const planId = PAYPAL_PLAN_IDS[tier];
    if (!planId) {
      throw new Error(`No PayPal plan ID configured for tier: ${tier}`);
    }

    console.log('Creating PayPal subscription', { userId, tier, planId });
    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/en/dashboard/subscription/success`;
    const cancelUrl = `${appUrl}/en/dashboard/subscription/cancel`;

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `sub_${Date.now()}_${userId.substring(0, 8)}`
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: userId,
        application_context: {
          brand_name: 'ScanPro',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        }
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
      throw new Error(`PayPal API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('PayPal subscription created', { subscriptionId: data.id });

    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    // Create pending subscription in database
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        tier,
        status: 'pending',
        paypalSubscriptionId: data.id,
        paypalPlanId: planId,
        currentPeriodStart: new Date(),
      },
      create: {
        userId,
        tier,
        status: 'pending',
        paypalSubscriptionId: data.id,
        paypalPlanId: planId,
        currentPeriodStart: new Date(),
      }
    });

    return {
      subscriptionId: data.id,
      approvalUrl
    };
  } catch (error) {
    console.error('Failed to create PayPal subscription:', error);
    throw new Error(`Error creating subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get details of a PayPal subscription
 */
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
      throw new Error(`Failed to get subscription details: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw new Error(`PayPal subscription details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    console.log('Cancelling subscription', { subscriptionId });
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
      throw new Error(`Failed to cancel subscription: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(`PayPal subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update user subscription in database
 */
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
    console.log('Updating user subscription', { userId, data });

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (existingSubscription) {
      return await prisma.subscription.update({
        where: { userId },
        data
      });
    } else {
      return await prisma.subscription.create({
        data: {
          userId,
          ...data
        }
      });
    }
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle PayPal webhook events
 */
export async function handlePayPalWebhook(event: any): Promise<{ success: boolean; message: string }> {
  try {
    const eventType = event.event_type;
    const resource = event.resource;

    console.log('Received PayPal webhook', { eventType, resourceId: resource?.id });

    // Save webhook event to database for debugging/audit
    await prisma.paymentWebhookEvent.create({
      data: {
        eventId: event.id,
        eventType,
        resourceType: event.resource_type,
        resourceId: resource?.id || 'unknown',
        rawData: JSON.stringify(event),
      }
    });

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await handleSubscriptionUpdated(resource);
        break;
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCanceled(resource);
        break;
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(resource);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      case 'BILLING.SUBSCRIPTION.RENEWED':
        await handleSubscriptionRenewed(resource);
        break;
    }

    return { success: true, message: `Successfully processed ${eventType}` };
  } catch (error) {
    console.error('Failed to process PayPal webhook:', error);
    throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(resource: any) {
  const subscriptionId = resource.id;
  const planId = resource.plan_id;
  const userId = resource.custom_id;

  console.log('Handling subscription created webhook', { subscriptionId, planId, userId });

  if (!userId) {
    console.error('Missing user ID in subscription created event');
    return;
  }

  // Determine tier from plan_id
  const tier = Object.entries(PAYPAL_PLAN_IDS).find(
    ([_, value]) => value === planId
  )?.[0] || 'basic';

  await updateUserSubscription(userId, {
    tier,
    status: 'pending',
    paypalSubscriptionId: subscriptionId,
    paypalPlanId: planId,
    currentPeriodStart: new Date(),
  });
}

/**
 * Handle subscription activated event
 */
async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling subscription activation webhook', { subscriptionId });

  // Find subscription in database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found for webhook activation', { subscriptionId });
    return;
  }

  // Get detailed subscription info from PayPal
  const details = await getSubscriptionDetails(subscriptionId);

  // Calculate period dates
  const currentPeriodStart = new Date();
  const currentPeriodEnd = details.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Update subscription to active
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      usageResetDate: currentPeriodEnd
    }
  });

  // Send subscription confirmation email
  if (subscription.user?.email) {
    try {
      await sendSubscriptionInvoiceEmail({
        userEmail: subscription.user.email,
        userName: subscription.user.name,
        subscriptionTier: subscription.tier,
        amount: getTierPrice(subscription.tier),
        currency: 'USD',
        invoiceNumber: `INV-${Date.now()}`,
        subscriptionPeriod: {
          start: currentPeriodStart,
          end: currentPeriodEnd
        }
      });
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
    }
  }

  console.log('Subscription activated successfully', {
    subscriptionId,
    userId: subscription.userId,
    tier: subscription.tier
  });
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(resource: any) {
  const subscriptionId = resource.id;
  const status = resource.status.toLowerCase();

  console.log('Handling subscription update webhook', { subscriptionId, status });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for webhook update', { subscriptionId });
    return;
  }

  // Map PayPal status to our status
  let newStatus;
  if (status === 'active') newStatus = 'active';
  else if (status === 'suspended' || status === 'approval_pending') newStatus = 'suspended';
  else if (status === 'cancelled') newStatus = 'canceled';
  else newStatus = subscription.status; // Keep existing status if not recognized

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: newStatus }
  });

  console.log('Subscription updated via webhook', {
    subscriptionId,
    oldStatus: subscription.status,
    newStatus
  });
}

/**
 * Handle subscription canceled event
 */
async function handleSubscriptionCanceled(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling subscription cancellation webhook', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found for webhook cancellation', { subscriptionId });
    return;
  }

  // Update subscription in database
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
      tier: 'free' // Downgrade to free tier
    }
  });

  // Send notification email
  if (subscription.user?.email) {
    try {
      await sendSubscriptionExpiredEmail(
        subscription.user.email,
        subscription.user.name || '',
        subscription.tier
      );
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }
  }

  console.log('Subscription canceled via webhook', { subscriptionId });
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling payment failure webhook', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error('Subscription not found for payment failure', { subscriptionId });
    return;
  }

  // Increment failed payment count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      failedPaymentCount: { increment: 1 }
    }
  });

  console.log('Updated failed payment count', { subscriptionId });
}

/**
 * Handle payment completed event
 */
async function handlePaymentCompleted(resource: any) {
  const subscriptionId = resource.billing_agreement_id;

  if (!subscriptionId) {
    console.error('Missing subscription ID in payment completed event');
    return;
  }

  console.log('Handling payment completion webhook', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found for payment completion', { subscriptionId });
    return;
  }

  // Get subscription details from PayPal
  const details = await getSubscriptionDetails(subscriptionId);

  // Calculate billing dates
  const lastPaymentDate = new Date();
  const currentPeriodStart = lastPaymentDate;
  const currentPeriodEnd = details.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextBillingDate = currentPeriodEnd;

  // Update subscription
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      lastPaymentDate,
      currentPeriodStart,
      currentPeriodEnd,
      nextBillingDate,
      failedPaymentCount: 0,
      usageResetDate: currentPeriodEnd
    }
  });

  // Reset usage stats for the new billing period
  await resetUserUsageStats(subscription.userId);

  // Send invoice email
  if (subscription.user?.email) {
    try {
      await sendSubscriptionInvoiceEmail({
        userEmail: subscription.user.email,
        userName: subscription.user.name,
        subscriptionTier: subscription.tier,
        amount: getTierPrice(subscription.tier),
        currency: 'USD',
        invoiceNumber: `INV-${Date.now()}`,
        subscriptionPeriod: {
          start: currentPeriodStart,
          end: currentPeriodEnd
        }
      });
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
    }
  }

  console.log('Payment completion processed successfully', {
    subscriptionId,
    userId: subscription.userId,
    nextBillingDate: nextBillingDate.toISOString()
  });
}

/**
 * Handle subscription renewed event
 */
async function handleSubscriptionRenewed(resource: any) {
  const subscriptionId = resource.id;

  console.log('Handling subscription renewal webhook', { subscriptionId });

  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found for renewal', { subscriptionId });
    return;
  }

  // Get subscription details from PayPal
  const details = await getSubscriptionDetails(subscriptionId);

  // Calculate new billing period
  const currentPeriodStart = new Date();
  const currentPeriodEnd = details.billing_info?.next_billing_time
    ? new Date(details.billing_info.next_billing_time)
    : new Date(currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Update subscription period
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      currentPeriodStart,
      currentPeriodEnd,
      status: 'active',
      lastPaymentDate: new Date(),
      usageResetDate: currentPeriodEnd
    }
  });

  // Reset usage stats for the new billing period
  await resetUserUsageStats(subscription.userId);

  console.log('Subscription renewed successfully', {
    subscriptionId,
    userId: subscription.userId,
    newPeriodEnd: currentPeriodEnd.toISOString()
  });
}

/**
 * Reset a user's usage statistics
 */
async function resetUserUsageStats(userId: string): Promise<void> {
  console.log('Resetting usage stats', { userId });

  // Delete existing usage stats
  await prisma.usageStats.deleteMany({
    where: { userId }
  });

  // Create initial usage stats entries with zero counts
  const operations = [
    'convert', 'compress', 'merge', 'split', 'protect',
    'unlock', 'watermark', 'sign', 'rotate', 'repair',
    'edit', 'ocr', 'extract', 'chat'
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create initial usage entries
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

/**
 * Get price for a subscription tier
 */
function getTierPrice(tier: string): number {
  const prices: Record<string, number> = {
    'basic': 9.99,
    'pro': 19.99,
    'enterprise': 49.99,
    'free': 0
  };

  return prices[tier] || 0;
}

/**
 * Schedule jobs to run tasks at specific intervals
 */
export function scheduleSubscriptionJobs() {
  if (typeof global !== 'undefined') {
    // Check for expiring subscriptions daily
    const checkExpiringInterval = setInterval(async () => {
      await checkExpiringSubscriptions();
    }, 24 * 60 * 60 * 1000); // Once a day

    // Process expired subscriptions daily
    const processExpiredInterval = setInterval(async () => {
      await processExpiredSubscriptions();
    }, 24 * 60 * 60 * 1000); // Once a day

    // Reset usage stats hourly
    const resetUsageInterval = setInterval(async () => {
      await checkAndResetUsage();
    }, 60 * 60 * 1000); // Once an hour

    // Clean up in development environment
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      if (global._subscriptionJobIntervals) {
        // @ts-ignore
        global._subscriptionJobIntervals.forEach((interval: NodeJS.Timeout) => clearInterval(interval));
      }

      // @ts-ignore
      global._subscriptionJobIntervals = [
        checkExpiringInterval,
        processExpiredInterval,
        resetUsageInterval
      ];
    }
  }
}

/**
 * Check for subscriptions that are about to expire and send reminders
 */
export async function checkExpiringSubscriptions(): Promise<number> {
  try {
    console.log('Checking for expiring subscriptions...');

    // Find subscriptions that expire in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const today = new Date();

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gte: today,
          lte: sevenDaysFromNow
        }
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${expiringSubscriptions.length} subscriptions expiring soon`);

    // Send reminder emails
    let remindersSent = 0;
    for (const subscription of expiringSubscriptions) {
      if (subscription.user?.email) {
        try {
          await sendSubscriptionRenewalReminderEmail(
            subscription.user.email,
            subscription.user.name || '',
            subscription.tier,
            subscription.currentPeriodEnd!
          );
          remindersSent++;
        } catch (error) {
          console.error('Failed to send reminder email:', error);
        }
      }
    }

    console.log(`Sent ${remindersSent} reminder emails`);
    return remindersSent;
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
    return 0;
  }
}

/**
 * Process expired subscriptions
 */
export async function processExpiredSubscriptions(): Promise<number> {
  try {
    console.log('Processing expired subscriptions...');

    // Find expired subscriptions
    const today = new Date();

    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lt: today
        }
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    // Process each expired subscription
    let processedCount = 0;
    for (const subscription of expiredSubscriptions) {
      // Update subscription status
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'expired',
          tier: 'free'
        }
      });

      // Send notification email
      if (subscription.user?.email) {
        try {
          await sendSubscriptionExpiredEmail(
            subscription.user.email,
            subscription.user.name || '',
            subscription.tier
          );
        } catch (error) {
          console.error('Failed to send expiration email:', error);
        }
      }

      processedCount++;
    }

    console.log(`Processed ${processedCount} expired subscriptions`);
    return processedCount;
  } catch (error) {
    console.error('Error processing expired subscriptions:', error);
    return 0;
  }
}

/**
 * Check for subscriptions that need usage reset
 */
export async function checkAndResetUsage(): Promise<number> {
  try {
    console.log('Checking for subscriptions needing usage reset...');

    const now = new Date();

    // Find subscriptions due for usage reset
    const subscriptionsToReset = await prisma.subscription.findMany({
      where: {
        usageResetDate: {
          lt: now
        }
      }
    });

    console.log(`Found ${subscriptionsToReset.length} subscriptions needing usage reset`);

    // Reset usage for each subscription
    let resetCount = 0;
    for (const subscription of subscriptionsToReset) {
      await resetUserUsageStats(subscription.userId);

      // Calculate next reset date (typically end of current period)
      let nextResetDate;
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
        nextResetDate = subscription.currentPeriodEnd;
      } else {
        // If period end is in the past or not set, set reset date to 30 days from now
        nextResetDate = new Date();
        nextResetDate.setDate(nextResetDate.getDate() + 30);
      }

      // Update the reset date
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          usageResetDate: nextResetDate
        }
      });

      resetCount++;
    }

    console.log(`Reset usage for ${resetCount} subscriptions`);
    return resetCount;
  } catch (error) {
    console.error('Error checking and resetting usage:', error);
    return 0;
  }
}

// Start the scheduled jobs
scheduleSubscriptionJobs();