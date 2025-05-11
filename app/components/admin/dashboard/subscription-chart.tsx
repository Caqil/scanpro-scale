// components/admin/dashboard/subscription-chart.tsx
"use client";

import { AdminStats } from "@/src/types/admin";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SubscriptionChartProps {
  stats: AdminStats;
}

const COLORS = {
  free: "#94a3b8",
  basic: "#3b82f6",
  pro: "#10b981",
  enterprise: "#a855f7",
};

export function SubscriptionChart({ stats }: SubscriptionChartProps) {
  const data = Object.entries(stats.users.bySubscription)
    .map(([tier, value]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value,
      tier,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.tier as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
