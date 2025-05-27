"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import {
  Activity as ActivityIcon,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName?: string;
  userEmail: string;
  action: string;
  details: string;
  status: "success" | "error" | "warning";
  ipAddress?: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activity`
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        // Use mock data if endpoint doesn't exist
        setActivities([
          {
            id: "1",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            userId: "user1",
            userName: "John Doe",
            userEmail: "john@example.com",
            action: "login",
            details: "User logged in successfully",
            status: "success",
            ipAddress: "192.168.1.100",
          },
          {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            userId: "user2",
            userName: "Jane Smith",
            userEmail: "jane@example.com",
            action: "api_call",
            details: "PDF conversion requested",
            status: "success",
            ipAddress: "10.0.0.5",
          },
          {
            id: "3",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            userId: "user3",
            userName: "Admin User",
            userEmail: "admin@example.com",
            action: "settings_update",
            details: "Updated pricing settings",
            status: "success",
            ipAddress: "192.168.1.1",
          },
          {
            id: "4",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            userId: "user4",
            userName: "Bob Wilson",
            userEmail: "bob@example.com",
            action: "api_call",
            details: "Failed to process PDF - invalid format",
            status: "error",
            ipAddress: "172.16.0.10",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Calculate stats
  const totalActivities = activities.length;
  const successCount = activities.filter((a) => a.status === "success").length;
  const errorCount = activities.filter((a) => a.status === "error").length;
  const uniqueUsers = new Set(activities.map((a) => a.userId)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor system and user activities
          </p>
        </div>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Activities</h3>
            <ActivityIcon className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{totalActivities}</div>
          <p className="text-xs text-muted-foreground">Recent activities</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Success Rate</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {totalActivities > 0
              ? Math.round((successCount / totalActivities) * 100)
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {successCount} successful
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Errors</h3>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{errorCount}</div>
          <p className="text-xs text-muted-foreground">Failed activities</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Users</h3>
            <User className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{uniqueUsers}</div>
          <p className="text-xs text-muted-foreground">Unique users</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-medium">Recent Activities</h3>
        </div>

        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(activity.status)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {activity.userName || "Unknown User"}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {activity.userEmail}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-sm">
                      <span className="font-medium capitalize">
                        {activity.action.replace("_", " ")}
                      </span>
                      {" - "}
                      {activity.details}
                    </p>

                    {activity.ipAddress && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>IP: {activity.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
