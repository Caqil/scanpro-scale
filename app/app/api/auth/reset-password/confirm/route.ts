// app/api/auth/reset-password/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        console.log('[Confirm] Processing password reset for token:', token ? token.substring(0, 5) + '...' : 'undefined');

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Validate password
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Find the reset token - first try exact match
        let resetToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        // If not found, try search by token value
        if (!resetToken) {
            console.log('[Confirm] Token not found by unique lookup, trying first match');
            resetToken = await prisma.passwordResetToken.findFirst({
                where: { token }
            });
        }

        // Check if token exists and is valid
        if (!resetToken) {
            console.log('[Confirm] No matching token found in database');
            return NextResponse.json(
                { error: 'Invalid token - no matching token found' },
                { status: 400 }
            );
        }

        if (resetToken.expires < new Date()) {
            console.log('[Confirm] Token expired:', resetToken.expires, 'Current time:', new Date());
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email }
        });

        if (!user) {
            console.log('[Confirm] User not found with email:', resetToken.email);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('[Confirm] Found user, updating password');

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Delete the used token
        try {
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id }
            });
            console.log('[Confirm] Reset token deleted successfully');
        } catch (deleteError) {
            console.error('[Confirm] Error deleting token, continuing anyway:', deleteError);
            // Continue the process even if token deletion fails
        }

        // Send confirmation email
        if (user.email) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Your ScanPro Password Has Been Reset',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Password Reset Successful</h2>
                            <p>Your ScanPro account password has been successfully reset.</p>
                            <p>If you did not request this change, please contact our support team immediately.</p>
                            <div style="margin: 30px 0;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/login" 
                                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                   Sign In
                                </a>
                            </div>
                            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
                            <p style="color: #6B7280; font-size: 14px;">ScanPro - PDF Tools</p>
                        </div>
                    `
                });
            } catch (emailError) {
                // Log but don't fail the request if confirmation email fails
                console.error('[Confirm] Error sending confirmation email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('[Confirm] Password update error:', error);
        return NextResponse.json(
            { error: 'An error occurred updating your password: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}