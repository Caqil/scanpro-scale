"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Calculator } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";
import { LanguageLink } from "@/components/language-link";
import { Slider } from "@/components/ui/slider";
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
import { useAuth } from "@/src/context/auth-context";

export function PricingContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [operationsEstimate, setOperationsEstimate] = useState(2000);
  const [depositAmount, setDepositAmount] = useState(10);

  // Cost per operation in dollars
  const OPERATION_COST = 0.005;

  // Calculate deposit needed for operations
  const calculateDeposit = (operations: number) => {
    return Math.ceil(operations * OPERATION_COST);
  };

  // Update deposit based on operations
  const handleOperationsChange = (value: number[]) => {
    const operations = value[0];
    setOperationsEstimate(operations);
    setDepositAmount(calculateDeposit(operations));
  };

  // Handle get started action
  const handleGetStarted = () => {
    if (isLoading) return; // Prevent action during loading

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    router.push("/en/dashboard");
  };

  // Pricing features
  const features = [
    "500 free operations every month",
    "Pay-as-you-go pricing at $0.005 per operation",
    "No subscription, no recurring fees",
    "Unused balance never expires",
    "Only pay for what you use",
    "Top up your balance anytime",
    "All PDF tools included",
    "Full API access",
  ];

  return (
    <div className="py-10 px-4 bg-background">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("pricing.title") || "Simple, transparent pricing"}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pay only for what you use, with no monthly subscriptions.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Pay-As-You-Go</CardTitle>
              <Badge className="px-3 py-1">Most Flexible</Badge>
            </div>
            <div className="text-3xl font-bold">$0.005</div>
            <div className="text-sm text-muted-foreground">per operation</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Estimate Your Costs
                </h3>
                <div className="text-sm font-bold">
                  {operationsEstimate.toLocaleString()} operations
                </div>
              </div>

              <Slider
                defaultValue={[2000]}
                min={500}
                max={10000}
                step={100}
                onValueChange={handleOperationsChange}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Monthly Free:</div>
                  <div className="font-medium">500 operations</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Additional:</div>
                  <div className="font-medium">
                    {Math.max(0, operationsEstimate - 500).toLocaleString()}{" "}
                    operations
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Cost:</div>
                  <div className="font-medium">
                    $
                    {Math.max(
                      0,
                      (operationsEstimate - 500) * OPERATION_COST
                    ).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    Recommended Deposit:
                  </div>
                  <div className="font-medium">${depositAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isAuthenticated
                ? "Add Funds to Account"
                : "Get Started"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mx-auto max-w-3xl text-center mt-10">
        <h2 className="text-2xl font-bold">
          {t("pricing.cta.title") || "Ready to get started?"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Create an account and get 500 free operations every month.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : isAuthenticated
              ? "Go to Dashboard"
              : "Create Account"}
          </Button>
          <LanguageLink href="/pdf-tools">
            <Button variant="outline" size="lg">
              {t("pricing.cta.explorePdfTools") || "Explore PDF Tools"}
            </Button>
          </LanguageLink>
        </div>
      </div>

      {showLoginDialog && (
        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("pricing.loginRequired") || "Sign in required"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Create an account to get 500 free operations every month and add
                funds as needed.
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
    </div>
  );
}
