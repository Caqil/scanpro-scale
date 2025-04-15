// app/api/webhooks/paypal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Verify PayPal webhook signature
function verifyWebhookSignature(
    rawBody: Buffer,
    signatureHeader: string | null,
    webhookId: string
): boolean {
    if (!signatureHeader) return false;

    try {
        // Create a hash using the secret and the raw request body
        const expectedSignature = crypto
            .createHmac('sha256', process.env.PAYPAL_WEBHOOK_SECRET || '')
            .update(rawBody)
            .digest('base64');

        // Compare the computed signature with the one in the header
        return expectedSignature === signatureHeader;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}
export async function POST(request: NextRequest) {
    try {
        // Get raw body buffer
        const rawBody = await request.clone().arrayBuffer();
        const bodyBuffer = Buffer.from(rawBody);

        // Verify webhook signature
        const signatureHeader = request.headers.get('paypal-transmission-sig');
        const isValidSignature = verifyWebhookSignature(
            bodyBuffer,
            signatureHeader,
            process.env.PAYPAL_WEBHOOK_ID || ''
        );

        if (!isValidSignature) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Parse webhook payload
        const payload = await request.json();
        console.log('PayPal Webhook Payload:', JSON.stringify(payload, null, 2));

        // Extract key event details
        const { event_type, resource } = payload;

        // Store webhook event in database for tracking
        await prisma.paymentWebhookEvent.create({
            data: {
                eventId: payload.id,
                eventType: event_type,
                resourceType: payload.resource_type || 'subscription',
                resourceId: resource.id,
                rawData: JSON.stringify(payload),
                status: 'processed'
            }
        });

        // Handle different subscription events
        switch (event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                // Update subscription when payment is successful
                await handlePaymentCompleted(resource);
                break;

            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                await handleSubscriptionActivated(resource);
                break;

            case 'BILLING.SUBSCRIPTION.CANCELLED':
                await handleSubscriptionCancelled(resource);
                break;

            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                await handleSubscriptionSuspended(resource);
                break;

            case 'BILLING.SUBSCRIPTION.EXPIRED':
                await handleSubscriptionExpired(resource);
                break;

            default:
                console.log(`Unhandled event type: ${event_type}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('PayPal Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Handle successful payment
async function handlePaymentCompleted(resource: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { paypalSubscriptionId: resource.billing_agreement_id },
            data: {
                status: 'active',
                currentPeriodEnd: new Date(resource.create_time),
                currentPeriodStart: new Date(resource.create_time)
            }
        });

        console.log('Payment completed for subscription:', subscription.id);
    } catch (error) {
        console.error('Error handling payment completion:', error);
    }
}

// Handle subscription activation
async function handleSubscriptionActivated(resource: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { paypalSubscriptionId: resource.id },
            data: {
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
        });

        console.log('Subscription activated:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription activation:', error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(resource: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { paypalSubscriptionId: resource.id },
            data: {
                status: 'cancelled',
                canceledAt: new Date()
            }
        });

        console.log('Subscription cancelled:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

// Handle subscription suspension
async function handleSubscriptionSuspended(resource: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { paypalSubscriptionId: resource.id },
            data: {
                status: 'suspended'
            }
        });

        console.log('Subscription suspended:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription suspension:', error);
    }
}

// Handle subscription expiration
async function handleSubscriptionExpired(resource: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { paypalSubscriptionId: resource.id },
            data: {
                status: 'expired',
                currentPeriodEnd: new Date()
            }
        });

        console.log('Subscription expired:', subscription.id);
    } catch (error) {
        console.error('Error handling subscription expiration:', error);
    }
}

// Implement OPTIONS method for webhook verification
export async function OPTIONS() {
    return NextResponse.json({ status: 'ok' }, {
        status: 200,
        headers: {
            'Allow': 'POST, OPTIONS'
        }
    });
}