"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LanguageLink } from "@/components/language-link";
import { useLanguageStore } from "@/src/store/store";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronRightIcon, ZapIcon } from "lucide-react";
import { useState } from "react";

export function ApiPricing() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Calculate yearly pricing with 20% discount
  const getYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return yearlyPrice.toFixed(2);
  };
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    router.push(`/pricing?plan=${planId}&cycle=${billingCycle}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('developer.pricing.title') || "API Pricing"}</CardTitle>
          <CardDescription>
            {t('developer.pricing.subtitle') || "Choose the right plan for your API integration needs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Billing cycle toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span 
              className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              {t('developer.pricing.monthly') || "Monthly billing"}
            </span>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <span 
              className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              {t('developer.pricing.yearly') || "Annual billing"}
              <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                {t('developer.pricing.discount') || "Save 20%"}
              </Badge>
            </span>
          </div>

          {/* Pricing plans */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Free Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>
                  {t('developer.pricing.freePlan.description') || "For occasional use and testing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">{t('developer.pricing.forever') || "forever"}</span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t('developer.pricing.includes') || "What's included:"}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.freePlan.feature1') || "100 operations per month"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.freePlan.feature2') || "10 requests per hour"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.freePlan.feature3') || "1 API key"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.freePlan.feature4') || "Basic PDF operations"}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSelectPlan("free")}
                >
                  {t('developer.pricing.getStarted') || "Get Started"}
                </Button>
              </CardFooter>
            </Card>

            {/* Basic Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>
                  {t('developer.pricing.basicPlan.description') || "For startups and small projects"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${billingCycle === "yearly" ? getYearlyPrice(9.99) : "9.99"}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{billingCycle === "yearly" ? 'year' : 'month'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t('developer.pricing.includes') || "What's included:"}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.basicPlan.feature1') || "1,000 operations per month"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.basicPlan.feature2') || "100 requests per hour"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.basicPlan.feature3') || "3 API keys"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.basicPlan.feature4') || "All PDF operations"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.basicPlan.feature5') || "Basic OCR"}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleSelectPlan("basic")}
                >
                  {t('developer.pricing.subscribe') || "Subscribe"} 
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-primary ring-1 ring-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Pro</CardTitle>
                  <Badge>Popular</Badge>
                </div>
                <CardDescription>
                  {t('developer.pricing.proPlan.description') || "For businesses and power users"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${billingCycle === "yearly" ? getYearlyPrice(29.99) : "29.99"}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{billingCycle === "yearly" ? 'year' : 'month'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t('developer.pricing.includes') || "What's included:"}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature1') || "10,000 operations per month"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature2') || "1,000 requests per hour"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature3') || "10 API keys"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature4') || "Advanced OCR"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature5') || "Priority support"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.proPlan.feature6') || "Custom watermarks"}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleSelectPlan("pro")}
                >
                  {t('developer.pricing.subscribe') || "Subscribe"}
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>
                  {t('developer.pricing.enterprisePlan.description') || "For high-volume integrations"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${billingCycle === "yearly" ? getYearlyPrice(99.99) : "99.99"}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{billingCycle === "yearly" ? 'year' : 'month'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t('developer.pricing.includes') || "What's included:"}</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature1') || "100,000+ operations per month"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature2') || "5,000+ requests per hour"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature3') || "50+ API keys"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature4') || "Dedicated support"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature5') || "Custom integration help"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.enterprisePlan.feature6') || "White-label options"}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleSelectPlan("enterprise")}
                >
                  {t('developer.pricing.subscribe') || "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Custom Pricing */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ZapIcon className="h-5 w-5 text-primary" />
                {t('developer.pricing.customPricing.title') || "Need a custom solution?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('developer.pricing.customPricing.description') || 
                  "For high-volume API usage or specialized integration requirements, we offer custom pricing with dedicated support."}
              </p>
              <LanguageLink href="/contact">
                <Button variant="outline" className="flex items-center gap-1">
                  {t('cta.contactSales') || "Contact Sales"}
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </LanguageLink>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Card className="md:w-64">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('developer.pricing.customPricing.enterprisePlus') || "Enterprise+"}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.customPricing.dedicated') || "Dedicated infrastructure"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.customPricing.sla') || "Custom SLAs"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span>{t('developer.pricing.customPricing.account') || "Dedicated account manager"}</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Badge variant="outline" className="w-full justify-center">
                    {t('developer.pricing.customPricing.custom') || "Custom pricing"}
                  </Badge>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}