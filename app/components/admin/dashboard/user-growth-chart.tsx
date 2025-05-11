// components/admin/dashboard/user-growth-chart.tsx
"use client";

import { useEffect, useState } from "react";
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

interface ChartData {
  date: string;
  users: number;
  active: number;
}

export function UserGrowthChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user growth data
    // In a real app, you would fetch this from your API
    const generateMockData = () => {
      const mockData: ChartData[] = [];
      const currentDate = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const month = date.toLocaleDateString("en-US", { month: "short" });
        const users = Math.floor(500 + (11 - i) * 100 + Math.random() * 50);
        const active = Math.floor(users * (0.6 + Math.random() * 0.2));

        mockData.push({
          date: month,
          users,
          active,
        });
      }

      setData(mockData);
      setLoading(false);
    };

    generateMockData();
  }, []);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center">
        Loading...
      </div>
    );
  }

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
