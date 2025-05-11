// app/[lang]/admin/activity/activity-content.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "error" | "warning";
}

export function ActivityContent() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    timeRange: "24h",
  });

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockActivities: ActivityLog[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          userId: "user1",
          userName: "John Doe",
          userEmail: "john@example.com",
          action: "login",
          resource: "auth",
          details: "Successful login",
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/91.0",
          status: "success",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: "user2",
          userName: "Jane Smith",
          userEmail: "jane@example.com",
          action: "subscription.upgrade",
          resource: "subscription",
          details: "Upgraded to Pro plan",
          ipAddress: "192.168.1.2",
          userAgent: "Safari/14.0",
          status: "success",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: "user3",
          userName: "Bob Johnson",
          userEmail: "bob@example.com",
          action: "api.key.create",
          resource: "api_key",
          details: "Created API key: Production Key",
          ipAddress: "192.168.1.3",
          userAgent: "Firefox/89.0",
          status: "success",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          userId: "user4",
          userName: "Alice Brown",
          userEmail: "alice@example.com",
          action: "pdf.convert",
          resource: "pdf",
          details: "Failed PDF conversion - file too large",
          ipAddress: "192.168.1.4",
          userAgent: "Edge/91.0",
          status: "error",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          userId: "system",
          userName: "System",
          userEmail: "system@megapdf.com",
          action: "backup.complete",
          resource: "system",
          details: "Daily backup completed",
          ipAddress: "127.0.0.1",
          userAgent: "System Process",
          status: "success",
        },
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "default";
      case "error":
        return "secondary";
      case "warning":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor system and user activities
          </p>
        </div>
        <Button onClick={fetchActivities} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.timeRange}
              onValueChange={(value) =>
                setFilters({ ...filters, timeRange: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div
                  className={`h-2 w-2 rounded-full mt-2 ${getStatusColor(
                    activity.status
                  )}`}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activity.userName}</p>
                      <span className="text-sm text-muted-foreground">
                        {activity.userEmail}
                      </span>
                      <Badge variant={getStatusBadgeVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{activity.action}</span> -{" "}
                    {activity.details}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>IP: {activity.ipAddress}</span>
                    <span>Agent: {activity.userAgent}</span>
                    <span>Resource: {activity.resource}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
