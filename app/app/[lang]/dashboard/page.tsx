// app/[lang]/dashboard/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "./dashboard-content";
import { FREE_OPERATIONS_MONTHLY } from "@/lib/validate-key";

// Define the UsageStats type based on your Prisma schema
type UsageStats = {
  id: string;
  userId: string;
  operation: string;
  count: number;
  date: Date;
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
  createdAt: Date;
};

export default async function DashboardPage() {
  // Get the server session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/en/login?callbackUrl=/dashboard`);
  }

  // Get user data with balance info and API keys
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      freeOperationsUsed: true,
      freeOperationsReset: true,
      isEmailVerified: true,
      apiKeys: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect(`/en/login`);
  }

  // Check if user is admin and redirect to admin dashboard
  if (user.role === "admin") {
    redirect(`/en/admin/dashboard`);
  }

  // Get usage statistics for regular users
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  let usageStats: UsageStats[] = [];
  try {
    usageStats = await prisma.usageStats.findMany({
      where: {
        userId: user.id,
        date: { gte: firstDayOfMonth },
      },
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    // Continue with empty stats if there's an error
  }

  // Calculate total operations and make sure usageStats exists
  const totalOperations = Array.isArray(usageStats)
    ? usageStats.reduce((sum: number, stat: UsageStats) => sum + stat.count, 0)
    : 0;

  // Get usage by operation type
  const operationCounts = Array.isArray(usageStats)
    ? usageStats.reduce((acc: Record<string, number>, stat: UsageStats) => {
        acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
        return acc;
      }, {} as Record<string, number>)
    : {};

  // Get recent transactions
  let recentTransactions: Transaction[] = [];
  try {
    recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10, // Get 10 most recent transactions
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    // Continue without transactions if there's an error
  }

  // Check if user's free operations reset date is past and should be reset
  const now = new Date();
  let effectiveFreeOpsUsed = user.freeOperationsUsed || 0;
  let nextResetDate = user.freeOperationsReset;

  if (user.freeOperationsReset && user.freeOperationsReset < now) {
    try {
      // Calculate new reset date (first day of next month)
      nextResetDate = new Date();
      nextResetDate.setDate(1);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      nextResetDate.setHours(0, 0, 0, 0);

      // Reset the free operations counter
      await prisma.user.update({
        where: { id: user.id },
        data: {
          freeOperationsUsed: 0,
          freeOperationsReset: nextResetDate,
        },
      });

      // Update local variable to reflect the reset
      effectiveFreeOpsUsed = 0;
    } catch (resetError) {
      console.error("Error resetting free operations:", resetError);
    }
  }

  // Calculate remaining free operations
  const freeOperationsRemaining = Math.max(
    0,
    FREE_OPERATIONS_MONTHLY - effectiveFreeOpsUsed
  );

  // Format the reset date for display
  const resetDateFormatted = nextResetDate
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(nextResetDate)
    : "Unknown";

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent
        user={{
          ...user,
          freeOperationsUsed: effectiveFreeOpsUsed,
          freeOperationsRemaining,
          freeOperationsResetDate: resetDateFormatted,
          transactions: recentTransactions,
          balance: user.balance || 0,
        }}
        usageStats={{
          totalOperations,
          operationCounts,
        }}
      />
    </div>
  );
}
