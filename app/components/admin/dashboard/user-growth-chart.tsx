// components/admin/dashboard/user-growth-chart.tsx
"use client";

import { AdminStats } from "@/src/types/admin";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UserGrowthChartProps {
  data: AdminStats['userGrowth'];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-muted-foreground"
            tick={{ fill: "currentColor", fontSize: 12 }}
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
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Total Users"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="active"
            stroke="#10b981"
            strokeWidth={2}
            name="Active Users"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}