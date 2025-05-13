// src/types/admin.ts
export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  lastActive: Date;
  subscription?: {
    tier: string;
    status: string;
    currentPeriodEnd?: Date | null;
    paypalSubscriptionId?: string | null;
  } | null;
  balance?: number;
  freeOperationsUsed?: number;
  freeOperationsRemaining?: number;
  apiKeys: {
    id: string;
    name: string;
    lastUsed: Date | null;
    permissions: string[];
  }[];
  usage: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
};

export type RecentActivity = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  timestamp: Date | string;
  type: 'user' | 'api' | 'subscription' | 'system';
};


export type ApiUsageData = {
  daily: {
    date: string;
    requests: number;
    users: number;
    revenue: number;
  }[];
  byOperation: Record<string, number>;
  byTier: {
    free: number;
    paid: number;
    basic?: number; // Backward compatibility
    pro?: number; // Backward compatibility
    enterprise?: number; // Backward compatibility
  };
  topEndpoints: {
    endpoint: string;
    count: number;
    avgResponseTime: number;
  }[];
  topUsers?: {
    userId: string;
    name: string;
    email: string;
    requests: number;
    balance?: number;
    tier?: string;
  }[];
  revenue?: {
    total: number;
    byOperation: Record<string, number>;
  };
};

export type SubscriptionData = {
  overview: {
    total: number;
    active: number;
    canceled: number;
    revenue: {
      monthly: number;
      annual: number;
    };
  };
  byTier: Record<string, {
    count: number;
    revenue: number;
    churnRate: number;
  }>;
  trends: {
    date: string;
    subscriptions: number;
    revenue: number;
    churn: number;
  }[];
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'error' | 'warning';
};

export type AdminStats = {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    bySubscription: {
      free: number;
      paid: number;
      inactive: number;
      // Backward compatibility fields
      basic?: number;
      pro?: number;
      enterprise?: number;
    };
  };
  apiUsage: {
    totalRequests: number;
    byOperation: Record<string, number>;
    topUsers: {
      userId: string;
      name: string;
      email: string;
      requests: number;
      balance?: number;
      tier?: string;
    }[];
  };
  revenue?: {
    thisMonth: number;
    growth: number;
    annual: number;
  };
  system: {
    health: 'healthy' | 'degraded' | 'down';
    uptime: string;
    serverLoad: number;
    memoryUsage: number;
    diskUsage: number;
  };
  userGrowth: {
    date: string;
    users: number;
    active: number;
  }[];
  recentActivity: RecentActivity[];
};