// app/[lang]/dashboard/dashboard-content.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/user-profile";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";
import { UsageStats } from "@/components/dashboard/usage-stats";
import { useSearchParams } from "next/navigation";
import {
  EmailVerificationAlert,
  EmailVerifiedAlert,
} from "@/components/email-verification-alert";
import { BalancePanel } from "@/components/balance-panel";
import { useLanguageStore } from "@/src/store/store";

interface DashboardContentProps {
  user: any;
  usageStats: {
    totalOperations: number;
    operationCounts: Record<string, number>;
  };
}

export function DashboardContent({ user, usageStats }: DashboardContentProps) {
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const justVerified = searchParams?.get("verified") === "true";
  const { t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Effect to redirect admin users
  useEffect(() => {
    if (user.role === "admin" && pathname) {
      // Extract language from pathname (e.g., /en/dashboard -> en)
      const pathParts = pathname.split("/");
      const lang = pathParts[1] || "en";
      router.push(`/admin/dashboard`);
    }
  }, [user.role, router, pathname]);
  useEffect(() => {
    // Check if user is authenticated on client side
    const checkAuth = () => {
      // Check for auth in localStorage
      const authData = localStorage.getItem("auth");
      const userIsAuth = localStorage.getItem("userIsAuthenticated");

      // Check for auth cookie
      const hasAuthCookie = document.cookie.includes("authToken=");

      if (authData || userIsAuth === "true" || hasAuthCookie) {
        setIsAuthenticated(true);
      } else {
        // Redirect to login if not authenticated
        router.push("/en/login?callbackUrl=/en/dashboard");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);
  // Show verified alert if the user just verified their email
  useEffect(() => {
    if (justVerified && user.isEmailVerified) {
      setShowVerifiedAlert(true);
    }
  }, [justVerified, user.isEmailVerified]);

  // Show loading while redirecting admin
  if (user.role === "admin") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show appropriate alert based on verification status */}
      {!user.isEmailVerified && (
        <EmailVerificationAlert userEmail={user.email} userName={user.name} />
      )}

      {showVerifiedAlert && <EmailVerifiedAlert />}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            {t("dashboard.overview") || "Overview"}
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            {t("dashboard.apiKeys") || "API Keys"}
          </TabsTrigger>
          <TabsTrigger value="subscription">
            {t("balancePanel.table.balance") || "Balance"}
          </TabsTrigger>
          <TabsTrigger value="profile">
            {" "}
            {t("nav.profile") || "Profile"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <UsageStats user={user} usageStats={usageStats} />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <BalancePanel />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
}
