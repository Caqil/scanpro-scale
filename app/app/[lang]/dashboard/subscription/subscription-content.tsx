"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Zap,
  Shield,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguageStore } from "@/src/store/store";
import { toast } from "sonner";
import { USAGE_LIMITS } from "@/lib/validate-key";
import { cn } from "@/lib/utils";
import { LanguageLink } from "@/components/language-link";

// Subscription tiers data
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

export function SubscriptionHeaderSection() {
  const { t } = useLanguageStore();

  return (
    <div className="mx-auto flex flex-col items-center text-center mb-8">
      <div className="mb-4 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <CreditCard className="h-8 w-8 text-indigo-500" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {t("subscription.title") || "Choose Your Plan"}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground max-w-[700px]">
        {t("subscription.description") ||
          "Unlock premium features and increase your processing limits"}
      </p>
    </div>
  );
}

export function TierSelectionCard() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch subscription data");
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleUpgrade = async (tier: string) => {
    try {
      setUpgradeTarget(tier);
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No approval URL returned");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error("Failed to upgrade subscription");
      setUpgradeTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => {
        const capitalizedTier = tier.charAt(0).toUpperCase() + tier.slice(1);
        const isCurrentTier = subscription?.tier === tier;
        const isPopular = tier === "pro";

        return (
          <Card
            key={tier}
            className={cn(
              "relative transition-all duration-300 hover:shadow-lg border-2",
              isCurrentTier && "border-primary",
              isPopular && "border-green-500",
              !isCurrentTier && !isPopular && "border-transparent"
            )}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-500 text-white">Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{capitalizedTier}</span>
                {isCurrentTier && <Badge variant="outline">Current</Badge>}
              </CardTitle>
              <CardDescription className="text-3xl font-bold">
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
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentTier ? (
                <Button className="w-full" disabled variant="outline">
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(tier)}
                  disabled={
                    isLoading || upgradeTarget === tier || tier === "free"
                  }
                >
                  {upgradeTarget === tier ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : tier === "free" ? (
                    "Current Plan"
                  ) : (
                    `Upgrade to ${capitalizedTier}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function ComparisonTableSection() {
  const { t } = useLanguageStore();

  const features = [
    {
      name: "Monthly operations",
      free: "500",
      basic: "5,000",
      pro: "50,000",
      enterprise: "100,000",
    },
    {
      name: "API keys",
      free: "1",
      basic: "3",
      pro: "10",
      enterprise: "Unlimited",
    },
    {
      name: "Processing speed",
      free: "Standard",
      basic: "Fast",
      pro: "Maximum",
      enterprise: "Maximum",
    },
    {
      name: "Support level",
      free: "Community",
      basic: "Email",
      pro: "Priority",
      enterprise: "Dedicated",
    },
    {
      name: "PDF editing tools",
      free: "Basic",
      basic: "Standard",
      pro: "Advanced",
      enterprise: "Advanced",
    },
    {
      name: "Batch processing",
      free: "❌",
      basic: "✓",
      pro: "✓",
      enterprise: "✓",
    },
    {
      name: "Custom solutions",
      free: "❌",
      basic: "❌",
      pro: "❌",
      enterprise: "✓",
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("subscription.comparison.title") || "Compare Plans"}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-4 text-left font-medium">Feature</th>
              <th className="p-4 text-center font-medium">Free</th>
              <th className="p-4 text-center font-medium">Basic</th>
              <th className="p-4 text-center font-medium bg-green-50 dark:bg-green-900/30">
                Pro
              </th>
              <th className="p-4 text-center font-medium">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{feature.name}</td>
                <td className="p-4 text-center">{feature.free}</td>
                <td className="p-4 text-center">{feature.basic}</td>
                <td className="p-4 text-center bg-green-50 dark:bg-green-900/30 font-medium">
                  {feature.pro}
                </td>
                <td className="p-4 text-center">{feature.enterprise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BenefitsSection() {
  const { t } = useLanguageStore();

  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title:
        t("subscription.benefits.speed.title") || "Lightning Fast Processing",
      description:
        t("subscription.benefits.speed.description") ||
        "Premium plans get priority processing with maximum speed",
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: t("subscription.benefits.security.title") || "Enhanced Security",
      description:
        t("subscription.benefits.security.description") ||
        "Advanced security features and encrypted file processing",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-purple-500" />,
      title: t("subscription.benefits.flexible.title") || "Flexible Billing",
      description:
        t("subscription.benefits.flexible.description") ||
        "Cancel anytime, no long-term commitments required",
    },
    {
      icon: <HelpCircle className="h-6 w-6 text-orange-500" />,
      title: t("subscription.benefits.support.title") || "Priority Support",
      description:
        t("subscription.benefits.support.description") ||
        "Get faster responses from our support team",
    },
  ];

  return (
    <div className="mb-12 p-6 bg-muted/30 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("subscription.benefits.title") || "Why Upgrade?"}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4">
            <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionFaqSection() {
  const { t } = useLanguageStore();

  const faqs = [
    {
      question:
        t("subscription.faq.cancel.question") ||
        "Can I cancel my subscription anytime?",
      answer:
        t("subscription.faq.cancel.answer") ||
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
    },
    {
      question:
        t("subscription.faq.refund.question") || "What is your refund policy?",
      answer:
        t("subscription.faq.refund.answer") ||
        "We offer a 30-day money-back guarantee. If you're not satisfied with our service, contact support for a full refund within the first 30 days.",
    },
    {
      question:
        t("subscription.faq.upgrade.question") ||
        "Can I upgrade or downgrade my plan?",
      answer:
        t("subscription.faq.upgrade.answer") ||
        "Yes, you can change your plan at any time. When upgrading, you'll immediately gain access to additional features. If downgrading, the change will take effect at the start of your next billing cycle.",
    },
    {
      question:
        t("subscription.faq.payment.question") ||
        "What payment methods do you accept?",
      answer:
        t("subscription.faq.payment.answer") ||
        "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. All payments are processed securely through our payment provider.",
    },
    {
      question:
        t("subscription.faq.usage.question") ||
        "What happens if I exceed my usage limits?",
      answer:
        t("subscription.faq.usage.answer") ||
        "If you approach your monthly limit, we'll notify you. Operations beyond your limit will be blocked until the next billing cycle or until you upgrade your plan.",
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t("subscription.faq.title") || "Frequently Asked Questions"}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
              {faq.question}
            </h3>
            <p className="text-sm text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionSuccessContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your subscription...");
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // First, check for subscription ID in the URL
        const subscriptionId =
          searchParams?.get("subscription_id") ||
          searchParams?.get("token") ||
          searchParams?.get("ba_token");

        if (!subscriptionId) {
          console.error("No subscription ID found in URL");
          setStatus("error");
          setMessage("No subscription ID found in URL parameters");
          return;
        }

        console.log("Found subscription ID:", subscriptionId);

        // Give PayPal a moment to update their systems
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Call verify endpoint
        const response = await fetch("/api/subscription/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subscriptionId }),
        });

        const data = await response.json();
        console.log("Verification response:", data);

        if (data.success) {
          setStatus("success");
          setMessage("Your subscription has been activated successfully!");
          setSubscriptionDetails(data.subscription);
        } else {
          // Retry once after a delay if PayPal is still processing
          if (data.message?.includes("pending")) {
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const retryResponse = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ subscriptionId }),
            });

            const retryData = await retryResponse.json();

            if (retryData.success) {
              setStatus("success");
              setMessage("Your subscription has been activated successfully!");
              setSubscriptionDetails(retryData.subscription);
              return;
            }
          }

          setStatus("error");
          setMessage(data.message || "Failed to verify subscription");
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your subscription");
      }
    };

    verifySubscription();
  }, [searchParams, router]);

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">
            {t("subscription.success.title") || "Subscription Activated"}
          </CardTitle>
          <CardDescription className="text-center">
            {t("subscription.success.description") ||
              "Your subscription has been activated successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            {t("subscription.success.message") ||
              "Thank you for subscribing to MegaPDF! You now have access to all the features of your subscription tier."}
          </p>
          <LanguageLink href="/dashboard">
            <Button variant="outline" size="lg">
              {t("subscription.success.cta") || "Back to Plans"}
            </Button>
          </LanguageLink>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubscriptionCancelContent() {
  const router = useRouter();
  const { t } = useLanguageStore();
  useEffect(() => {
    // Add a small delay to show the page before redirecting
    const timer = setTimeout(() => {
      router.push("/en/dashboard/subscription?canceled=true");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Zap className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-center">
            {t("subscription.cancel.title") || "Subscription Canceled"}
          </CardTitle>
          <CardDescription className="text-center">
            {t("subscription.cancel.description") ||
              "Your subscription process was canceled"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            {t("subscription.cancel.message") ||
              "The subscription process was canceled. No changes have been made to your account. Feel free to try again when you're ready."}
          </p>
          <LanguageLink href="/pricing">
            <Button variant="outline" size="lg">
              {t("subscription.cancel.cta") || "Back to Plans"}
            </Button>
          </LanguageLink>
        </CardContent>
      </Card>
    </div>
  );
}
