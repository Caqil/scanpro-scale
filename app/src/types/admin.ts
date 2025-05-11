// types/admin.ts

export interface AdminStats {
    users: {
      total: number;
      active: number;
      newThisMonth: number;
      bySubscription: {
        free: number;
        basic: number;
        pro: number;
        enterprise: number;
      };
    };
    revenue: {
      total: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    apiUsage: {
      totalRequests: number;
      byOperation: Record<string, number>;
      topUsers: Array<{
        userId: string;
        name: string;
        email: string;
        requests: number;
        tier: string;
      }>;
    };
    system: {
      health: 'healthy' | 'degraded' | 'down';
      uptime: string;
      serverLoad: number;
      memoryUsage: number;
      diskUsage: number;
    };
  }
  
  export interface AdminUser {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    lastActive: Date | null;
    subscription: {
      tier: string;
      status: string;
      currentPeriodEnd: Date | null;
      paypalSubscriptionId: string | null;
    } | null;
    apiKeys: Array<{
      id: string;
      name: string;
      lastUsed: Date | null;
      permissions: string[];
    }>;
    usage: {
      total: number;
      thisMonth: number;
      lastMonth: number;
    };
  }
  
  export interface ApiUsageData {
    daily: Array<{
      date: string;
      requests: number;
      users: number;
    }>;
    byOperation: Record<string, number>;
    byTier: Record<string, number>;
    topEndpoints: Array<{
      endpoint: string;
      count: number;
      avgResponseTime: number;
    }>;
  }
  
  export interface SubscriptionData {
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
    trends: Array<{
      date: string;
      subscriptions: number;
      revenue: number;
      churn: number;
    }>;
  }