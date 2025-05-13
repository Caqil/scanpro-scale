// app/api/user/deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { amount } = await request.json();
    
    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      );
    }

    // Minimum deposit amount
    if (depositAmount < 5) {
      return NextResponse.json(
        { error: 'Minimum deposit amount is $5.00' },
        { status: 400 }
      );
    }

    // Get user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create PayPal order for deposit
    try {
      const { orderId, approvalUrl } = await createPayPalOrder(
        user.id, 
        depositAmount,
        `Balance Deposit for ${user.name || user.email || 'User'}`
      );

      // Create a pending transaction record
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: depositAmount,
          balanceAfter: 0, // Will be updated when completed
          description: 'Deposit - pending',
          paymentId: orderId,
          status: 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: approvalUrl,
        orderId,
        message: 'Please complete the payment process on PayPal',
      });
    } catch (paypalError) {
      console.error('PayPal error:', paypalError);
      return NextResponse.json(
        { error: 'Failed to create payment', details: paypalError instanceof Error ? paypalError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit request' },
      { status: 500 }
    );
  }
}