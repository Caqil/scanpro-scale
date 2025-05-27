"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/auth";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Eye,
} from "lucide-react";

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  balanceAfter?: number;
  description: string;
  status: string;
  createdAt: string;
  user?: {
    email: string;
    name?: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "30d",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions`
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        console.error("Failed to fetch transactions");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions/export?${params}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
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
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTransactionTypeColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || transaction.status === filters.status;

    const matchesType =
      filters.type === "all" ||
      (filters.type === "deposit" && transaction.amount > 0) ||
      (filters.type === "operation" && transaction.amount < 0);

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.amount > 0 && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  ).length;
  const successRate =
    totalTransactions > 0
      ? (completedTransactions / totalTransactions) * 100
      : 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor payment and operation transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTransactions}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            From completed transactions
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Transactions</h3>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{totalTransactions}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Success Rate</h3>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Completed vs total</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Completed</h3>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{completedTransactions}</div>
          <p className="text-xs text-muted-foreground">
            Successful transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by user or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="operation">Operations</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters({ ...filters, dateRange: e.target.value })
            }
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() =>
              setFilters({ type: "all", status: "all", dateRange: "30d" })
            }
            className="px-3 py-2 border border-border rounded-md hover:bg-muted"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-medium">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {totalTransactions} transactions
          </p>
        </div>

        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">
                      <div className="flex items-center gap-2">
                        User
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-2">
                      <div className="flex items-center gap-2">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">
                      <div className="flex items-center gap-2">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">
                            {transaction.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user?.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`font-medium ${getTransactionTypeColor(
                            transaction.amount
                          )}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </span>
                        {transaction.balanceAfter && (
                          <p className="text-xs text-muted-foreground">
                            Balance: {formatCurrency(transaction.balanceAfter)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">
                          {transaction.description}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Transaction Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{selectedTransaction.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <p className="font-medium">
                  {selectedTransaction.user?.name || "Unknown"}
                </p>
                <p className="text-sm">{selectedTransaction.user?.email}</p>
              </div>

              <div>
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

              {selectedTransaction.balanceAfter && (
                <div>
                  <p className="text-sm text-muted-foreground">Balance After</p>
                  <p className="font-medium">
                    {formatCurrency(selectedTransaction.balanceAfter)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {formatDate(selectedTransaction.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
