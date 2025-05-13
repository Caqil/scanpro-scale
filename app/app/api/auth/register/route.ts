// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Set next month as free operations reset date
        const resetDate = new Date();
        resetDate.setDate(1); // First day of current month
        resetDate.setMonth(resetDate.getMonth() + 1); // First day of next month
        resetDate.setHours(0, 0, 0, 0);

        // Create user with pay-as-you-go defaults
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationToken,
                isEmailVerified: false,
                balance: 0, // Initialize with zero balance
                freeOperationsUsed: 0, // Initialize with zero operations used
                freeOperationsReset: resetDate // Set reset date to start of next month
            }
        });

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken, name);

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            // Continue with registration process even if email fails
            // The user can request a new verification email later
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                balance: user.balance,
                freeOperationsUsed: user.freeOperationsUsed,
                freeOperationsReset: user.freeOperationsReset
            },
            emailSent: emailResult.success
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
}