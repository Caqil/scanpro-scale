// app/[lang]/admin/transactions/transactions-content.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Filter, Calendar, ArrowUpDown } from "lucide-react";
import { fetchWithAuth } from "@/src/utils/auth";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  balanceAfter: number;
  description: string;
  status: string;
  createdAt: string;
}

interface TransactionOverview {
  total: number;
  income: number;
  expenses: number;
  averageDeposit: number;
  depositCount: number;
  operationsToday: number;
  totalOperations: number;
}

interface TransactionStats {
  overview: TransactionOverview;
  trends: {
    date: string;
    income: number;
    operations: number;
  }[];
  // Modified to use operation categories instead of user types
  byCategory?: {
    category: string;
    income: number;
    count: number;
  }[];
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    dateRange: "30d",
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if (transactions.length === 0 && !loading) {
      setTransactions(mockTransactions);
    }
    if (!stats && !loading) {
      setStats(mockStats);
    }
  }, [loading, transactions.length, stats]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        search: filters.search,
        type: filters.type,
        status: filters.status,
        dateRange: filters.dateRange,
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/transactions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(`${apiUrl}/api/admin/transactions`);

      if (!response.ok) {
        throw new Error("Failed to fetch transaction stats");
      }

      const data = await response.json();
      // The Go API returns stats embedded in the main response
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      toast.error("Failed to load transaction statistics");
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams({
        search: filters.search,
        type: filters.type,
        status: filters.status,
        dateRange: filters.dateRange,
        format: "csv",
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetchWithAuth(
        `${apiUrl}/api/admin/transactions/export?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to export transactions");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Transactions exported successfully");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTransactionTypeColor = (amount: number) => {
    return amount > 0 ? "text-green-500" : "text-red-500";
  };

  // Mock data for initial rendering - Replace with actual API response
  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      userId: "user-1",
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: 50.0,
      balanceAfter: 50.0,
      description: "Deposit - completed",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-2",
      userId: "user-2",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      amount: -0.005,
      balanceAfter: 49.995,
      description: "Operation: convert",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-3",
      userId: "user-1",
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: -0.005,
      balanceAfter: 49.99,
      description: "Operation: compress",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockStats: TransactionStats = {
    overview: {
      total: 150,
      income: 1500.0,
      expenses: 200.0,
      averageDeposit: 35.0,
      depositCount: 42,
      operationsToday: 156,
      totalOperations: 5678,
    },
    trends: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        income: Math.floor(Math.random() * 200) + 50,
        operations: Math.floor(Math.random() * 100) + 20,
      };
    }).reverse(),
    // Changed to operation categories instead of user types
    byCategory: [
      { category: "Convert", income: 450, count: 45 },
      { category: "Compress", income: 350, count: 35 },
      { category: "Merge", income: 300, count: 30 },
      { category: "Split", income: 200, count: 20 },
      { category: "Protect", income: 150, count: 15 },
    ],
  };

  // Use mock data if real data is not available
  useEffect(() => {
    if (!transactions.length && !loading) {
      setTransactions(mockTransactions);
    }
    if (!stats && !loading) {
      setStats(mockStats);
    }
  }, [transactions, stats, loading]);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor payment and operation transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.overview.income || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats?.overview.depositCount || 0} deposits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.overview.averageDeposit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Operations Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.operationsToday || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency((stats?.overview.operationsToday || 0) * 0.005)}{" "}
              in revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalOperations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or description..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="operation">Operations</SelectItem>
                    <SelectItem value="adjustment">Adjustments</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    setFilters({ ...filters, dateRange: value })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setFilters({
                      search: "",
                      type: "all",
                      status: "all",
                      dateRange: "30d",
                    })
                  }
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {transaction.userName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.userEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span
                            className={getTransactionTypeColor(
                              transaction.amount
                            )}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.balanceAfter)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(
                                transaction.status
                              )}`}
                            />
                            <span className="capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats?.trends || []}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="income"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.3}
                        name="Revenue ($)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="operations"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Operations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Operation Type</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byCategory && stats.byCategory.length > 0 ? (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="income"
                          nameKey="category"
                        >
                          {stats.byCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No operation type data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Operations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.byCategory && stats.byCategory.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.byCategory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        label={{
                          value: "Operation Type",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        label={{
                          value: "Revenue ($)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === "income") return formatCurrency(value);
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="income"
                        fill="#4f46e5"
                        name="Revenue"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="count"
                        fill="#10b981"
                        name="Operation Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    No operation type data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <Badge
                  variant={
                    selectedTransaction.status === "completed"
                      ? "default"
                      : selectedTransaction.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedTransaction.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">User</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {selectedTransaction.userName?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedTransaction.userName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTransaction.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p
                  className={`text-xl font-bold ${getTransactionTypeColor(
                    selectedTransaction.amount
                  )}`}
                >
                  {selectedTransaction.amount > 0 ? "+" : ""}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Balance After Transaction
                </p>
                <p className="font-medium">
                  {formatCurrency(selectedTransaction.balanceAfter)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedTransaction(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
