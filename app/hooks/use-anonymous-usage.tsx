"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LockIcon } from "lucide-react";
import { LanguageLink } from "@/components/language-link";
import { Button } from "@/components/ui/button";

/**
 * Hook to get anonymous usage information from cookies
 * Returns usage information and a component to display when limits are close
 */
export function useAnonymousUsage() {
  const [usageCount, setUsageCount] = useState(0);
  const [remainingOperations, setRemainingOperations] = useState(5); // Default to 5 operations allowed

  useEffect(() => {
    // Get anonymous usage from cookies
    const getCookieValue = (name: string): string | null => {
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      return cookie ? cookie.split("=")[1] : null;
    };

    try {
      const usageCookie = getCookieValue("anonymous_usage");
      if (usageCookie) {
        const usageData = JSON.parse(decodeURIComponent(usageCookie));
        const totalUsage = Object.values(usageData).reduce(
          (sum: number, count: any) => sum + (count as number),
          0
        );
        const remaining = Math.max(0, 5 - totalUsage); // 5 is MAX_ANONYMOUS_OPERATIONS

        setUsageCount(totalUsage);
        setRemainingOperations(remaining);
      }
    } catch (error) {
      console.error("Error parsing anonymous usage cookie:", error);
    }
  }, []);

  // Warning component to show when user is close to the limit
  const UsageWarningComponent = () => {
    // Only show warning if usage is 3 or more (out of 5)
    if (usageCount < 3) return null;

    // Different messaging based on remaining operations
    if (remainingOperations <= 0) {
      return (
        <Alert className="mb-4 mt-2 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <LockIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle>Usage limit reached</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You've reached the maximum free usage limit (5 operations). Please
              sign in or create an account to continue using our PDF tools.
            </p>
            <div className="flex gap-2 mt-1">
              <LanguageLink href="/login">
                <Button size="sm" variant="default">
                  Sign In
                </Button>
              </LanguageLink>
              <LanguageLink href="/register">
                <Button size="sm" variant="outline">
                  Create Account
                </Button>
              </LanguageLink>
            </div>
          </AlertDescription>
        </Alert>
      );
    } else if (remainingOperations === 1) {
      return (
        <Alert className="mb-4 mt-2 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Last free operation</AlertTitle>
          <AlertDescription>
            This is your last free operation. Sign in or create an account to
            continue using our PDF tools without limits.
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="mb-4 mt-2 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Limited free operations remaining</AlertTitle>
          <AlertDescription>
            You have {remainingOperations} free operations left. Sign in to
            continue using our tools without limits.
          </AlertDescription>
        </Alert>
      );
    }
  };

  return {
    usageCount,
    remainingOperations,
    isLimitReached: remainingOperations <= 0,
    UsageWarningComponent,
  };
}
