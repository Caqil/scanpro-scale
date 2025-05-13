// app/api/user/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint for creating a user deposit in the pay-as-you-go model
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get amount from request body
    const body = await request.json();
    const { amount } = body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount. Please provide a positive number.' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a deposit transaction (we'll handle the actual payment process separately)
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amount,
        balanceAfter: (user.balance || 0) + amount,
        description: 'Deposit - pending',
        status: 'pending'
      }
    });
    
    // Return transaction details
    return NextResponse.json({ 
      success: true,
      transactionId: transaction.id,
      amount: amount,
      message: 'Deposit transaction created. Please complete the payment process.' 
    });
    
  } catch (error) {
    console.error('Error creating user deposit:', error);
    
    return NextResponse.json(
      { error: 'Failed to create deposit: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}