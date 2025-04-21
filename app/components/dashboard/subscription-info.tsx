// components/dashboard/subscription-info.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Subscription management page
export default function SubscriptionInfo() {
  const { t } = useLanguageStore();
  const router = useRouter();
  // Subscription pricing and features
  const SUBSCRIPTION_TIERS = {
    free: {
      price: "0",
      currency: "USD",
      features: [
        t("pricing.features.amount.free"), // "500 operations per month"
        t("pricing.features.fileSize.free"), // "Basic PDF tools" (assuming this maps to file size or basic tools)
        t("pricing.features.support.free"), // "Standard processing speed" (assuming basic support implies standard speed)
        t("pricing.features.apiKeys.free"), // "1 API key"
      ],
    },
    basic: {
      price: "9.99",
      currency: "USD",
      features: [
        t("pricing.features.amount.basic"), // "5,000 operations per month"
        t("pricing.features.fileSize.basic"), // "All PDF tools"
        t("pricing.features.bulkProcessing"), // "Faster processing speed" (assuming bulk processing implies faster speed)
        t("pricing.features.apiKeys.basic"), // "3 API keys"
        t("pricing.features.support.free"), // "Priority email support" (mapped to free support for consistency)
      ],
    },
    pro: {
      price: "29.99",
      currency: "USD",
      features: [
        t("pricing.features.amount.pro"), // "50,000 operations per month"
        t("pricing.features.fileSize.pro"), // "All PDF tools"
        t("pricing.features.bulkProcessing"), // "Maximum processing speed" (assuming bulk processing implies max speed)
        t("pricing.features.apiKeys.pro"), // "10 API keys"
        t("pricing.features.support.priority"), // "Priority support"
        t("pricing.features.ocr"), // "Advanced PDF editing" (assuming OCR relates to advanced editing)
      ],
    },
    enterprise: {
      price: "99.99",
      currency: "USD",
      features: [
        t("pricing.features.amount.enterprise"), // "100,000 operations per month"
        t("pricing.features.fileSize.enterprise"), // "All PDF tools"
        t("pricing.features.bulkProcessing"), // "Maximum processing speed"
        t("pricing.features.apiKeys.enterprise"), // "Unlimited API keys"
        t("pricing.features.support.dedicated"), // "Dedicated support"
        t("pricing.features.ocr"), // "Custom PDF solutions" (assuming OCR relates to custom solutions)
      ],
    },
  };
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
  const [error, setError] = useState<string | null>(null);

  // Load subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Make sure to use the correct API endpoint
        const response = await fetch("/api/user/profile");

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response status:", response.status, errorText);
          throw new Error(
            `Failed to fetch subscription data: ${response.status}`
          );
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
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
        setError(error instanceof Error ? error.message : "Unknown error");
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Handle subscription upgrade
  const handleUpgrade = async (tier: string) => {
    try {
      setUpgradeTarget(tier);
      setError(null);

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Subscription creation failed:",
          response.status,
          errorText
        );
        throw new Error("Failed to create subscription");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Invalid response format");
      }

      const data = await response.json();

      // Redirect to PayPal approval URL
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No approval URL returned");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
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
      setError(null);

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cancellation failed:", response.status, errorText);
        throw new Error("Failed to cancel subscription");
      }

      toast.success(
        t("subscription.subscriptionCanceled") ||
          "Subscription canceled successfully"
      );

      // Refresh the subscription data
      router.refresh();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Error Loading Subscription</CardTitle>
          <CardDescription>
            We encountered a problem loading your subscription information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">
        {t("dashboard.subscription") || "Subscription Management"}
      </h1>

      {/* Current Subscription Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {t("subscription.currentPlan") || "Current Plan"}
          </CardTitle>
          <CardDescription>
            {t(`subscription.${subscription.tier}`) ||
              `You are currently on the ${subscription.tier} tier.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subscription status */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{"Status"}</span>
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
                    ? t("dashboard.active") || "Active"
                    : subscription.status === "canceled"
                    ? t("dashboard.inactive") || "Canceled"
                    : subscription.status === "expired"
                    ? t("dashboard.inactive") || "Expired"
                    : t("dashboard.inactive") || "Pending"}
                </span>
              </div>

              {subscription.currentPeriodEnd &&
                subscription.status === "active" && (
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.renewsOn") ||
                      `Renews on ${new Date(
                        subscription.currentPeriodEnd
                      ).toLocaleDateString()}`}
                  </p>
                )}

              {subscription.currentPeriodEnd &&
                subscription.status === "canceled" && (
                  <p className="text-sm text-muted-foreground">
                    {t("subscription.expiresOn") ||
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
                  {t("dashboard.totalUsage") || "Monthly Usage"}
                </span>
                <span>
                  {subscription.operations} / {subscription.limit}{" "}
                  {t("dashboard.operations") || "operations"}
                </span>
              </div>
              <Progress value={subscription.usagePercent} className="h-2" />
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {subscription.usagePercent}%{" "}
                {t("dashboard.percentageOfTotal") || "used"}
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
              {t("subscription.cancelSubscription") || "Cancel Plan"}
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
        {t("subscription.changePlan") || "Available Plans"}
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => {
          const capitalizedTier = tier.charAt(0).toUpperCase() + tier.slice(1);
          return (
            <Card
              key={tier}
              className={`${
                subscription.tier === tier ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{capitalizedTier}</span>
                  {subscription.tier === tier && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {t("subscription.currentPlan") || "Current"}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-2xl font-bold">
                  ${details.price}
                  <span className="text-sm font-normal">
                    /{t("subscription.monthly") || "month"}
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
                      t(`subscription.upgrade`) ||
                      `Upgrade to ${capitalizedTier}`
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" disabled variant="outline">
                    {t("subscription.currentPlan") || "Current Plan"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
