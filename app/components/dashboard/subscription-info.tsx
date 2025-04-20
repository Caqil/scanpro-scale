// app/[lang]/dashboard/subscription/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguageStore } from "@/src/store/store";
import { USAGE_LIMITS } from "@/lib/validate-key";

// Subscription pricing and features
const SUBSCRIPTION_TIERS = {
  free: {
    price: "0",
    currency: "USD",
    features: [
      "500 operations per month",
      "Basic PDF tools",
      "Standard processing speed",
      "1 API key",
    ],
  },
  basic: {
    price: "9.99",
    currency: "USD",
    features: [
      "5,000 operations per month",
      "All PDF tools",
      "Faster processing speed",
      "3 API keys",
      "Priority email support",
    ],
  },
  pro: {
    price: "19.99",
    currency: "USD",
    features: [
      "50,000 operations per month",
      "All PDF tools",
      "Maximum processing speed",
      "10 API keys",
      "Priority support",
      "Advanced PDF editing",
    ],
  },
  enterprise: {
    price: "49.99",
    currency: "USD",
    features: [
      "100,000 operations per month",
      "All PDF tools",
      "Maximum processing speed",
      "Unlimited API keys",
      "Dedicated support",
      "Custom PDF solutions",
    ],
  },
};

// Subscription management page
export default function SubscriptionInfo() {
  const { t } = useLanguageStore();
  const router = useRouter();

  // Subscription state
  const [subscription, setSubscription] = useState<{
    tier: string;
    status: string;
    currentPeriodEnd?: string;
    usagePercent: number;
    operations: number;
    limit: number;
  }>({
    tier: "free",
    status: "active",
    usagePercent: 0,
    operations: 0,
    limit: USAGE_LIMITS.free,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);

  // Load subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          console.error(
            "Response status:",
            response.status,
            await response.text()
          );
          throw new Error("Failed to fetch subscription data");
        }
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          console.error("Non-JSON response:", await response.text());
          throw new Error("Invalid response format");
        }
        const data = await response.json();
        const tier = data.tier || "free";
        const limit =
          USAGE_LIMITS[tier as keyof typeof USAGE_LIMITS] || USAGE_LIMITS.free;
        const usagePercent = Math.min(
          100,
          Math.round((data.operations / limit) * 100)
        );
        setSubscription({
          tier,
          status: data.status || "active",
          currentPeriodEnd: data.currentPeriodEnd,
          usagePercent,
          operations: data.operations || 0,
          limit,
        });
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Handle subscription upgrade
  const handleUpgrade = async (tier: string) => {
    setUpgradeTarget(tier);

    try {
      const response = await fetch("/api/user/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      const data = await response.json();

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL returned");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to upgrade subscription");
      setUpgradeTarget(null);
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    if (
      !confirm(
        t("subscription.confirmCancel") ||
          "Are you sure you want to cancel your subscription?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/user/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to cancel subscription");

      toast.success(
        t("subscription.cancelSuccess") || "Subscription canceled successfully"
      );

      // Refresh the subscription data
      router.refresh();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">
        {t("subscription.title") || "Subscription Management"}
      </h1>

      {/* Current Subscription Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {t("subscription.currentPlan") || "Current Plan"}
          </CardTitle>
          <CardDescription>
            {t("subscription.currentTier", { tier: subscription.tier }) ||
              `You are currently on the ${subscription.tier} tier.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subscription status */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {t("subscription.status") || "Status"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    subscription.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : subscription.status === "canceled"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {subscription.status === "active"
                    ? t("subscription.statusActive") || "Active"
                    : subscription.status === "canceled"
                    ? t("subscription.statusCanceled") || "Canceled"
                    : subscription.status === "expired"
                    ? t("subscription.statusExpired") || "Expired"
                    : t("subscription.statusPending") || "Pending"}
                </span>
              </div>

              {subscription.currentPeriodEnd &&
                subscription.status === "active" && (
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.renewsOn", {
                      date: new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString(),
                    }) ||
                      `Renews on ${new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}`}
                  </p>
                )}

              {subscription.currentPeriodEnd &&
                subscription.status === "canceled" && (
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.expiresOn", {
                      date: new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString(),
                    }) ||
                      `Access ends on ${new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}`}
                  </p>
                )}
            </div>

            {/* Usage info */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">
                  {t("subscription.monthlyUsage") || "Monthly Usage"}
                </span>
                <span>
                  {subscription.operations} / {subscription.limit}{" "}
                  {t("subscription.operations") || "operations"}
                </span>
              </div>
              <Progress value={subscription.usagePercent} className="h-2" />
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {subscription.usagePercent}% {t("subscription.used") || "used"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {subscription.status === "active" && subscription.tier !== "free" && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t("subscription.cancelPlan") || "Cancel Plan"}
            </Button>
          )}
          {(subscription.status === "canceled" ||
            subscription.status === "expired") &&
            subscription.tier !== "free" && (
              <Button
                onClick={() => handleUpgrade(subscription.tier)}
                disabled={isLoading}
              >
                {t("subscription.reactivate") || "Reactivate Subscription"}
              </Button>
            )}
        </CardFooter>
      </Card>

      {/* Subscription Plans */}
      <h2 className="text-2xl font-bold mb-6">
        {t("subscription.availablePlans") || "Available Plans"}
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => (
          <Card
            key={tier}
            className={`${subscription.tier === tier ? "border-primary" : ""}`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                {subscription.tier === tier && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {t("subscription.current") || "Current"}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                ${details.price}
                <span className="text-sm font-normal">
                  /{t("subscription.month") || "month"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {subscription.tier !== tier ? (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(tier)}
                  disabled={
                    isLoading || upgradeTarget === tier || tier === "free"
                  }
                >
                  {upgradeTarget === tier ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("subscription.processing") || "Processing..."}
                    </span>
                  ) : tier === "free" ? (
                    t("subscription.currentPlan") || "Current Plan"
                  ) : (
                    t("subscription.upgradeTo", {
                      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
                    }) ||
                    `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`
                  )}
                </Button>
              ) : (
                <Button className="w-full" disabled variant="outline">
                  {t("subscription.currentPlan") || "Current Plan"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
