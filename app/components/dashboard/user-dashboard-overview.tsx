"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  FileText,
  DownloadCloud,
  UploadCloud,
  Zap,
  ArrowUp,
  Bell,
  Key,
  Clock,
  Layers,
} from "lucide-react";

interface UsageStatsProps {
  totalOperations: number;
  operationCounts: Record<string, number>;
}

interface UserDashboardOverviewProps {
  user: any;
  usageStats: UsageStatsProps;
}

export function UserDashboardOverview({ user, usageStats }: UserDashboardOverviewProps) {
  // Determine usage limits based on subscription tier
  const usageLimit = 
  user?.subscription?.tier === "enterprise"
    ? 1000000  // Updated from 100000
    : user?.subscription?.tier === "pro"
    ? 100000   // Updated from 10000
    : user?.subscription?.tier === "basic"
    ? 10000    // Updated from 1000
    : 1000;    // Updated from 100

  // Format operation name for display
  const formatOperation = (op: string): string => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Create chart data from operation counts
  const chartData = Object.entries(usageStats.operationCounts).map(([operation, count]) => ({
    name: formatOperation(operation),
    value: count,
  }));

  // Get the most used operation
  const getMostUsedOperation = (): { operation: string; count: number } => {
    if (Object.keys(usageStats.operationCounts).length === 0) {
      return { operation: "None", count: 0 };
    }

    const entries = Object.entries(usageStats.operationCounts);
    if (entries.length === 0) return { operation: "None", count: 0 };

    const [operation, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return { operation, count: count as number };
  };

  const mostUsed = getMostUsedOperation();

  // Format the date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Convert PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageLink href="/convert/pdf-to-docx">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Convert Now
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Compress Files</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageLink href="/compress-pdf">
              <Button className="w-full">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Compress Now
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Manage API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageLink href="/dashboard/api-keys">
              <Button className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Manage Keys
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">View Docs</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageLink href="/docs">
              <Button className="w-full">
                <Layers className="mr-2 h-4 w-4" />
                Open Docs
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>
      </div>

      {/* Usage statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalOperations}</div>
            <p className="text-xs text-muted-foreground">of {usageLimit} operations this month</p>
            <Progress value={(usageStats.totalOperations / usageLimit) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.subscription?.tier || "Free"}</div>
            <p className="text-xs text-muted-foreground">
              {user?.subscription?.status === "active" ? "Active" : "Inactive"}
            </p>
            {user?.subscription?.currentPeriodEnd && (
              <p className="text-xs text-muted-foreground mt-1">
                Renews: {formatDate(user.subscription.currentPeriodEnd)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Operation</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatOperation(mostUsed.operation)}</div>
            <p className="text-xs text-muted-foreground">
              {mostUsed.count} operations ({Math.round((mostUsed.count / usageStats.totalOperations) * 100) || 0}% of total)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(user.createdAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Operation Usage</CardTitle>
          <CardDescription>
            Your API usage breakdown for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent activities - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your recent operations and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">PDF to Word Conversion</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-primary/10 p-2">
                <DownloadCloud className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">PDF Compression</p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-primary/10 p-2">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">API Key Created</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}