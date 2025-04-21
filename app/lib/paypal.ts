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
      throw new Error('PayPal credentials are not configured');
    }

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
      console.error('PayPal token error:', errorData);
      throw new Error(`Failed to get PayPal access token: ${response.status} - ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
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
      throw new Error(`No PayPal plan ID configured for tier: ${tier}`);
    }

    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    // Add locale prefix (e.g., 'en'); adjust based on your default locale
    const returnUrl = `${appUrl}/en/dashboard/subscription/success`;
    const cancelUrl = `${appUrl}/en/dashboard/subscription/cancel`;

    console.log(`Creating PayPal subscription for user ${userId} with plan ${planId}`);
    console.log(`App URL: ${appUrl}, Return URL: ${returnUrl}, Cancel URL: ${cancelUrl}`);

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
      console.error("PayPal API error response:", errorData);
      throw new Error(`PayPal API error: ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("PayPal subscription created:", data.id);

    const approvalUrl = data.links.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

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
    console.error("Error creating PayPal subscription:", error);
    throw new Error(`Error creating subscription: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}


// Handle webhook events
export async function handlePayPalWebhook(event: any): Promise<{ success: boolean; message: string }> {
  try {
    // Extract event type and resource data
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`Processing PayPal webhook event: ${eventType}`);

    // Handle different PayPal events
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
      default:
        console.log(`Unhandled PayPal event type: ${eventType}`);
    }

    return { success: true, message: `Successfully processed ${eventType}` };
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get subscription details from PayPal
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get subscription details from PayPal
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

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw new Error(`PayPal subscription details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cancel a PayPal subscription
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    console.log(`Cancelling PayPal subscription: ${subscriptionId}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Cancel subscription in PayPal
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

      console.error('PayPal cancellation error:', errorData);
      throw new Error(`Failed to cancel subscription: ${errorData.message || response.statusText}`);
    }

    console.log(`PayPal subscription ${subscriptionId} cancelled successfully`);
    return;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(`PayPal subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update user subscription in our database
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
    console.log(`Updating subscription for user ${userId}:`, data);

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (existingSubscription) {
      // Update existing subscription
      return await prisma.subscription.update({
        where: { userId },
        data
      });
    } else {
      // Create new subscription
      return await prisma.subscription.create({
        data: {
          userId,
          ...data
        }
      });
    }
  } catch (error) {
    console.error('Error updating user subscription in database:', error);
    throw new Error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSubscriptionCreated(resource: any) {
  const subscriptionId = resource.id;
  const planId = resource.plan_id;

  // Find tier from plan ID
  const tier = Object.keys(PAYPAL_PLAN_IDS).find(
    key => PAYPAL_PLAN_IDS[key as keyof typeof PAYPAL_PLAN_IDS] === planId
  ) || 'basic';

  // Find user from custom_id set during subscription creation
  const userId = resource.custom_id;

  if (!userId) {
    console.error('No user ID found in subscription created event');
    return;
  }

  // Update user subscription in database
  await updateUserSubscription(userId, {
    tier,
    status: 'pending', // Will be updated to 'active' on first payment
    paypalSubscriptionId: subscriptionId,
    paypalPlanId: planId,
    currentPeriodStart: new Date(),
    // Next billing date will be set when payment is completed
  });
}

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id;

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    include: { user: true }
  });

  if (!subscription) {
    console.error(`No subscription found for PayPal ID: ${subscriptionId}`);
    return;
  }

  // Update status to active
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      usageResetDate: new Date(),
    }
  });
}

async function handleSubscriptionUpdated(resource: any) {
  const subscriptionId = resource.id;
  const status = resource.status.toLowerCase();

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error(`No subscription found for PayPal ID: ${subscriptionId}`);
    return;
  }

  // Update subscription data
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: status === 'active' ? 'active' :
        status === 'cancelled' ? 'canceled' :
          status === 'suspended' ? 'suspended' : subscription.status,
      // Update other fields as needed
    }
  });
}

async function handleSubscriptionCanceled(resource: any) {
  const subscriptionId = resource.id;

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error(`No subscription found for PayPal ID: ${subscriptionId}`);
    return;
  }

  // Update subscription as canceled
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
      // Let the user continue using the subscription until the end of their billing period
    }
  });
}

async function handlePaymentFailed(resource: any) {
  const subscriptionId = resource.id;

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error(`No subscription found for PayPal ID: ${subscriptionId}`);
    return;
  }

  // Increment failed payment count
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      failedPaymentCount: { increment: 1 },
      // After too many failed payments, PayPal will trigger a cancellation event
    }
  });
}

async function handlePaymentCompleted(resource: any) {
  // Extract billing agreement ID (subscription ID)
  const subscriptionId = resource.billing_agreement_id;

  if (!subscriptionId) {
    console.error('No subscription ID found in payment completed event');
    return;
  }

  // Find subscription in our database
  const subscription = await prisma.subscription.findFirst({
    where: { paypalSubscriptionId: subscriptionId }
  });

  if (!subscription) {
    console.error(`No subscription found for PayPal ID: ${subscriptionId}`);
    return;
  }

  // Get subscription details to calculate next billing date
  const details = await getSubscriptionDetails(subscriptionId);

  // Update subscription with new billing period
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      lastPaymentDate: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(details.billing_info.next_billing_time || getDefaultBillingEndDate()),
      nextBillingDate: new Date(details.billing_info.next_billing_time || getDefaultBillingEndDate()),
      failedPaymentCount: 0, // Reset failed payment count
      usageResetDate: new Date(), // Reset usage stats
    }
  });

  // Reset usage stats for the user
  await resetUserUsageStats(subscription.userId);
}

// Helper function to get default billing end date (1 month from now)
function getDefaultBillingEndDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}

// Reset user usage stats
async function resetUserUsageStats(userId: string): Promise<void> {
  // Delete all usage stats for this user
  await prisma.usageStats.deleteMany({
    where: { userId }
  });

  // Create initial zero counts for all operations
  const operations = ['convert', 'compress', 'merge', 'split', 'protect', 'unlock', 'watermark', 'extract', 'edit', 'sign', 'repair', 'rotate'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create zero counts for all operations
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
}