"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Server,
  Database,
  Activity,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileCog,
  DownloadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UsageStatsProps {
  totalOperations: number;
  operationCounts: Record<string, number>;
}

interface AdminDashboardOverviewProps {
  user: any;
  usageStats: UsageStatsProps;
}

export function AdminDashboardOverview({ user, usageStats }: AdminDashboardOverviewProps) {
  // Mock data for admin dashboard
  const [systemStatus, setSystemStatus] = useState({
    uptime: "5d 12h 36m",
    serverLoad: "42%",
    memoryUsage: "68%",
    diskUsage: "54%",
    status: "healthy",
  });

  const [userStats, setUserStats] = useState({
    totalUsers: 1247,
    activeUsers: 842,
    premiumUsers: 356,
    newUsers: 28,
  });

  const [fileStats, setFileStats] = useState({
    totalFiles: 42356,
    totalStorage: "1.2 TB",
    conversions: 12675,
    compressions: 8943,
  });

  // Format operation name for display
  const formatOperation = (op: string): string => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Mock user growth data
  const userGrowthData = [
    { name: "Jan", users: 900 },
    { name: "Feb", users: 950 },
    { name: "Mar", users: 1000 },
    { name: "Apr", users: 1050 },
    { name: "May", users: 1100 },
    { name: "Jun", users: 1150 },
    { name: "Jul", users: 1200 },
    { name: "Aug", users: 1247 },
  ];

  // Subscription distribution data
  const subscriptionData = [
    { name: "Free", value: 891, color: "#8884d8" },
    { name: "Basic", value: 246, color: "#82ca9d" },
    { name: "Pro", value: 87, color: "#ffc658" },
    { name: "Enterprise", value: 23, color: "#ff8042" },
  ];

  // Mock server events
  const recentEvents = [
    {
      type: "alert",
      message: "High CPU usage detected",
      time: "10 minutes ago",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    {
      type: "success",
      message: "Database backup completed successfully",
      time: "45 minutes ago",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    },
    {
      type: "info",
      message: "System update scheduled for tonight",
      time: "2 hours ago",
      icon: <FileCog className="h-4 w-4 text-blue-500" />,
    },
    {
      type: "alert",
      message: "Storage space running low on backup server",
      time: "Yesterday",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
  ];

  // Fetch system status
  useEffect(() => {
    // This would normally be a real API call
    // For this demo, we're just using mock data
    const fetchSystemStatus = async () => {
      try {
        // Mock API call
        // const response = await fetch('/api/admin/system-status');
        // const data = await response.json();
        // setSystemStatus(data);
      } catch (error) {
        console.error("Error fetching system status:", error);
      }
    };

    fetchSystemStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs">
                <span className="text-muted-foreground">Active: </span>
                <span className="font-medium">{userStats.activeUsers}</span>
              </div>
              <Badge variant="outline">{userStats.newUsers} new today</Badge>
            </div>
            <Progress
              value={(userStats.activeUsers / userStats.totalUsers) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div
                className={`h-3 w-3 rounded-full mr-2 ${
                  systemStatus.status === "healthy"
                    ? "bg-green-500"
                    : systemStatus.status === "degraded"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              ></div>
              <div className="text-md font-bold capitalize">{systemStatus.status}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs">
                <span className="text-muted-foreground">Uptime: </span>
                <span className="font-medium">{systemStatus.uptime}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Load: </span>
                <span className="font-medium">{systemStatus.serverLoad}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Memory: </span>
                <span className="font-medium">{systemStatus.memoryUsage}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Disk: </span>
                <span className="font-medium">{systemStatus.diskUsage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.totalFiles}</div>
            <div className="text-xs text-muted-foreground">Total files</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs">
                <span className="text-muted-foreground">Storage: </span>
                <span className="font-medium">{fileStats.totalStorage}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Conversions: </span>
                <span className="font-medium">{fileStats.conversions}</span>
              </div>
            </div>
            <Progress value={54} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main dashboard tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* User growth chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subscription distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>User subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent system events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
                <CardDescription>System alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mr-4 mt-0.5">{event.icon}</div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20" variant="default">
              <Users className="mr-2 h-5 w-5" />
              Manage Users
            </Button>
            <Button className="h-20" variant="default">
              <FileCog className="mr-2 h-5 w-5" />
              System Maintenance
            </Button>
            <Button className="h-20" variant="default">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <User className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management Module</h3>
                <p className="text-muted-foreground mb-4">
                  This module would display user management features.
                </p>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Go to User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Monitor system activity and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Activity className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Activity Log Module</h3>
                <p className="text-muted-foreground mb-4">
                  This module would display detailed system activities and logs.
                </p>
                <Button>
                  <Clock className="mr-2 h-4 w-4" />
                  View Activity Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>Monitor and maintain system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Server className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">System Maintenance Module</h3>
                <p className="text-muted-foreground mb-4">
                  This module would display system health monitoring and maintenance tools.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline">
                    <FileCog className="mr-2 h-4 w-4" />
                    Run Maintenance
                  </Button>
                  <Button>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Backup System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}