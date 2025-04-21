// components/dashboard/usage-stats.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguageStore } from "@/src/store/store";

interface UsageStatsProps {
  user: any;
  usageStats?: {
    totalOperations?: number;
    operationCounts?: Record<string, number>;
  };
}

export function UsageStats({ user, usageStats }: UsageStatsProps) {
 const { t } = useLanguageStore();
  const [chartData, setChartData] = useState<any[]>([]);

  // Determine limits based on subscription tier
  const usageLimit =
    user?.subscription?.tier === "enterprise"
      ? 500000
      : user?.subscription?.tier === "pro"
      ? 5000
      : user?.subscription?.tier === "basic"
      ? 5000
      : 500;

  // Format operation name for display
  const formatOperation = (op: string): string => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Get total operations safely
  const totalOperations =
    typeof usageStats?.totalOperations === "number"
      ? usageStats.totalOperations
      : 0;

  // Prepare chart data
  useEffect(() => {
    if (
      usageStats?.operationCounts &&
      typeof usageStats.operationCounts === "object"
    ) {
      try {
        const data = Object.entries(usageStats.operationCounts).map(
          ([operation, count]) => ({
            name: formatOperation(operation),
            value: count,
          })
        );
        setChartData(data);
      } catch (error) {
        console.error("Error preparing chart data:", error);
        setChartData([]);
      }
    } else {
      setChartData([]);
    }
  }, [usageStats]);

  // Get the most used operation
  const getMostUsedOperation = (): { operation: string; count: number } => {
    if (
      !usageStats?.operationCounts ||
      Object.keys(usageStats.operationCounts).length === 0
    ) {
      return { operation: t("dashboard.none"), count: 0 };
    }

    try {
      const entries = Object.entries(usageStats.operationCounts);
      if (entries.length === 0) return { operation: t("dashboard.none"), count: 0 };

      const [operation, count] = entries.sort((a, b) => b[1] - a[1])[0];
      return { operation, count: count as number };
    } catch (error) {
      console.error("Error getting most used operation:", error);
      return { operation: t("dashboard.none"), count: 0 };
    }
  };

  const mostUsed = getMostUsedOperation();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalUsage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.of")} {usageLimit} {t("dashboard.operationsThisMonth")}
            </p>
            <Progress
              value={(totalOperations / usageLimit) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.subscription")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user?.subscription?.tier || t("dashboard.status.inactive")}
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.subscription?.status === "active"
                ? t("dashboard.status.active")
                : t("dashboard.status.inactive")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.apiKeys")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.apiKeys?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.of")}{" "}
              {user?.subscription?.tier === "enterprise"
                ? 50
                : user?.subscription?.tier === "pro"
                ? 10
                : user?.subscription?.tier === "basic"
                ? 3
                : 1}{" "}
              {t("dashboard.keysAllowed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.mostUsed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatOperation(mostUsed.operation)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(mostUsed.count, totalOperations)}{" "}
              {t("dashboard.percentageOfTotal")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.usageByOperation")}</CardTitle>
          <CardDescription>{t("dashboard.apiUsageBreakdown")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t("dashboard.noData")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
