"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { LanguageLink } from "@/components/language-link";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");

  useEffect(() => {
    if (subscriptionId) {
      // Optionally verify the subscription with an API call
      fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success("Subscription activated successfully!");
          } else {
            toast.error(
              "Failed to verify subscription. Please contact support."
            );
          }
        })
        .catch((error) => {
          console.error("Error verifying subscription:", error);
          toast.error("An error occurred. Please contact support.");
        });
    } else {
      toast.error("Invalid subscription data. Please contact support.");
    }
  }, [subscriptionId]);

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">Subscription Activated</CardTitle>
          <CardDescription className="text-center">
            Your subscription has been activated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Thank you for subscribing to ScanPro! You now have access to all the
            features of your subscription tier.
          </p>
          <LanguageLink href="/dashboard">
            <Button variant="outline">View My Subscription</Button>
          </LanguageLink>
        </CardContent>
      </Card>
    </div>
  );
}
