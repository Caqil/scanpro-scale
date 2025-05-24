// app/[lang]/admin/api-usage/api-usage-content.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { toast } from "sonner";
import { ApiUsageData } from "@/src/types/admin";
import { fetchWithAuth } from "@/src/utils/auth";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Operation Count",
    color: "hsl(var(--chart-1))", // Matches example's hsl(var(--chart-1))
  },
} satisfies ChartConfig;

export function ApiUsageContent() {
  const [usageData, setUsageData] = useState<ApiUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(`${apiUrl}/api/admin/api-usage`);

      if (!response.ok) {
        throw new Error("Failed to fetch usage data");
      }

      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      console.error("Error fetching usage data:", error);
      toast.error("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate trend for operations (placeholder, replace with actual logic)
  const calculateTrend = () => {
    if (!usageData?.byOperation) return { percentage: 0, isUp: true };
    const currentTotal = Object.values(usageData.byOperation).reduce(
      (sum, count) => sum + count,
      0
    );
    // Placeholder: Assume a baseline total (replace with actual previous period data)
    const previousTotal = currentTotal * 0.95; // Example: 5% less than current
    const percentage = (
      ((currentTotal - previousTotal) / previousTotal) *
      100
    ).toFixed(1);
    return {
      percentage: Math.abs(parseFloat(percentage)),
      isUp: currentTotal >= previousTotal,
    };
  };

  const trend = calculateTrend();

  if (loading) {
    return <div className="text-center py-10">Loading usage data...</div>;
  }

  if (!usageData) {
    return <div className="text-center py-10">No usage data available</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          API Usage Analytics
        </h1>
        <p className="text-muted-foreground">
          Monitor API usage patterns and performance metrics
        </p>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Usage</TabsTrigger>
          <TabsTrigger value="operations">By Operation</TabsTrigger>
          <TabsTrigger value="tiers">By Tier</TabsTrigger>
          <TabsTrigger value="endpoints">Top Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily API Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="hsl(var(--primary))"
                      name="Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      name="Unique Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Bar Chart - Label</CardTitle>
              <CardDescription>Operation Counts 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    accessibilityLayer
                    data={Object.entries(usageData.byOperation).map(
                      ([operation, count]) => ({
                        operation,
                        count,
                      })
                    )}
                    margin={{
                      top: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="operation"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="count" fill="var(--color-count)" radius={8}>
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Trending {trend.isUp ? "up" : "down"} by {trend.percentage}%
                this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing total operations for the last period
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Subscription Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(usageData.byTier).map(
                      ([tier, count]) => ({
                        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
                        count,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tier" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageData.topEndpoints.map((endpoint, index) => (
                  <div
                    key={endpoint.endpoint}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{endpoint.endpoint}</p>
                        <p className="text-sm text-muted-foreground">
                          {endpoint.count} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {endpoint.avgResponseTime}ms
                      </p>
                      <p className="text-sm text-muted-foreground">
                        avg response time
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
