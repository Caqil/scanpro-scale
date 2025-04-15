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
    redirect("/en/login?callbackUrl=/dashboard");
  }

  // Get user data with subscription info and include isEmailVerified field
  // Using only 'include' instead of both 'include' and 'select'
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      apiKeys: true,
    }
  });

  if (!user) {
    redirect("/en/login");
  }

  // Get usage statistics
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
  const totalOperations = Array.isArray(usageStats) ? usageStats.reduce(
    (sum: number, stat: UsageStats) => sum + stat.count, 
    0
  ) : 0;

  // Get usage by operation type
  const operationCounts = Array.isArray(usageStats) ? usageStats.reduce(
    (acc: Record<string, number>, stat: UsageStats) => {
      acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
      return acc;
    },
    {} as Record<string, number>
  ) : {};

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardContent 
        user={user} 
        usageStats={{
          totalOperations,
          operationCounts,
        }}
      />
    </div>
  );
}