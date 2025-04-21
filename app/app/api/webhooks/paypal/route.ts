// app/api/webhooks/paypal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handlePayPalWebhook } from '@/lib/paypal';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('Received PayPal webhook');
    
    // Get webhook ID from PayPal
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('PayPal webhook ID not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    
    // Get the raw request body
    const rawBody = await request.text();
    
    // Get PayPal signature header
    const paypalSignature = request.headers.get('paypal-transmission-sig');
    const paypalCertUrl = request.headers.get('paypal-cert-url');
    const paypalTransmissionId = request.headers.get('paypal-transmission-id');
    const paypalTransmissionTime = request.headers.get('paypal-transmission-time');
    
    // In production, you should verify the signature here
    // For simplicity in this example, we're skipping detailed verification
    
    // Parse webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log('Webhook event:', {
        eventType: payload.event_type,
        resourceType: payload.resource_type,
        resourceId: payload.resource?.id
      });
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError);
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }
    
    // Process the webhook
    const result = await handlePayPalWebhook(payload);
    
    // Return success response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}