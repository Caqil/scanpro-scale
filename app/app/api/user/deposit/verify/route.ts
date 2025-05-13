// app/api/user/deposit/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { verifyPayPalOrder } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify the transaction belongs to this user
    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentId: orderId,
        userId: session.user.id,
        status: 'pending'
      }
    });

    if (!transaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found or not in pending status'
      }, { status: 404 });
    }

    try {
      // Verify order with PayPal
      const { verified, amount, error } = await verifyPayPalOrder(orderId);
      
      if (!verified) {
        return NextResponse.json({
          success: false,
          message: error || 'Order not confirmed by PayPal',
        });
      }

      // Get the user's updated balance
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Deposit completed successfully',
        amount,
        newBalance: user?.balance || 0
      });
    } catch (verifyError) {
      console.error('Error verifying payment:', verifyError);
      return NextResponse.json({
        success: false,
        message: 'Error verifying payment',
      });
    }
  } catch (error) {
    console.error('Error processing deposit verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify deposit' },
      { status: 500 }
    );
  }
}