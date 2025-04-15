// components/dashboard/subscription-info.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCardIcon, CheckIcon, XIcon } from "lucide-react";

interface SubscriptionInfoProps {
  user: any;
}

// Pricing tiers
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    features: [
      "100 operations per month",
      "100 requests per hour",
      "1 API key",
      "Basic PDF operations"
    ],
    limitations: [
      "No watermarking",
      "Limited OCR",
      "No priority support"
    ]
  },
  {
    name: "Basic",
    price: "$9.99",
    features: [
      "1,000 operations per month",
      "1000 requests per hour",
      "3 API keys",
      "All PDF operations",
      "Basic OCR"
    ],
    limitations: [
      "No priority support"
    ]
  },
  {
    name: "Pro",
    price: "$29.99",
    features: [
      "10,000 operations per month",
      "2,000 requests per hour",
      "10 API keys",
      "Advanced OCR",
      "Priority support",
      "Custom watermarks"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    price: "$99.99",
    features: [
      "100,000 operations per month",
      "5,000 requests per hour",
      "50 API keys",
      "Dedicated support",
      "Custom integration help",
      "White-label options"
    ],
    limitations: []
  }
];

export function SubscriptionInfo({ user }: SubscriptionInfoProps) {
  const [loading, setLoading] = useState(false);
  
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
              
              {tier.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Limitations:</h4>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XIcon className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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