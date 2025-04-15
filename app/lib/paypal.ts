// lib/paypal.ts
import { prisma } from '@/lib/prisma';

// Define plan IDs for different subscription tiers
export const PAYPAL_PLAN_IDS: Record<string, string> = {
  basic: process.env.PAYPAL_PLAN_BASIC || '',
  pro: process.env.PAYPAL_PLAN_PRO || '',
  enterprise: process.env.PAYPAL_PLAN_ENTERPRISE || '',
};

// Set up PayPal API base URLs
const PAYPAL_API_BASE = 'https://api-m.paypal.com';

// Get PayPal OAuth token
async function getPayPalAccessToken(): Promise<string> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    console.log('Client ID:', clientId ? 'Set' : 'Missing');
    console.log('Client Secret:', clientSecret ? 'Set' : 'Missing');

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials are not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('Auth Header:', `Basic ${auth}`);

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Response Status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error Data:', errorData);
      throw new Error(`Failed to get PayPal access token: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error(`PayPal authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create a PayPal subscription
export async function createSubscription(userId: string, tier: string): Promise<{ subscriptionId: string; approvalUrl: string }> {
  try {
    // Get the appropriate plan ID based on the tier
    const planId = PAYPAL_PLAN_IDS[tier];

    if (!planId) {
      throw new Error(`No PayPal plan ID configured for tier: ${tier}. Please set PAYPAL_PLAN_${tier.toUpperCase()} environment variable.`);
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create subscription in PayPal
    // Using the simplified format that PayPal requires
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `sub_${Date.now()}_${userId.substring(0, 8)}`
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "ScanPro",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/subscription/cancel`
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal API error response:', data);
      throw new Error(`PayPal API error: ${data.message || JSON.stringify(data)}`);
    }

    // Find approval URL
    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    return {
      subscriptionId: data.id,
      approvalUrl,
    };
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw new Error(`Error creating subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const errorData = await response.json();
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
      const errorData = await response.json();
      throw new Error(`Failed to cancel subscription: ${errorData.message || response.statusText}`);
    }

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
    canceledAt?: Date | null;
  }
): Promise<any> {
  try {
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