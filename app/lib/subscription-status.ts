// lib/subscription-status.ts
import { prisma } from '@/lib/prisma';

// Define types for more explicit typing
interface SubscriptionResetOptions {
    // Force reset even if no specific trigger found
    force?: boolean;

    // Specify specific statuses to reset from
    fromStatuses?: string[];

    // Default tier if not specified
    defaultTier?: string;
}

/**
 * Reset subscription status for users with problematic subscriptions
 * 
 * This function helps clean up subscription states that might be stuck or inconsistent
 */
export async function resetSubscriptionStatus(options: SubscriptionResetOptions = {}) {
    const {
        force = false,
        fromStatuses = ['pending', 'canceled', 'suspended'],
        defaultTier = 'free'
    } = options;

    try {
        // Find subscriptions matching reset criteria
        const problematicSubscriptions = await prisma.subscription.findMany({
            where: {
                OR: [
                    // Specific statuses to reset
                    { status: { in: fromStatuses } },

                    // Optional force reset condition
                    ...(force ? [{}] : [])
                ],

            },
            include: {
                user: true
            }
        });

        console.log(`Found ${problematicSubscriptions.length} subscriptions to reset`);

        // Track reset results
        const resetResults = {
            total: problematicSubscriptions.length,
            resetSuccessful: 0,
            errors: [] as string[]
        };

        // Process each problematic subscription
        for (const subscription of problematicSubscriptions) {
            try {
                // Reset subscription to free tier
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'active', // Ensure active status
                        tier: defaultTier, // Downgrade to free tier
                        currentPeriodStart: new Date(), // Reset period start
                        currentPeriodEnd: new Date(
                            new Date().setDate(new Date().getDate() + 30) // Set default 30-day period
                        ),
                        paypalSubscriptionId: null, // Clear payment provider ID
                        canceledAt: null // Clear any cancellation timestamp
                    }
                });

                // Optional: Send notification to user about subscription reset
                // This would require an email sending utility

                resetResults.resetSuccessful++;
            } catch (updateError) {
                console.error(`Error resetting subscription for user ${subscription.user.email}:`, updateError);
                resetResults.errors.push(
                    `Failed to reset subscription for user ${subscription.user.email}: ${updateError instanceof Error ? updateError.message : String(updateError)
                    }`
                );
            }
        }

        // Log final results
        console.log('Subscription Reset Results:', resetResults);

        return resetResults;
    } catch (error) {
        console.error('Error in resetSubscriptionStatus:', error);
        throw error; // Rethrow to allow caller to handle
    }
}

// Utility to get user's current effective subscription tier
export async function getCurrentUserTier(userId: string) {
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: {
            tier: true,
            status: true,
            currentPeriodEnd: true
        }
    });

    // Default to free if no subscription or expired
    if (!subscription ||
        subscription.status !== 'active' ||
        (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date())) {
        return 'free';
    }

    return subscription.tier;
}

// Optional: Background job to periodically reset subscriptions
export async function periodicSubscriptionCleanup() {
    try {
        await resetSubscriptionStatus({
            force: true, // Aggressive cleanup
            fromStatuses: ['pending', 'canceled', 'suspended', 'expired']
        });
    } catch (error) {
        console.error('Periodic subscription cleanup failed:', error);
    }
}