"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export function PricingContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pricing = {
    basic: 9.99,
    pro: 29.99,
    enterprise: 99.99,
  };

  const planFeatures: PlanFeature[] = [
    {
      name: t("pricing.features.operations"),
      free: t("pricing.features.amount.free"),
      basic: t("pricing.features.amount.basic"),
      pro: t("pricing.features.amount.pro"),
      enterprise: t("pricing.features.amount.enterprise"),
    },
    {
      name: t("pricing.features.apiAccess"),
      free: t("pricing.features.apiKeys.free"),
      basic: t("pricing.features.apiKeys.basic"),
      pro: t("pricing.features.apiKeys.pro"),
      enterprise: t("pricing.features.apiKeys.enterprise"),
    },
    {
      name: t("pricing.features.fileSizes"),
      free: t("pricing.features.fileSize.pro"),
      basic: t("pricing.features.fileSize.pro"),
      pro: t("pricing.features.fileSize.pro"),
      enterprise: t("pricing.features.fileSize.pro"),
    },
    {
      name: t("pricing.features.ocr"),
      free: true,
      basic: true,
      pro: true,
      enterprise: true,
    },
    {
      name: t("pricing.features.bulkProcessing"),
      free: true,
      basic: true,
      pro: true,
      enterprise: true,
    },
    {
      name: t("pricing.features.supports"),
      free: t("pricing.features.support.free"),
      basic: t("pricing.features.support.free"),
      pro: t("pricing.features.support.priority"),
      enterprise: t("pricing.features.support.dedicated"),
    },
  ];

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

  const handleSubscribe = async (plan: string) => {
    if (plan === "free") {
      if (!session) {
        setShowLoginDialog(true);
        return;
      }
      router.push("/en/dashboard");
      return;
    }

    setSelectedPlan(plan);

    if (!session) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: plan, interval: "monthly" }),
      });

      if (!response.ok)
        throw new Error(t("pricing.error") || "Failed to create subscription");

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(
          t("pricing.success") || "Subscription updated successfully"
        );
        router.push("/en/dashboard");
      }
    } catch (error) {
      toast.error(
        t("pricing.error") ||
          "Failed to process subscription. Please try again."
      );
    }
  };

  const getPlanFeatures = (plan: "free" | "basic" | "pro" | "enterprise") => {
    return planFeatures
      .map((feature) => ({
        name: feature.name,
        value: feature[plan],
      }))
      .filter((f) => f.value !== false);
  };

  return (
    <div className="py-10 px-4 bg-background">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("pricing.title") || "Simple, transparent pricing"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("pricing.subtitle") || "Choose the plan that's right for you."}
        </p>
      </div>

      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              {t("subscription.free") || "Free"}
            </CardTitle>
            <div className="text-3xl font-bold">$0</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getPlanFeatures("free").map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>
                    {feature.name}: {feature.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={session ? "outline" : "default"}
              className="w-full"
              onClick={() => handleSubscribe("free")}
            >
              {session
                ? t("pricing.currentPlan") || "Current Plan"
                : t("pricing.getStarted") || "Get Started"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-primary relative shadow-md hover:shadow-lg transition-shadow">
          <Badge className="absolute top-0 right-4 -translate-y-1/2 px-3 py-1">
            Popular
          </Badge>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("subscription.basic") || "Basic"}
            </CardTitle>
            <div className="text-3xl font-bold">
              ${pricing.basic}
              <span className="text-sm text-muted-foreground">
                /{t("pricing.monthly") || "month"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getPlanFeatures("basic").map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>
                    {feature.name}: {feature.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("basic")}>
              {t("pricing.subscribe") || "Subscribe"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              {t("subscription.pro") || "Pro"}
            </CardTitle>
            <div className="text-3xl font-bold">
              ${pricing.pro}
              <span className="text-sm text-muted-foreground">
                /{t("pricing.monthly") || "month"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getPlanFeatures("pro").map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>
                    {feature.name}: {feature.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("pro")}>
              {t("pricing.subscribe") || "Subscribe"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              {t("subscription.enterprise") || "Enterprise"}
            </CardTitle>
            <div className="text-3xl font-bold">
              ${pricing.enterprise}
              <span className="text-sm text-muted-foreground">
                /{t("pricing.monthly") || "month"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {getPlanFeatures("enterprise").map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>
                    {feature.name}: {feature.value}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSubscribe("enterprise")}
            >
              {t("pricing.subscribe") || "Subscribe"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {showLoginDialog && (
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("pricing.loginRequired") || "Sign in required"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("pricing.loginRequiredDesc") ||
                  "You need to sign in to your account before subscribing. Would you like to sign in now?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("common.cancel") || "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <LanguageLink href={`/login?callbackUrl=/pricing`}>
                  <Button>{t("auth.signIn") || "Sign In"}</Button>
                </LanguageLink>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="mx-auto max-w-3xl text-center mt-10">
        <h2 className="text-2xl font-bold">
          {t("pricing.cta.title") || "Ready to get started?"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("pricing.cta.subtitle") || "Choose the plan that's right for you."}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button size="lg" onClick={() => handleUpgrade("basic")}>
            {t("pricing.cta.startBasic") || "Start with Basic"}
          </Button>
          <LanguageLink href="/pdf-tools">
            <Button variant="outline" size="lg">
              {t("pricing.cta.explorePdfTools") || "Explore PDF Tools"}
            </Button>
          </LanguageLink>
        </div>
      </div>
    </div>
  );
}
