// components/admin/dashboard/api-usage-chart.tsx
"use client";

import { AdminStats } from "@/src/types/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ApiUsageChartProps {
  stats: AdminStats;
}

export function ApiUsageChart({ stats }: ApiUsageChartProps) {
  const data = Object.entries(stats.apiUsage.byOperation)
    .map(([operation, count]) => ({
      operation: operation.charAt(0).toUpperCase() + operation.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="operation"
            className="text-muted-foreground"
            tick={{ fill: "currentColor", fontSize: 12 }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            className="text-muted-foreground"
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
