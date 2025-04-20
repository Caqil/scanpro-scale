// app/api/user/subscription/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { createSubscription } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get requested tier from request body
    const body = await request.json();
    const { tier } = body;
    
    if (!tier || !['basic', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }
    
    try {
      // Create subscription with PayPal
      const { subscriptionId, approvalUrl } = await createSubscription(session.user.id, tier);
      
      // Return approval URL for redirect
      return NextResponse.json({ 
        success: true, 
        subscriptionId, 
        approvalUrl 
      });
    } catch (paypalError) {
      console.error('PayPal API error:', paypalError);
      return NextResponse.json(
        { error: 'PayPal API error: ' + (paypalError instanceof Error ? paypalError.message : 'Unknown error') },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    
    return NextResponse.json(
      { error: 'Failed to create subscription: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}