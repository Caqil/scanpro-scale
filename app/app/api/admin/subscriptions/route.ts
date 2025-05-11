// app/api/admin/subscriptions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import { SubscriptionData } from '@/src/types/admin';

export async function GET() {
  return withAdminAuth(async () => {
    // Get subscription overview
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' }
    });
    const canceledSubscriptions = await prisma.subscription.count({
      where: { status: 'canceled' }
    });

    // Calculate monthly revenue
    const activeRevenue = await prisma.subscription.groupBy({
      by: ['tier'],
      where: { status: 'active' },
      _count: true,
    });

    const tierPrices: {
        free: number;
        basic: number;
        pro: number;
        enterprise: number;
        [key: string]: number; // Index signature
      } = {
        free: 0,
        basic: 9.99,
        pro: 19.99,
        enterprise: 49.99,
      };

    let monthlyRevenue = 0;
    activeRevenue.forEach(item => {
      monthlyRevenue += (item._count * tierPrices[item.tier as keyof typeof tierPrices]);
    });

    const annualRevenue = monthlyRevenue * 12;

    // Get subscriptions by tier with revenue
    const tierData: Record<string, { count: number; revenue: number; churnRate: number }> = {
      free: { count: 0, revenue: 0, churnRate: 0 },
      basic: { count: 0, revenue: 0, churnRate: 0 },
      pro: { count: 0, revenue: 0, churnRate: 0 },
      enterprise: { count: 0, revenue: 0, churnRate: 0 },
    };

    // Count active subscriptions by tier
    const activeTierCounts = await prisma.subscription.groupBy({
      by: ['tier'],
      where: { status: 'active' },
      _count: true,
    });

    activeTierCounts.forEach(item => {
      const tier = item.tier as keyof typeof tierData;
      tierData[tier].count = item._count;
      tierData[tier].revenue = item._count * tierPrices[tier];
    });

    // Calculate churn rate by tier (mock data for now)
    Object.keys(tierData).forEach(tier => {
      // Simulate churn rates
      const churnRates = {
        free: 0,
        basic: 5.2,
        pro: 2.8,
        enterprise: 1.5,
      };
      tierData[tier as keyof typeof tierData].churnRate = churnRates[tier as keyof typeof churnRates];
    });

    // Get subscription trends (mock data for now)
    const trends = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Simulate growth trend
      const baseSubscriptions = 800 + i * 50;
      const baseRevenue = baseSubscriptions * 15; // average revenue per subscription
      
      trends.push({
        date: month,
        subscriptions: baseSubscriptions + Math.floor(Math.random() * 100),
        revenue: baseRevenue + Math.floor(Math.random() * 1000),
        churn: Math.floor(Math.random() * 20) + 10,
      });
    }

    const subscriptionData: SubscriptionData = {
      overview: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        revenue: {
          monthly: monthlyRevenue,
          annual: annualRevenue,
        },
      },
      byTier: tierData,
      trends,
    };

    return NextResponse.json(subscriptionData);
  });
}