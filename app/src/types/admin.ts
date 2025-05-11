export interface ActivityLog {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'error' | 'warning';
  }

export interface RecentActivity {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    resource: string;
    details: string;
    timestamp: Date;
    type: 'user' | 'subscription' | 'api' | 'system';
  }
  
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
    userGrowth: {
      date: string;
      users: number;
      active: number;
    }[];
    recentActivity: RecentActivity[];
  }
  
  export interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
    lastActive: Date | null;
    subscription: {
      tier: string;
      status: string;
      currentPeriodEnd: Date | null;
      paypalSubscriptionId: string | null;
    } | null;
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
    trends: {
      date: string;
      subscriptions: number;
      revenue: number;
      churn: number;
    }[];
  }