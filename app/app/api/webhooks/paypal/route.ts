// app/api/webhooks/paypal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { handlePayPalWebhook } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    // Verify PayPal webhook signature (in production)
    // This would require implementing actual PayPal signature verification
    
    // Parse webhook payload
    const payload = await request.json();
    
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