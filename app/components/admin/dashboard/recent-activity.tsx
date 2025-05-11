// components/admin/dashboard/recent-activity.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: "user" | "subscription" | "api" | "system";
}

export function RecentActivity() {
  // Mock activity data - in a real app, fetch from API
  const activities: Activity[] = [
    {
      id: "1",
      user: {
        name: "John Doe",
        email: "john@example.com",
      },
      action: "upgraded",
      target: "Pro subscription",
      timestamp: "2 minutes ago",
      type: "subscription",
    },
    {
      id: "2",
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
      action: "created",
      target: "API key",
      timestamp: "5 minutes ago",
      type: "api",
    },
    {
      id: "3",
      user: {
        name: "System",
        email: "system@megapdf.com",
      },
      action: "completed",
      target: "Backup",
      timestamp: "10 minutes ago",
      type: "system",
    },
    {
      id: "4",
      user: {
        name: "Bob Johnson",
        email: "bob@example.com",
      },
      action: "signed up",
      target: "New account",
      timestamp: "15 minutes ago",
      type: "user",
    },
    {
      id: "5",
      user: {
        name: "Alice Brown",
        email: "alice@example.com",
      },
      action: "performed",
      target: "1000 PDF conversions",
      timestamp: "20 minutes ago",
      type: "api",
    },
  ];

  const getActivityColor = (type: Activity["type"]) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getActivityColor(
                    activity.type
                  )} ring-2 ring-background`}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
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
