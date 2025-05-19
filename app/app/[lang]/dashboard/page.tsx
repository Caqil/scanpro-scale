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
    if (!isLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push("/en/login?callbackUrl=/en/dashboard");
    } else if (isAuthenticated && user) {
      // Once authenticated and we have a user, fetch the usage stats
      fetchUsageStats();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchUsageStats = async () => {
    try {
      setLoadingStats(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      // Fetch usage stats from API
      const response = await fetch(`${apiUrl}/api/track-usage`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Usage stats response:", data);

        if (data.success) {
          setUsageStats({
            totalOperations: data.totalOperations || 0,
            operationCounts: data.operationCounts || {},
          });
        } else {
          console.error("Error in usage stats response:", data);
        }
      } else {
        console.error("Error fetching usage stats:", response.status);
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Show loading indicator while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="container max-w-6xl py-8 flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If we have a user, render the dashboard
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent
        user={user}
        usageStats={usageStats}
        loadingStats={loadingStats}
      />
    </div>
  );
}
