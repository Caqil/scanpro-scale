// app/[lang]/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "./dashboard-content";

// Define the UsageStats type based on your Prisma schema
type UsageStats = {
  id: string;
  userId: string;
  operation: string;
  count: number;
  date: Date;
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
  let recentTransactions = [];
  try {
    recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5, // Get 5 most recent transactions
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    // Continue without transactions if there's an error
  }

  // Check if user's free operations reset date is past and should be reset
  const now = new Date();
  if (user.freeOperationsReset && user.freeOperationsReset < now) {
    try {
      // Calculate new reset date (first day of next month)
      const nextResetDate = new Date();
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

      // Update local user object to reflect the reset
      user.freeOperationsUsed = 0;
      user.freeOperationsReset = nextResetDate;
    } catch (resetError) {
      console.error("Error resetting free operations:", resetError);
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent
        user={{
          ...user,
          transactions: recentTransactions,
        }}
        usageStats={{
          totalOperations,
          operationCounts,
        }}
      />
    </div>
  );
}
