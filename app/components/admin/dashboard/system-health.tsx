// components/admin/dashboard/system-health.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Cpu, HardDrive, MemoryStick, RefreshCw } from "lucide-react";
import { AdminStats } from "@/src/types/admin";
import { useState } from "react";
import { toast } from "sonner";

interface SystemHealthProps {
  stats: AdminStats;
  onRefresh?: () => void;
}

export function SystemHealth({ stats, onRefresh }: SystemHealthProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [healthOverride, setHealthOverride] = useState<string | null>(null);

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
      color:
        stats.system.serverLoad > 80
          ? "text-red-500"
          : stats.system.serverLoad > 60
          ? "text-yellow-500"
          : "text-green-500",
    },
    {
      label: "CPU Usage",
      value: Math.floor(stats.system.serverLoad * 0.8),
      icon: Cpu,
      format: (v: number) => `${v}%`,
      color:
        stats.system.serverLoad * 0.8 > 80
          ? "text-red-500"
          : stats.system.serverLoad * 0.8 > 60
          ? "text-yellow-500"
          : "text-green-500",
    },
    {
      label: "Memory Usage",
      value: stats.system.memoryUsage,
      icon: MemoryStick,
      format: (v: number) => `${v}%`,
      color:
        stats.system.memoryUsage > 90
          ? "text-red-500"
          : stats.system.memoryUsage > 75
          ? "text-yellow-500"
          : "text-green-500",
    },
    {
      label: "Disk Usage",
      value: stats.system.diskUsage,
      icon: HardDrive,
      format: (v: number) => `${v}%`,
      color:
        stats.system.diskUsage > 90
          ? "text-red-500"
          : stats.system.diskUsage > 75
          ? "text-yellow-500"
          : "text-green-500",
    },
  ];

  const handleHealthOverride = async (newHealth: string) => {
    try {
      // In a real implementation, you would save this to the database
      setHealthOverride(newHealth);
      toast.success(`System health status overridden to: ${newHealth}`);
    } catch (error) {
      toast.error("Failed to update system health status");
    }
  };

  const displayHealth = healthOverride || stats.system.health;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health</CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
            <Badge variant={getHealthBadgeVariant(displayHealth)}>
              {displayHealth}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isEditing && (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
              <span className="text-sm font-medium">
                Override Health Status:
              </span>
              <select
                value={healthOverride || stats.system.health}
                onChange={(e) => handleHealthOverride(e.target.value)}
                className="px-3 py-1 rounded-md border bg-background"
              >
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="down">Down</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${getHealthColor(
                displayHealth
              )}`}
            />
            <span className="text-sm">
              System Status:{" "}
              <span className="font-medium capitalize">{displayHealth}</span>
            </span>
            <span className="text-sm text-muted-foreground ml-auto">
              Uptime: {stats.system.uptime}
            </span>
          </div>

          <div className="space-y-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const progressColor =
                metric.value > 90
                  ? "bg-red-500"
                  : metric.value > 75
                  ? "bg-yellow-500"
                  : "bg-green-500";

              return (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      <span>{metric.label}</span>
                    </div>
                    <span className={`font-medium ${metric.color}`}>
                      {metric.format(metric.value)}
                    </span>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>

          {isEditing && (
            <div className="text-xs text-muted-foreground">
              * System metrics are collected in real-time. Health status
              override is for display purposes only.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
