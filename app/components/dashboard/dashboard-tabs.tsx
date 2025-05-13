import type React from "react";
import type { User } from "@prisma/client";

interface DashboardTabsProps {
  user: User & {
    balance: number;
    freeOperationsUsed: number;
    freeOperationsReset: Date;
    apiKeys: {
      id: string;
      userId: string;
      name: string;
      key: string;
      permissions: string[];
      lastUsed: Date | null;
      expiresAt: Date | null;
      createdAt: Date;
    }[];
  };
  usageStats: {
    totalOperations: number;
    operationCounts: Record<string, number>;
  };
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  user,
  usageStats,
}) => {
  // Calculate free operations remaining
  const FREE_OPERATIONS_MONTHLY = 500;
  const freeOperationsRemaining = Math.max(
    0,
    FREE_OPERATIONS_MONTHLY - user.freeOperationsUsed
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <h2>User Information</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>

      <h2>Account Balance</h2>
      <p>Current Balance: ${user.balance.toFixed(2)}</p>
      <p>
        Free Operations Remaining: {freeOperationsRemaining} of{" "}
        {FREE_OPERATIONS_MONTHLY}
      </p>
      <p>Next Reset: {formatDate(user.freeOperationsReset)}</p>

      <h2>API Key Information</h2>
      {user.apiKeys.length > 0 ? (
        <ul>
          {user.apiKeys.map((key) => (
            <li key={key.id}>
              {key.name} - {key.key.substring(0, 8)}...
              {key.key.substring(key.key.length - 4)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No API keys found.</p>
      )}

      <h2>Usage Statistics</h2>
      <p>Total Operations: {usageStats.totalOperations}</p>
      <ul>
        {Object.entries(usageStats.operationCounts).map(
          ([operation, count]) => (
            <li key={operation}>
              {operation}: {count}
            </li>
          )
        )}
      </ul>
    </div>
  );
};
