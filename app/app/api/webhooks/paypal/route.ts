// app/api/webhooks/paypal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { handlePayPalWebhook } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    console.log('Received PayPal webhook');
    
    // Verify PayPal webhook authenticity
    // In production, you should verify webhook authenticity using PayPal's API
    // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
    
    let payload;
    try {
      // Parse webhook payload
      payload = await request.json();
      console.log('Webhook payload received:', JSON.stringify(payload).substring(0, 200) + '...');
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError);
      const rawText = await request.text();
      console.error('Raw payload:', rawText.substring(0, 200) + '...');
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