// lib/paypal.ts
import { prisma } from '@/lib/prisma';

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
 * Create a new PayPal order for balance deposit
 */
export async function createPayPalOrder(
  userId: string, 
  amount: number,
  description: string = 'Balance Deposit'
): Promise<{ 
  orderId: string; 
  approvalUrl: string;
}> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    console.log('Creating PayPal order', { userId, amount });
    const accessToken = await getPayPalAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/en/dashboard/success`;
    const cancelUrl = `${appUrl}/en/dashboard/cancel`;

    // Format amount to 2 decimal places
    const formattedAmount = amount.toFixed(2);

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order_${Date.now()}_${userId.substring(0, 8)}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: userId,
            description: description,
            amount: {
              currency_code: 'USD',
              value: formattedAmount
            }
          }
        ],
        application_context: {
          brand_name: 'MegaPDF',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
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
    console.log('PayPal order created', { orderId: data.id });

    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    return {
      orderId: data.id,
      approvalUrl
    };
  } catch (error) {
    console.error('Failed to create PayPal order:', error);
    throw new Error(`Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and capture a PayPal order after approval
 */
export async function verifyPayPalOrder(orderId: string): Promise<{
  verified: boolean;
  amount: number;
  error?: string;
}> {
  try {
    console.log('Verifying PayPal order', { orderId });
    const accessToken = await getPayPalAccessToken();

    // First, get order details to verify it exists and is approved
    const detailsResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!detailsResponse.ok) {
      const errorData = await detailsResponse.json().catch(() => ({}));
      throw new Error(`Failed to get order details: ${errorData.message || detailsResponse.statusText}`);
    }

    const orderDetails = await detailsResponse.json();
    
    if (orderDetails.status !== 'APPROVED') {
      return {
        verified: false,
        amount: 0,
        error: `Order is not approved (status: ${orderDetails.status})`
      };
    }

    // Capture the payment to complete it
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json().catch(() => ({}));
      throw new Error(`Failed to capture payment: ${errorData.message || captureResponse.statusText}`);
    }

    const captureData = await captureResponse.json();
    
    if (captureData.status !== 'COMPLETED') {
      return {
        verified: false,
        amount: 0,
        error: `Capture failed (status: ${captureData.status})`
      };
    }

    // Extract amount from the completed order
    const amount = parseFloat(captureData.purchase_units[0]?.payments?.captures?.[0]?.amount?.value || '0');

    // Find the pending transaction
    const pendingTransaction = await prisma.transaction.findFirst({
      where: {
        paymentId: orderId,
        status: 'pending'
      },
      select: {
        id: true,
        userId: true,
        amount: true
      }
    });

    if (!pendingTransaction) {
      return {
        verified: true,
        amount,
        error: 'Pending transaction not found'
      };
    }

    // Get user's current balance
    const user = await prisma.user.findUnique({
      where: { id: pendingTransaction.userId },
      select: { balance: true }
    });

    if (!user) {
      return {
        verified: true,
        amount,
        error: 'User not found'
      };
    }

    // Calculate new balance
    const newBalance = (user.balance || 0) + amount;

    // Update user's balance
    await prisma.user.update({
      where: { id: pendingTransaction.userId },
      data: { balance: newBalance }
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: {
        status: 'completed',
        description: 'Deposit - completed',
        balanceAfter: newBalance
      }
    });

    return {
      verified: true,
      amount
    };
  } catch (error) {
    console.error('Error verifying PayPal order:', error);
    return {
      verified: false,
      amount: 0,
      error: `PayPal verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
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

    // Handle different event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentFailed(resource);
        break;
    }

    return { success: true, message: `Successfully processed ${eventType}` };
  } catch (error) {
    console.error('Failed to process PayPal webhook:', error);
    throw new Error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle payment completed event from webhook
 */
async function handlePaymentCompleted(resource: any) {
  const orderId = resource.supplementary_data?.related_ids?.order_id || 
                 resource.supplementary_data?.related_ids?.payment_id || 
                 resource.id;
  
  if (!orderId) {
    console.error('Missing order ID in payment completed event');
    return;
  }

  console.log('Handling payment completion webhook', { orderId });

  try {
    // Find the pending transaction
    const pendingTransaction = await prisma.transaction.findFirst({
      where: {
        paymentId: orderId,
        status: 'pending'
      },
      select: {
        id: true,
        userId: true,
        amount: true
      }
    });

    if (!pendingTransaction) {
      console.error('Pending transaction not found for webhook', { orderId });
      return;
    }

    // Get user's current balance
    const user = await prisma.user.findUnique({
      where: { id: pendingTransaction.userId },
      select: { balance: true }
    });

    if (!user) {
      console.error('User not found for transaction', { userId: pendingTransaction.userId });
      return;
    }

    // Calculate new balance
    const newBalance = (user.balance || 0) + pendingTransaction.amount;

    // Update user's balance
    await prisma.user.update({
      where: { id: pendingTransaction.userId },
      data: { balance: newBalance }
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: {
        status: 'completed',
        description: 'Deposit - completed (webhook)',
        balanceAfter: newBalance
      }
    });

    console.log('Payment completion processed via webhook', {
      userId: pendingTransaction.userId,
      amount: pendingTransaction.amount,
      newBalance
    });
  } catch (error) {
    console.error('Error processing payment completion webhook:', error);
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(resource: any) {
  const orderId = resource.supplementary_data?.related_ids?.order_id || 
                 resource.supplementary_data?.related_ids?.payment_id || 
                 resource.id;

  if (!orderId) {
    console.error('Missing order ID in payment failed event');
    return;
  }

  console.log('Handling payment failure webhook', { orderId });

  try {
    // Find the associated transaction and mark it as failed
    const transaction = await prisma.transaction.findFirst({
      where: { paymentId: orderId, status: 'pending' },
      select: { id: true }
    });

    if (!transaction) {
      console.error('Transaction not found for payment failure', { orderId });
      return;
    }

    // Update transaction status to failed
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'failed', description: 'Deposit - failed' }
    });

    console.log('Marked transaction as failed', { orderId, transactionId: transaction.id });
  } catch (error) {
    console.error('Error processing payment failure webhook:', error);
  }
}