"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/language-link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  DownloadCloud,
  Upload,
  Zap,
  ArrowUp,
  Bell,
  Key,
  Clock,
  Layers,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface UsageStatsProps {
  totalOperations: number;
  operationCounts: Record<string, number>;
}

interface UserDashboardOverviewProps {
  user: any;
  usageStats: UsageStatsProps;
}

export function UserDashboardOverview({
  user,
  usageStats,
}: UserDashboardOverviewProps) {
  // Monthly free operations allowance
  const FREE_OPERATIONS_MONTHLY = 500;

  // Operation cost in USD
  const OPERATION_COST = 0.005;

  // Calculate remaining free operations
  const freeOperationsRemaining = Math.max(
    0,
    FREE_OPERATIONS_MONTHLY - user.freeOperationsUsed || 0
  );

  // Calculate usage percentage
  const usagePercentage = Math.min(
    Math.round(
      ((user.freeOperationsUsed || 0) / FREE_OPERATIONS_MONTHLY) * 100
    ),
    100
  );

  // Calculate how many operations the current balance can cover
  const operationsCoverage = Math.floor((user.balance || 0) / OPERATION_COST);

  // Format operation name for display
  const formatOperation = (op: string): string => {
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  // Create chart data from operation counts
  const chartData = Object.entries(usageStats.operationCounts).map(
    ([operation, count]) => ({
      name: formatOperation(operation),
      value: count,
    })
  );

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
            <CardTitle className="text-lg">Add Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageLink href="/dashboard/balance">
              <Button className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>
      </div>

      {/* Balance and usage statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(user.balance || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Operations cost ${OPERATION_COST.toFixed(3)} each
            </p>
            <LanguageLink href="/dashboard/balance">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Add Funds
              </Button>
            </LanguageLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Free Operations
            </CardTitle>
            <DownloadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {freeOperationsRemaining} / {FREE_OPERATIONS_MONTHLY}
            </div>
            <p className="text-xs text-muted-foreground">
              Resets on {formatDate(user.freeOperationsReset?.toString())}
            </p>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Operations Coverage
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationsCoverage}</div>
            <p className="text-xs text-muted-foreground">
              Operations available with current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Used Operation
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatOperation(mostUsed.operation)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostUsed.count} operations (
              {Math.round(
                (mostUsed.count / usageStats.totalOperations) * 100
              ) || 0}
              % of total)
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
          <CardDescription>
            Your recent operations and activities
          </CardDescription>
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
