// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Verify email token
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        // Find user with the verification token
        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid verification token' },
                { status: 400 }
            );
        }

        // Update user to mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null,
                emailVerified: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify email' },
            { status: 500 }
        );
    }
}

// Resend verification email
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                { error: 'Email is already verified' },
                { status: 400 }
            );
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Update user with new token
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken }
        });

        // Send verification email
        if (user.email) {
            const emailResult = await sendVerificationEmail(
                user.email,
                verificationToken,
                user.name || undefined
            );

            if (!emailResult.success) {
                return NextResponse.json(
                    { error: 'Failed to send verification email' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Verification email sent successfully'
            });
        } else {
            return NextResponse.json(
                { error: 'User has no email address' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error resending verification email:', error);
        return NextResponse.json(
            { error: 'Failed to resend verification email' },
            { status: 500 }
        );
    }
}