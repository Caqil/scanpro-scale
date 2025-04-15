"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface SubscriptionInfo {
    tier: string;
    status: string;
    paypalSubscriptionId?: string | null;
    paypalPlanId?: string | null;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date | null;
}

// Define PayPal plan IDs for different subscription tiers
const PAYPAL_PLAN_IDS: Record<string, string> = {
    basic: process.env.NEXT_PUBLIC_PAYPAL_PLAN_BASIC || '',
    pro: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PRO || '',
    enterprise: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ENTERPRISE || '',
};

export function usePayPal() {
    const { data: session, status: sessionStatus } = useSession();
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch current subscription details
    const fetchSubscription = async () => {
        if (sessionStatus !== 'authenticated' || !session?.user?.id) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/subscription');

            if (!response.ok) {
                throw new Error('Failed to fetch subscription');
            }

            const data = await response.json();

            setSubscription(data.subscription || {
                tier: 'free',
                status: 'active'
            });
        } catch (err) {
            console.error('Error fetching subscription:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');

            // Set default subscription on error
            setSubscription({
                tier: 'free',
                status: 'active'
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch subscription when session changes
    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchSubscription();
        } else if (sessionStatus === 'unauthenticated') {
            setSubscription(null);
            setLoading(false);
        }
    }, [sessionStatus, session?.user?.id]);

    // Get plan ID from tier
    const getPlanId = (tier: string): string => {
        return PAYPAL_PLAN_IDS[tier] || '';
    };

    // Check if user has active subscription
    const hasActiveSubscription = (): boolean => {
        if (!subscription) return false;
        return subscription.status === 'active' && subscription.tier !== 'free';
    };

    // Check if user has pending subscription
    const hasPendingSubscription = (): boolean => {
        if (!subscription) return false;
        return subscription.status === 'pending';
    };

    // Determine if a user can subscribe to a specific tier
    const canSubscribe = (tier: string): boolean => {
        if (!subscription) return true;
        if (subscription.status === 'pending') return false;
        if (tier === 'free') return true;
        if (subscription.tier === tier) return false;
        return true;
    };

    return {
        subscription,
        loading,
        error,
        getPlanId,
        hasActiveSubscription,
        hasPendingSubscription,
        canSubscribe,
        refreshSubscription: fetchSubscription,
        PAYPAL_PLAN_IDS,
    };
}