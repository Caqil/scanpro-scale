"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/auth-context";
import { DashboardContent } from "./dashboard-content";
import { FREE_OPERATIONS_MONTHLY } from "@/lib/validate-key";

// Define the UsageStats type
type UsageStats = {
  id: string;
  userId: string;
  operation: string;
  count: number;
  date: string;
};

// Define the Transaction type
type Transaction = {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  description: string;
  paymentId: string | null;
  status: string;
  createdAt: string;
};

// Define the User type
type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  balance: number | null;
  freeOperationsUsed: number | null;
  freeOperationsReset: string | null;
  isEmailVerified: boolean;
  apiKeys: any[];
  createdAt: string;
};

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [totalOperations, setTotalOperations] = useState(0);
  const [operationCounts, setOperationCounts] = useState<
    Record<string, number>
  >({});
  const [effectiveFreeOpsUsed, setEffectiveFreeOpsUsed] = useState(0);
  const [freeOperationsRemaining, setFreeOperationsRemaining] = useState(
    FREE_OPERATIONS_MONTHLY
  );
  const [resetDateFormatted, setResetDateFormatted] = useState("Unknown");

  useEffect(() => {
    if (isLoading) return;

    // Redirect to login if not authenticated or no user
    if (!isAuthenticated || !user) {
      router.push("/en/login?callbackUrl=/en/dashboard");
      return;
    }

    // Fetch data from API
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/user?id=${user.id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData: User = await userResponse.json();
        if (!userData) {
          router.push("/en/login?callbackUrl=/en/dashboard");
          return;
        }

        // Redirect to admin dashboard if user is admin
        if (userData.role === "admin") {
          router.push("/en/admin/dashboard");
          return;
        }

        setUserData(userData);

        // Fetch usage statistics
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const statsResponse = await fetch(
          `/api/usage-stats?userId=${
            userData.id
          }&dateGte=${firstDayOfMonth.toISOString()}`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch usage stats");
        }
        const stats: UsageStats[] = await statsResponse.json();
        setUsageStats(stats);

        // Calculate total operations
        const total = stats.reduce((sum, stat) => sum + stat.count, 0);
        setTotalOperations(total);

        // Get usage by operation type
        const counts = stats.reduce((acc: Record<string, number>, stat) => {
          acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
          return acc;
        }, {});
        setOperationCounts(counts);

        // Fetch recent transactions
        const transactionsResponse = await fetch(
          `/api/transactions?userId=${userData.id}&limit=10`,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const transactions: Transaction[] = await transactionsResponse.json();
        setRecentTransactions(transactions);

        // Handle free operations reset
        const now = new Date();
        let freeOpsUsed = userData.freeOperationsUsed || 0;
        let nextResetDate = userData.freeOperationsReset
          ? new Date(userData.freeOperationsReset)
          : null;

        if (nextResetDate && nextResetDate < now) {
          try {
            // Calculate new reset date
            nextResetDate = new Date();
            nextResetDate.setDate(1);
            nextResetDate.setMonth(nextResetDate.getMonth() + 1);
            nextResetDate.setHours(0, 0, 0, 0);

            // Update free operations via API
            const resetResponse = await fetch("/api/user/reset-operations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userData.id,
                freeOperationsUsed: 0,
                freeOperationsReset: nextResetDate.toISOString(),
              }),
            });
            if (!resetResponse.ok) {
              throw new Error("Failed to reset free operations");
            }

            freeOpsUsed = 0;
          } catch (resetError) {
            console.error("Error resetting free operations:", resetError);
          }
        }

        setEffectiveFreeOpsUsed(freeOpsUsed);
        setFreeOperationsRemaining(
          Math.max(0, FREE_OPERATIONS_MONTHLY - freeOpsUsed)
        );

        // Format reset date
        const formattedDate = nextResetDate
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(nextResetDate)
          : "Unknown";
        setResetDateFormatted(formattedDate);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        router.push("/en/login?callbackUrl=/en/dashboard");
      }
    };

    fetchData();
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent
        user={{
          ...userData,
          freeOperationsUsed: effectiveFreeOpsUsed,
          freeOperationsRemaining,
          freeOperationsResetDate: resetDateFormatted,
          transactions: recentTransactions,
          balance: userData.balance || 0,
        }}
        usageStats={{
          totalOperations,
          operationCounts,
        }}
      />
    </div>
  );
}
