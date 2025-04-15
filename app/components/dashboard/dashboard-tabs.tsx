import type React from "react"
import type { User } from "@prisma/client"

interface DashboardTabsProps {
  user: User & {
    subscription: {
      id: string
      userId: string
      tier: string
      createdAt: Date
      updatedAt: Date
      expiresAt: Date | null
    } | null
    apiKeys: {
      id: string
      userId: string
      name: string
      key: string
      permissions: string[]
      lastUsed: Date | null
      expiresAt: Date | null
      createdAt: Date
    }[]
  }
  usageStats: {
    totalOperations: number
    operationCounts: Record<string, number>
  }
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ user, usageStats }) => {
  return (
    <div>
      <h2>User Information</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Subscription Tier: {user.subscription?.tier || "Free"}</p>

      <h2>API Key Information</h2>
      {user.apiKeys.length > 0 ? (
        <ul>
          {user.apiKeys.map((key) => (
            <li key={key.id}>
              {key.name} - {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No API keys found.</p>
      )}

      <h2>Usage Statistics</h2>
      <p>Total Operations: {usageStats.totalOperations}</p>
      <ul>
        {Object.entries(usageStats.operationCounts).map(([operation, count]) => (
          <li key={operation}>
            {operation}: {count}
          </li>
        ))}
      </ul>
    </div>
  )
}

