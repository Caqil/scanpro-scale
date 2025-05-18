"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/auth-context";
import { DashboardContent } from "./dashboard-content";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading, refreshUserData } = useAuth();
  const router = useRouter();
  const [usageStats, setUsageStats] = useState({
    totalOperations: 0,
    operationCounts: {},
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/en/login?callbackUrl=/en/dashboard");
      return;
    }

    // If authenticated, fetch user data if needed
    if (isAuthenticated && user) {
      fetchUsageStats();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchUsageStats = async () => {
    try {
      setLoadingStats(true);
      const apiUrl = process.env.NEXT_PUBLIC_GO_API_URL || "";

      // Fetch usage stats from API
      const response = await fetch(`${apiUrl}/api/track-usage`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsageStats({
            totalOperations: data.totalOperations || 0,
            operationCounts: data.operationCounts || {},
          });
        }
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Show loading indicator while checking auth
  if (isLoading || loadingStats) {
    return (
      <div className="container max-w-6xl py-8 flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading completes, this will redirect

  // If we have a user, render the dashboard
  if (user) {
    return (
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <DashboardContent user={user} usageStats={usageStats} />
      </div>
    );
  }

  return null; // This should not render as we redirect if !isAuthenticated
}
