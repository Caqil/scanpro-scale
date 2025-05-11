// components/admin/dashboard/stats-overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "@/src/types/admin";
import { Users, CreditCard, BarChart3, Activity } from "lucide-react";

interface StatsOverviewProps {
  stats: AdminStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const cards = [
    {
      title: "Total Users",
      value: formatNumber(stats.users.total),
      description: `+${stats.users.newThisMonth} this month`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Users",
      value: formatNumber(stats.users.active),
      description: `${Math.round(
        (stats.users.active / stats.users.total) * 100
      )}% of total`,
      icon: Activity,
      color: "text-green-500",
    },
    // {
    //   title: "Monthly Revenue",
    //   value: formatCurrency(stats.revenue.thisMonth),
    //   description: `${
    //     stats.revenue.growth > 0 ? "+" : ""
    //   }${stats.revenue.growth.toFixed(1)}% from last month`,
    //   icon: CreditCard,
    //   color: stats.revenue.growth > 0 ? "text-green-500" : "text-red-500",
    // },
    {
      title: "API Requests",
      value: formatNumber(stats.apiUsage.totalRequests),
      description: `${
        Object.keys(stats.apiUsage.byOperation).length
      } operations`,
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
