import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {	authOptions } from '@/lib/auth';
import { verifyPayPalOrder } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('POST /api/user/deposit/verify called at', new Date().toISOString());

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized request: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { orderId } = body;

    if (!orderId) {
      console.log('Missing orderId in request body');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentId: orderId,
        userId: session.user.id,
        status: 'pending',
      },
    });

    if (!transaction) {
      console.log('Transaction not found:', { orderId, userId: session.user.id });
      return NextResponse.json(
        { success: false, message: 'Transaction not found or not in pending status' },
        { status: 404 }
      );
    }

    const { verified, amount, error } = await verifyPayPalOrder(orderId);
    console.log('PayPal verification result:', { verified, amount, error });

    if (!verified) {
      return NextResponse.json(
        { success: false, message: error || 'Order not confirmed by PayPal' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    if (!user) {
      console.log('User not found:', session.user.id);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit completed successfully',
      amount,
      newBalance: user.balance || 0,
    });
  } catch (error) {
    console.error('Error processing deposit verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify deposit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}