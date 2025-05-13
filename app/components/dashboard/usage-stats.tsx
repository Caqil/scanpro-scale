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

  // Constants for usage tracking
  const FREE_OPERATIONS_MONTHLY = 500;
  const OPERATION_COST = 0.005;

  // Calculate free operations remaining
  const freeOperationsRemaining = Math.max(
    0,
    FREE_OPERATIONS_MONTHLY - (user.freeOperationsUsed || 0)
  );

  // Calculate usage percentage
  const freeOpsPercentage = Math.min(
    Math.round(
      ((user.freeOperationsUsed || 0) / FREE_OPERATIONS_MONTHLY) * 100
    ),
    100
  );

  // Calculate operations coverage with current balance
  const operationsCoverage = Math.floor((user.balance || 0) / OPERATION_COST);

  // Format operation name for display
  const formatOperation = (op: string): string => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Format percentage
  const formatPercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Format date for display
  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
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
      if (entries.length === 0)
        return { operation: t("dashboard.none"), count: 0 };

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
              {t("dashboard.totalUsage") || "Total Usage"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOperations}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.operationsThisMonth") || "Operations this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.freeOperations") || "Free Operations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {freeOperationsRemaining} / {FREE_OPERATIONS_MONTHLY}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.resetsOn") || "Resets on"}{" "}
              {formatDate(user.freeOperationsReset)}
            </p>
            <Progress value={freeOpsPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.balance") || "Balance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(user.balance || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.coveredOperations") || "Covers"}{" "}
              {operationsCoverage} {t("dashboard.operations") || "operations"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.mostUsed") || "Most Used"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatOperation(mostUsed.operation)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(mostUsed.count, totalOperations)}{" "}
              {t("dashboard.percentageOfTotal") || "of total"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("dashboard.usageByOperation") || "Usage By Operation"}
          </CardTitle>
          <CardDescription>
            {t("dashboard.apiUsageBreakdown") || "API usage breakdown"}
          </CardDescription>
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
                <p className="text-muted-foreground">
                  {t("dashboard.noData") || "No data available"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
