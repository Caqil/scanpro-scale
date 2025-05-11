// app/[lang]/admin/dashboard/admin-content.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminStats } from "@/src/types/admin";
import { StatsOverview } from "@/components/admin/dashboard/stats-overview";
import { UserGrowthChart } from "@/components/admin/dashboard/user-growth-chart";
import { SubscriptionChart } from "@/components/admin/dashboard/subscription-chart";
import { ApiUsageChart } from "@/components/admin/dashboard/api-usage-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { SystemHealth } from "@/components/admin/dashboard/system-health";

export function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");

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
    }
  };

  if (loading) {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics and health
        </p>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionChart stats={stats} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiUsageChart stats={stats} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity />
        <SystemHealth stats={stats} />
      </div>
    </div>
  );
}
