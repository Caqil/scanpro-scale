// app/api/admin/usage/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import { ApiUsageData } from '@/src/types/admin';

export async function GET() {
  return withAdminAuth(async () => {
    // Get daily usage for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage = await prisma.usageStats.groupBy({
      by: ['date'],
      where: {
        date: { gte: thirtyDaysAgo }
      },
      _sum: { count: true },
      _count: { userId: true },
      orderBy: { date: 'asc' }
    });

    // Format daily usage data
    const daily = dailyUsage.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: day._sum.count || 0,
      users: day._count.userId || 0,
    }));

    // Get usage by operation
    const operationUsage = await prisma.usageStats.groupBy({
      by: ['operation'],
      _sum: { count: true },
      orderBy: { _sum: { count: 'desc' } }
    });

    const byOperation: Record<string, number> = {};
    operationUsage.forEach(op => {
      byOperation[op.operation] = op._sum.count || 0;
    });

    // Get usage by subscription tier
    const tierUsage = await prisma.usageStats.findMany({
      select: {
        count: true,
        user: {
          select: {
            subscription: {
              select: { tier: true }
            }
          }
        }
      }
    });

    const byTier: Record<string, number> = {
      free: 0,
      basic: 0,
      pro: 0,
      enterprise: 0,
    };

    tierUsage.forEach(usage => {
      const tier = usage.user.subscription?.tier || 'free';
      byTier[tier] = (byTier[tier] || 0) + usage.count;
    });

    // Mock top endpoints data
    const topEndpoints = [
      { endpoint: '/api/pdf/convert', count: 15420, avgResponseTime: 245 },
      { endpoint: '/api/pdf/compress', count: 12350, avgResponseTime: 180 },
      { endpoint: '/api/pdf/merge', count: 8900, avgResponseTime: 320 },
      { endpoint: '/api/pdf/split', count: 6750, avgResponseTime: 150 },
      { endpoint: '/api/ocr', count: 5200, avgResponseTime: 1200 },
      { endpoint: '/api/pdf/watermark', count: 4100, avgResponseTime: 200 },
      { endpoint: '/api/pdf/protect', count: 3500, avgResponseTime: 160 },
      { endpoint: '/api/pdf/unlock', count: 2800, avgResponseTime: 140 },
    ];

    const usageData: ApiUsageData = {
      daily,
      byOperation,
      byTier,
      topEndpoints,
    };

    return NextResponse.json(usageData);
  });
}