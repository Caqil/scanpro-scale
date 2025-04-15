// app/[lang]/subscription/cancel/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageLink } from "@/components/language-link";
import { XCircle, Loader2 } from "lucide-react";
import { useLanguageStore } from "@/src/store/store";

export default function SubscriptionCancelPage() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(true);
  
  // Reset any pending subscription to free tier
  useEffect(() => {
    const resetPendingSubscription = async () => {
      try {
        // Call an API endpoint to reset any pending subscription
        const response = await fetch('/api/subscription/reset-pending', {
          method: 'POST'
        });
        
        if (!response.ok) {
          console.error('Failed to reset pending subscription');
        }
      } catch (error) {
        console.error('Error resetting subscription:', error);
      } finally {
        setIsResetting(false);
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/en/dashboard");
        }, 3000);
      }
    };
    
    resetPendingSubscription();
  }, [router]);
  
  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-center">Subscription Canceled</CardTitle>
          <CardDescription className="text-center">
            Your subscription process was canceled.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isResetting ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-center text-muted-foreground">
                Resetting subscription status...
              </p>
            </div>
          ) : (
            <p className="text-center text-sm">
              You will be redirected to your dashboard shortly. If you're not redirected automatically, please click the button below.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          <LanguageLink href="/pricing">
            <Button variant="outline" disabled={isResetting}>View Plans</Button>
          </LanguageLink>
          <LanguageLink href="/dashboard">
            <Button disabled={isResetting}>Go to Dashboard</Button>
          </LanguageLink>
        </CardFooter>
      </Card>
    </div>
  );
}