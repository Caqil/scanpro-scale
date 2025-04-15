// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

// Request password reset endpoint
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // We don't reveal if the email exists for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    // Generate a reset token
    const token = randomBytes(16).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token valid for 1 hour

    // Delete any existing tokens for this user first
    if (user.email) {
      await prisma.passwordResetToken.deleteMany({
        where: { email: user.email }
      });
    }

    // Create new token
    if (user.email) {
      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expires
        }
      });
    } else {
      // Handle the case where a user somehow doesn't have an email
      return NextResponse.json(
        { error: 'User account has no email address' },
        { status: 400 }
      );
    }

    // Send email with reset link
    const emailResult = await sendPasswordResetEmail(user.email, token);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json({
        success: false,
        message: 'Error sending password reset email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      }, { status: 500 });
    }

    // For development, return the token and preview URL
    const devDetails = process.env.NODE_ENV === 'development'
      ? {
        devToken: token,
        previewUrl: emailResult.messageUrl
      }
      : {};

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent',
      ...devDetails
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token }
    });

    const isValid = resetToken && resetToken.expires > new Date();

    return NextResponse.json({
      valid: isValid,
      email: isValid ? resetToken.email : null
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred verifying the token' },
      { status: 500 }
    );
  }
}