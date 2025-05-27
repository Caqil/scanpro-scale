export interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    balance: number;
    freeOperationsUsed: number;
    freeOperationsRemaining: number;
    subscription?: {
      tier: string;
      status: string;
    } | null;
    lastActive: Date | null;
    createdAt: Date;
    usage: {
      thisMonth: number;
      lastMonth: number;
      total: number;
    };
    apiKeys: {
      id: string;
      name: string;
      permissions: string[];
      lastUsed: Date | null;
    }[];
  }
  
  export interface AdminStats {
    users: {
      total: number;
      active: number;
      newThisMonth: number;
      bySubscription: Record<string, number>;
    };
    revenue?: {
      thisMonth: number;
      growth: number;
    };
    apiUsage: {
      totalRequests: number;
      byOperation: Record<string, number>;
    };
    system: {
      health: string;
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
    recentActivity: {
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      action: string;
      details: string;
      timestamp: string;
      type: string;
    }[];
  }
  
  export interface ApiUsageData {
    daily: {
      date: string;
      requests: number;
      users: number;
    }[];
    byOperation: Record<string, number>;
    byTier: Record<string, number>;
    topEndpoints: {
      endpoint: string;
      count: number;
      avgResponseTime: number;
    }[];
  }
  
  export interface Transaction {
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