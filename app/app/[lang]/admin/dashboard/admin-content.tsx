// app/[lang]/admin/dashboard/admin-content.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminStats } from "@/src/types/admin";
import { StatsOverview } from "@/components/admin/dashboard/stats-overview";
import { UserGrowthChart } from "@/components/admin/dashboard/user-growth-chart";
import { ApiUsageChart } from "@/components/admin/dashboard/api-usage-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { SystemHealth } from "@/components/admin/dashboard/system-health";
import { fetchWithAuth } from "@/src/utils/auth";
export function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(`${apiUrl}/api/admin/dashboard`);

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform metrics and health
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Loader2 className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={stats.userGrowth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiUsageChart stats={stats} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Usage by Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiUsageChart stats={stats} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity activities={stats.recentActivity} />
        <SystemHealth stats={stats} />
      </div>
    </div>
  );
}
