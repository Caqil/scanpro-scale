// components/admin/dashboard/recent-activity.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { AdminStats } from "@/src/types/admin";
import {
  UserPlus,
  CreditCard,
  Activity,
  Settings,
  FileText,
  Shield,
  Key,
  RefreshCw,
} from "lucide-react";

interface RecentActivityProps {
  activities: AdminStats["recentActivity"];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "user_registered":
        return <UserPlus className="h-4 w-4" />;
      case "subscription_created":
      case "subscription_updated":
        return <CreditCard className="h-4 w-4" />;
      case "api_call":
        return <Activity className="h-4 w-4" />;
      case "api_key_created":
        return <Key className="h-4 w-4" />;
      case "role_changed":
        return <Shield className="h-4 w-4" />;
      case "settings_updated":
        return <Settings className="h-4 w-4" />;
      case "document_processed":
        return <FileText className="h-4 w-4" />;
      case "system_event":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: AdminStats["recentActivity"][0]["type"]) => {
    switch (type) {
      case "user":
        return "bg-blue-500";
      case "subscription":
        return "bg-green-500";
      case "api":
        return "bg-purple-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent activity found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {activity.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getActivityColor(
                    activity.type
                  )} ring-2 ring-background`}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.action)}
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {activity.details}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.userEmail}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
