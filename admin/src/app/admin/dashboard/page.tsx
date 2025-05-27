"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import { Users, CreditCard, BarChart3, Activity } from "lucide-react";

interface DashboardStats {
  users?: {
    total?: number;
    active?: number;
    newThisMonth?: number;
  };
  revenue?: {
    thisMonth?: number;
    growth?: number;
  };
  apiUsage?: {
    totalRequests?: number;
    byOperation?: Record<string, number>;
  };
  system?: {
    health?: string;
    uptime?: string;
    serverLoad?: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // If the endpoint doesn't exist or returns error, use mock data
        setStats({
          users: { total: 0, active: 0, newThisMonth: 0 },
          revenue: { thisMonth: 0, growth: 0 },
          apiUsage: { totalRequests: 0, byOperation: {} },
          system: { health: "unknown", uptime: "Unknown", serverLoad: 0 },
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Use fallback mock data
      setStats({
        users: { total: 0, active: 0, newThisMonth: 0 },
        revenue: { thisMonth: 0, growth: 0 },
        apiUsage: { totalRequests: 0, byOperation: {} },
        system: { health: "unknown", uptime: "Unknown", serverLoad: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.users?.newThisMonth || 0} this month
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Users</h3>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{stats?.users?.active || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.users?.total
              ? Math.round(
                  ((stats.users.active || 0) / stats.users.total) * 100
                )
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Monthly Revenue</h3>
            <CreditCard className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            ${(stats?.revenue?.thisMonth || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats?.revenue?.growth
              ? `${
                  stats.revenue.growth > 0 ? "+" : ""
                }${stats.revenue.growth.toFixed(1)}%`
              : "0%"}{" "}
            from last month
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">API Requests</h3>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">
            {stats?.apiUsage?.totalRequests || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.keys(stats?.apiUsage?.byOperation || {}).length} operations
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">System Health</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  stats?.system?.health === "healthy"
                    ? "bg-green-500"
                    : stats?.system?.health === "degraded"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-sm font-medium">System Status</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {stats?.system?.health || "Unknown"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Server Load</p>
            <p className="text-sm text-muted-foreground">
              {stats?.system?.serverLoad || 0}%
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Uptime</p>
            <p className="text-sm text-muted-foreground">
              {stats?.system?.uptime || "Unknown"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/users"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left block"
          >
            <Users className="h-6 w-6 mb-2 text-blue-500" />
            <h4 className="font-medium">Manage Users</h4>
            <p className="text-sm text-muted-foreground">
              View and edit user accounts
            </p>
          </a>

          <a
            href="/admin/api-usage"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left block"
          >
            <BarChart3 className="h-6 w-6 mb-2 text-purple-500" />
            <h4 className="font-medium">View Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Check API usage patterns
            </p>
          </a>

          <a
            href="/admin/activity"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-left block"
          >
            <Activity className="h-6 w-6 mb-2 text-green-500" />
            <h4 className="font-medium">Activity Logs</h4>
            <p className="text-sm text-muted-foreground">
              Monitor system activities
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
