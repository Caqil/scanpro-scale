"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, InfoIcon } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  free: boolean;
  basic: boolean;
  pro: boolean;
  enterprise: boolean;
  tooltip?: string;
}

export function PricingContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Monthly and annual pricing
  const pricing = {
    monthly: {
      basic: 9.99,
      pro: 29.99,
      enterprise: 99.99,
    },
    annual: {
      basic: 7.99,
      pro: 24.99,
      enterprise: 79.99,
    },
  };

  // Calculate savings
  const getAnnualSavings = (plan: "basic" | "pro" | "enterprise") => {
    const monthlyCost = pricing.monthly[plan] * 12;
    const annualCost = pricing.annual[plan] * 12;
    const savings = monthlyCost - annualCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { savings, percentage };
  };

  // Plan features table (unchanged from your provided code)
  const planFeatures: PlanFeature[] = [
    { name: t('pricing.features.operations') || "Monthly operations", free: true, basic: true, pro: true, enterprise: true, tooltip: "Number of PDF operations you can perform per month" },
    { name: t('pricing.features.amount.free') || "100 operations", free: true, basic: false, pro: false, enterprise: false },
    { name: t('pricing.features.amount.basic') || "1.000 operations", free: false, basic: true, pro: false, enterprise: false },
    { name: t('pricing.features.amount.pro') || "10,000 operations", free: false, basic: false, pro: true, enterprise: false },
    { name: t('pricing.features.amount.enterprise') || "100,000 operations", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.apiAccess') || "API Access", free: true, basic: true, pro: true, enterprise: true, tooltip: "Programmatic access to our PDF tools via API" },
    { name: t('pricing.features.apiKeys.free') || "1 API key", free: true, basic: false, pro: false, enterprise: false },
    { name: t('pricing.features.apiKeys.basic') || "3 API keys", free: false, basic: true, pro: false, enterprise: false },
    { name: t('pricing.features.apiKeys.pro') || "10 API keys", free: false, basic: false, pro: true, enterprise: false },
    { name: t('pricing.features.apiKeys.enterprise') || "50 API keys", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.rateLimits') || "Rate limit", free: true, basic: true, pro: true, enterprise: true, tooltip: "Number of requests per hour through the API" },
    { name: t('pricing.features.rateLimit.free') || "10 requests/hour", free: true, basic: false, pro: false, enterprise: false },
    { name: t('pricing.features.rateLimit.basic') || "100 requests/hour", free: false, basic: true, pro: false, enterprise: false },
    { name: t('pricing.features.rateLimit.pro') || "1,000 requests/hour", free: false, basic: false, pro: true, enterprise: false },
    { name: t('pricing.features.rateLimit.enterprise') || "5,000 requests/hour", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.fileSizes') || "Max file size", free: true, basic: true, pro: true, enterprise: true },
    { name: t('pricing.features.fileSize.free') || "25 MB", free: true, basic: false, pro: false, enterprise: false },
    { name: t('pricing.features.fileSize.basic') || "50 MB", free: false, basic: true, pro: false, enterprise: false },
    { name: t('pricing.features.fileSize.pro') || "100 MB", free: false, basic: false, pro: true, enterprise: false },
    { name: t('pricing.features.fileSize.enterprise') || "200 MB", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.ocr') || "OCR (Text recognition)", free: false, basic: true, pro: true, enterprise: true, tooltip: "Extract text from images and scanned PDFs" },
    { name: t('pricing.features.watermarking') || "Watermarking", free: false, basic: true, pro: true, enterprise: true },
    { name: t('pricing.features.advancedProtection') || "Advanced PDF protection", free: false, basic: false, pro: true, enterprise: true },
    { name: t('pricing.features.bulkProcessing') || "Bulk processing", free: false, basic: false, pro: true, enterprise: true },
    { name: t('pricing.features.supports') || "Support", free: true, basic: true, pro: true, enterprise: true },
    { name: t('pricing.features.support.free') || "Email support", free: true, basic: true, pro: false, enterprise: false },
    { name: t('pricing.features.support.priority') || "Priority support", free: false, basic: false, pro: true, enterprise: false },
    { name: t('pricing.features.support.dedicated') || "Dedicated support", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.whiteLabel') || "White-label options", free: false, basic: false, pro: false, enterprise: true },
    { name: t('pricing.features.serviceLevel') || "Service Level Agreement", free: false, basic: false, pro: false, enterprise: true },
  ];

  // Handle subscription purchase (unchanged)
  const handleSubscribe = async (plan: string) => {
    if (plan === "free") {
      if (!session) {
        setShowLoginDialog(true);
        return;
      }
      router.push("/dashboard");
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
        body: JSON.stringify({
          tier: plan,
          interval: isAnnual ? "annual" : "monthly",
        }),
      });

      if (!response.ok) throw new Error("Failed to create subscription");

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(data.message || "Subscription updated successfully");
        router.push("/en/dashboard");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again later.");
    }
  };

  // Filter features for a specific plan
  const getPlanFeatures = (plan: "free" | "basic" | "pro" | "enterprise") => {
    return planFeatures.filter((feature) => feature[plan]);
  };

  return (
    <div className="py-16 px-4 md:px-6">
      {/* Header Section */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("pricing.title") || "Simple, transparent pricing"}
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          {t("pricing.subtitle") || "Choose the plan that's right for you. All plans include our core PDF tools."}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <Label htmlFor="billing-toggle" className={isAnnual ? "text-muted-foreground" : "font-medium"}>
            {t("pricing.monthly") || "Monthly"}
          </Label>
          <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
          <Label htmlFor="billing-toggle" className={!isAnnual ? "text-muted-foreground" : "font-medium"}>
            {t("pricing.yearly") || "Yearly"}
          </Label>
          {isAnnual && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              {t("pricing.saveUp") || "Save up to 20%"}
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards Section - Mobile View */}
      <div className="md:hidden mx-auto max-w-md space-y-6 mb-12">
        <Tabs defaultValue="free" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="pro">Pro</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          </TabsList>

          {/* Free Plan Tab */}
          <TabsContent value="free">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>{t('pricing.planDescriptions.free')}</CardDescription>
                <div className="mt-4 text-4xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {getPlanFeatures("free").map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>{feature.name}</span>
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
                  {session ? t("pricing.currentPlan") || "Current Plan" : t("pricing.getStarted") || "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Basic Plan Tab */}
          <TabsContent value="basic">
            <Card className="border-2 border-primary relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <Badge className="px-3 py-1">Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>{t('pricing.planDescriptions.basic')}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${isAnnual ? pricing.annual.basic : pricing.monthly.basic}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("basic").savings.toFixed(2)} ({getAnnualSavings("basic").percentage}%)
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {getPlanFeatures("basic").map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>{feature.name}</span>
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
          </TabsContent>

          {/* Pro Plan Tab */}
          <TabsContent value="pro">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>{t('pricing.planDescriptions.pro')}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${isAnnual ? pricing.annual.pro : pricing.monthly.pro}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("pro").savings.toFixed(2)} ({getAnnualSavings("pro").percentage}%)
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {getPlanFeatures("pro").map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>{feature.name}</span>
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
          </TabsContent>

          {/* Enterprise Plan Tab */}
          <TabsContent value="enterprise">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>{t('pricing.planDescriptions.enterprise')}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${isAnnual ? pricing.annual.enterprise : pricing.monthly.enterprise}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("enterprise").savings.toFixed(2)} ({getAnnualSavings("enterprise").percentage}%)
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {getPlanFeatures("enterprise").map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleSubscribe("enterprise")}>
                  {t("pricing.subscribe") || "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pricing Cards Section - Desktop View */}
      <div className="hidden md:block mx-auto max-w-7xl mb-16">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Free Plan */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>{t('pricing.planDescriptions.free')}</CardDescription>
              <div className="mt-4 text-4xl font-bold">$0</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {getPlanFeatures("free").map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature.name}</span>
                  </li>
                ))}
                {planFeatures.filter(f => !f.free && (f.name === t('pricing.features.ocr') || f.name === t('pricing.features.watermarking'))).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <XIcon className="mr-2 h-4 w-4 text-gray-300 dark:text-gray-600" />
                    <span className="text-muted-foreground">{feature.name}</span>
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
                {session ? t("pricing.currentPlan") || "Current Plan" : t("pricing.getStarted") || "Get Started"}
              </Button>
            </CardFooter>
          </Card>

          {/* Basic Plan */}
          <Card className="border-2 border-primary relative">
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <Badge className="px-3 py-1">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>{t('pricing.planDescriptions.basic')}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  ${isAnnual ? pricing.annual.basic : pricing.monthly.basic}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("basic").savings.toFixed(2)} ({getAnnualSavings("basic").percentage}%)
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {getPlanFeatures("basic").map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature.name}</span>
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

          {/* Pro Plan */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>{t('pricing.planDescriptions.pro')}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  ${isAnnual ? pricing.annual.pro : pricing.monthly.pro}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("pro").savings.toFixed(2)} ({getAnnualSavings("pro").percentage}%)
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {getPlanFeatures("pro").map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature.name}</span>
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

          {/* Enterprise Plan */}
          <Card className="border-2 border-muted">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>{t('pricing.planDescriptions.enterprise')}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  ${isAnnual ? pricing.annual.enterprise : pricing.monthly.enterprise}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    /{isAnnual ? t('pricing.yearly') || "mo, billed annually" : t('pricing.monthly') || "month"}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {t('pricing.saveUp') || "Save up to 20%"} ${getAnnualSavings("enterprise").savings.toFixed(2)} ({getAnnualSavings("enterprise").percentage}%)
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {getPlanFeatures("enterprise").map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSubscribe("enterprise")}>
                {t("pricing.subscribe") || "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Login Dialog */}
      {showLoginDialog && (
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("pricing.loginRequired") || "Sign in required"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("pricing.loginRequiredDesc") || "You need to sign in to your account before subscribing. Would you like to sign in now?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction asChild>
                <LanguageLink href={`/login?callbackUrl=/pricing`}>
                  <Button>{t("auth.signIn") || "Sign In"}</Button>
                </LanguageLink>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Features Comparison Table */}
      <div className="mx-auto max-w-7xl mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t("pricing.featureCompare") || "Feature Comparison"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 px-4 text-left font-medium">{t("pricing.feature") || "Feature"}</th>
                <th className="py-4 px-4 text-center font-medium">Free</th>
                <th className="py-4 px-4 text-center font-medium">Basic</th>
                <th className="py-4 px-4 text-center font-medium">Pro</th>
                <th className="py-4 px-4 text-center font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {planFeatures.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center gap-1">
                      <span>{feature.name}</span>
                      {feature.tooltip && (
                        <div className="relative flex items-center group">
                          <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-48 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            {feature.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {feature.free ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {feature.basic ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {feature.pro ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {feature.enterprise ? (
                      <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t("pricing.faq.title") || "Frequently Asked Questions"}</h2>
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{t("pricing.faq.q1.title") || "What are PDF operations?"}</h3>
            <p className="text-muted-foreground">{t("pricing.faq.q1.content") || "PDF operations include converting PDFs to other formats (Word, Excel, etc.), compressing PDFs, merging PDFs, splitting PDFs, adding watermarks, extracting text, and any other action performed on a PDF file through our service."}</p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{t("pricing.faq.q2.title") || "Can I upgrade or downgrade my plan?"}</h3>
            <p className="text-muted-foreground">{t("pricing.faq.q2.content") || "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new plan takes effect immediately. When downgrading, the new plan will take effect at the end of your current billing cycle."}</p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{t("pricing.faq.q3.title") || "Do you offer refunds?"}</h3>
            <p className="text-muted-foreground">{t("pricing.faq.q3.content") || "We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied with our service, you can request a refund within 7 days of your initial purchase."}</p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{t("pricing.faq.q4.title") || "What happens if I exceed my monthly operation limit?"}</h3>
            <p className="text-muted-foreground">{t("pricing.faq.q4.content") || "If you reach your monthly operation limit, you will not be able to perform additional operations until your limit resets at the beginning of your next billing cycle. You can upgrade your plan at any time to increase your limit."}</p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-medium mb-2">{t("pricing.faq.q5.title") || "Is my data secure?"}</h3>
            <p className="text-muted-foreground">{t("pricing.faq.q5.content") || "Yes, we take data security seriously. All file uploads and processing are done over secure HTTPS connections. We do not store your files longer than necessary for processing, and all files are automatically deleted after processing is complete."}</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-4">{t("pricing.cta.title") || "Ready to get started?"}</h2>
        <p className="text-xl text-muted-foreground mb-8">{t("pricing.cta.subtitle") || "Choose the plan that's right for you and start transforming your PDFs today."}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" onClick={() => handleSubscribe("basic")}>
            {t("pricing.cta.startBasic") || "Start with Basic"}
          </Button>
          <LanguageLink href="/pdf-tools">
            <Button variant="outline" size="lg">
              {t("pricing.cta.explorePdfTools") || "Explore PDF Tools"}
            </Button>
          </LanguageLink>
        </div>
      </div>

      {/* Login Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pricing.loginRequired") || "Sign in required"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pricing.loginRequiredDesc") || "You need to sign in to your account before subscribing. Would you like to sign in now?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction asChild>
              <LanguageLink href={`/login?callbackUrl=/pricing`}>
                <Button>{t("auth.signIn") || "Sign In"}</Button>
              </LanguageLink>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}