// components/dashboard/subscription-info.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCardIcon, CheckIcon, XIcon } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";

interface SubscriptionInfoProps {
  user: any;
}



export function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  const { t } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  // Pricing tiers
const pricingTiers = [
  {
    name: t('pricing.planDescriptions.free'),
    price: "$0",
    features: [
      t('pricing.features.amount.free'),
      t('pricing.features.rateLimit.free'),
      t('pricing.features.apiKeys.free'),
      t('pricing.features.fileSize.free'),
      t('pricing.features.support.free')
    ],
    limitations: [
      t('pricing.features.watermarking'),
      t('pricing.features.advancedProtection'),
      t('pricing.features.bulkProcessing')
    ]
  },
  {
    name: t('pricing.planDescriptions.basic'),
    price: "$9.99",
    features: [
      t('pricing.features.amount.basic'),
      t('pricing.features.rateLimit.basic'),
      t('pricing.features.apiKeys.basic'),
      t('pricing.features.fileSize.basic'),
      t('pricing.features.support.free')
    ],
  },
  {
    name: t('pricing.planDescriptions.pro'),
    price: "$29.99",
    features: [
      t('pricing.features.amount.pro'),
      t('pricing.features.rateLimit.pro'),
      t('pricing.features.apiKeys.pro'),
      t('pricing.features.fileSize.pro'),
      t('pricing.features.ocr'),
      t('pricing.features.support.priority'),
      t('pricing.features.watermarking'),
      t('pricing.features.advancedProtection'),
      t('pricing.features.bulkProcessing')
    ],
    limitations: []
  },
  {
    name: t('pricing.planDescriptions.enterprise'),
    price: "$99.99",
    features: [
      t('pricing.features.amount.enterprise'),
      t('pricing.features.rateLimit.enterprise'),
      t('pricing.features.apiKeys.enterprise'),
      t('pricing.features.fileSize.enterprise'),
      t('pricing.features.support.dedicated'),
      t('pricing.features.whiteLabel'),
      t('pricing.features.serviceLevel')
    ],
    limitations: []
  }
];
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle subscription upgrade
  const handleUpgrade = async (tier: string) => {
    setLoading(true);
    
    try {
      // Call your subscription upgrade endpoint that integrates with RevenueCat
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      
      const data = await res.json();
      
      if (data.success && data.checkoutUrl) {
        // Redirect to RevenueCat checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to initiate upgrade");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upgrade subscription");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("Subscription cancelled successfully");
        // Refresh page after a short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };
  
  const currentTier = user?.subscription?.tier || "free";
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription</h2>
      
      {/* Current subscription info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription details and usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold capitalize">{currentTier} Plan</h3>
              <p className="text-muted-foreground">
                {user?.subscription?.status === "active" ? "Active" : "Inactive"}
              </p>
            </div>
            <Badge variant={
              currentTier === "enterprise" ? "default" :
              currentTier === "pro" ? "default" :
              currentTier === "basic" ? "outline" :
              "secondary"
            }>
              {currentTier === "free" ? "Free" : "Paid"}
            </Badge>
          </div>
          
          {currentTier !== "free" && user?.subscription?.currentPeriodEnd && (
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">
                Your subscription renews on {formatDate(user.subscription.currentPeriodEnd)}
              </p>
            </div>
          )}
        </CardContent>
        {currentTier !== "free" && (
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Pricing tiers */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.name.toLowerCase()}
            className={
              currentTier === tier.name.toLowerCase() 
                ? "border-primary ring-1 ring-primary" 
                : ""
            }
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{tier.price}</span> / month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {currentTier === tier.name.toLowerCase() ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={tier.name.toLowerCase() === "free" ? "outline" : "default"}
                  disabled={loading || (
                    currentTier !== "free" && 
                    ["basic", "pro", "enterprise"].indexOf(currentTier) >= 
                    ["basic", "pro", "enterprise"].indexOf(tier.name.toLowerCase())
                  )}
                  onClick={() => handleUpgrade(tier.name.toLowerCase())}
                >
                  {tier.name.toLowerCase() === "free" 
                    ? "Downgrade" 
                    : currentTier === "free" 
                      ? "Upgrade" 
                      : "Change Plan"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}