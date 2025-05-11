// components/admin/dashboard/system-health.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Server, Cpu, HardDrive, MemoryStick } from "lucide-react";
import { AdminStats } from "@/src/types/admin";

interface SystemHealthProps {
  stats: AdminStats;
}

export function SystemHealth({ stats }: SystemHealthProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "down":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case "healthy":
        return "default";
      case "degraded":
        return "secondary";
      case "down":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const metrics = [
    {
      label: "Server Load",
      value: stats.system.serverLoad,
      icon: Server,
      format: (v: number) => `${v}%`,
    },
    {
      label: "CPU Usage",
      value: Math.floor(stats.system.serverLoad * 0.8),
      icon: Cpu,
      format: (v: number) => `${v}%`,
    },
    {
      label: "Memory Usage",
      value: stats.system.memoryUsage,
      icon: MemoryStick,
      format: (v: number) => `${v}%`,
    },
    {
      label: "Disk Usage",
      value: stats.system.diskUsage,
      icon: HardDrive,
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health</CardTitle>
          <Badge variant={getHealthBadgeVariant(stats.system.health)}>
            {stats.system.health}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${getHealthColor(
                stats.system.health
              )}`}
            />
            <span className="text-sm">
              System Status:{" "}
              <span className="font-medium capitalize">
                {stats.system.health}
              </span>
            </span>
            <span className="text-sm text-muted-foreground ml-auto">
              Uptime: {stats.system.uptime}
            </span>
          </div>

          <div className="space-y-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{metric.label}</span>
                    </div>
                    <span className="font-medium">
                      {metric.format(metric.value)}
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
