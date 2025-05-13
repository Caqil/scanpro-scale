// app/api/admin/activity/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';
import { ActivityLog } from '@/src/types/admin';

export async function GET(request: Request) {
  return withAdminAuth(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search') || '';
      const type = searchParams.get('type') || 'all';
      const status = searchParams.get('status') || 'all';
      const timeRange = searchParams.get('timeRange') || '24h';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      // Calculate date range
      const now = new Date();
      let dateFilter = new Date();
      
      switch (timeRange) {
        case '1h':
          dateFilter.setHours(dateFilter.getHours() - 1);
          break;
        case '24h':
          dateFilter.setHours(dateFilter.getHours() - 24);
          break;
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        default:
          dateFilter = new Date(0); // All time
      }

      const activities: ActivityLog[] = [];

      // Get API usage logs
      if (type === 'all' || type === 'api') {
        const apiLogs = await prisma.usageStats.findMany({
          where: {
            date: { gte: dateFilter },
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          include: {
            user: true,
          },
          orderBy: { date: 'desc' },
          take: limit,
        });

        apiLogs.forEach((log) => {
          activities.push({
            id: log.id,
            timestamp: log.date.toISOString(),
            userId: log.userId,
            userName: log.user.name || 'Unknown',
            userEmail: log.user.email || 'Unknown',
            action: 'api.call',
            resource: log.operation,
            details: `API call to ${log.operation} operation (${log.count} times)`,
            ipAddress: '127.0.0.1', // You'd need to track this separately
            userAgent: 'API Client', // You'd need to track this separately
            status: 'success',
          });
        });
      }

      // Get authentication logs (login/logout)
      if (type === 'all' || type === 'auth') {
        // Get recent sessions
        const sessions = await prisma.session.findMany({
          where: {
            AND: [
              { expires: { gte: dateFilter } },
              {
                user: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
          include: {
            user: true,
          },
          orderBy: { expires: 'desc' },
          take: Math.floor(limit / 3),
        });

        sessions.forEach((session) => {
          // Simulate login activity
          const loginTime = new Date(session.expires);
          loginTime.setHours(loginTime.getHours() - 24); // Assume 24h session
          
          activities.push({
            id: `session-${session.id}`,
            timestamp: loginTime.toISOString(),
            userId: session.userId,
            userName: session.user.name || 'Unknown',
            userEmail: session.user.email || 'Unknown',
            action: 'login',
            resource: 'auth',
            details: 'User logged in',
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            status: 'success',
          });
        });

        // Get user registrations
        const newUsers = await prisma.user.findMany({
          where: {
            createdAt: { gte: dateFilter },
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: Math.floor(limit / 3),
        });

        newUsers.forEach((user) => {
          activities.push({
            id: `reg-${user.id}`,
            timestamp: user.createdAt.toISOString(),
            userId: user.id,
            userName: user.name || 'Unknown',
            userEmail: user.email || 'Unknown',
            action: 'registration',
            resource: 'auth',
            details: 'New user registration',
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            status: 'success',
          });
        });
      }

      // Get transaction activities (replaces subscription activities)
      if (type === 'all' || type === 'transaction') {
        const transactions = await prisma.transaction.findMany({
          where: {
            createdAt: { gte: dateFilter },
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
          take: Math.floor(limit / 3),
        });

        transactions.forEach((transaction) => {
          // Determine transaction type based on amount and description
          let action = 'transaction';
          let details = '';
          
          if (transaction.amount > 0) {
            action = 'balance.deposit';
            details = `Deposited $${transaction.amount.toFixed(2)} to account balance`;
          } else if (transaction.amount < 0) {
            action = 'balance.charge';
            details = `Charged $${Math.abs(transaction.amount).toFixed(2)} for operation`;
            if (transaction.description.includes('Operation')) {
              const operationMatch = transaction.description.match(/Operation: (\w+)/);
              if (operationMatch && operationMatch[1]) {
                details += ` (${operationMatch[1]})`;
              }
            }
          } else {
            action = 'balance.adjustment';
            details = 'Balance adjustment';
          }
            
          activities.push({
            id: `txn-${transaction.id}`,
            timestamp: transaction.createdAt.toISOString(),
            userId: transaction.userId,
            userName: transaction.user.name || 'Unknown',
            userEmail: transaction.user.email || 'Unknown',
            action,
            resource: 'transaction',
            details,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            status: transaction.status === 'completed' ? 'success' : 
                   transaction.status === 'pending' ? 'warning' : 'error',
          });
        });
      }

      // Get API key activities
      if (type === 'all' || type === 'api') {
        const apiKeys = await prisma.apiKey.findMany({
          where: {
            createdAt: { gte: dateFilter },
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
          take: Math.floor(limit / 4),
        });

        apiKeys.forEach((apiKey) => {
          activities.push({
            id: `key-${apiKey.id}`,
            timestamp: apiKey.createdAt.toISOString(),
            userId: apiKey.userId,
            userName: apiKey.user.name || 'Unknown',
            userEmail: apiKey.user.email || 'Unknown',
            action: 'api.key.create',
            resource: 'api_key',
            details: `Created API key: ${apiKey.name}`,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            status: 'success',
          });
        });
      }

      // Filter by status if specified
      let filteredActivities = activities;
      if (status !== 'all') {
        filteredActivities = activities.filter(activity => activity.status === status);
      }

      // Sort by timestamp
      filteredActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedActivities = filteredActivities.slice(skip, skip + limit);

      // Get some statistics
      const stats = {
        totalActivities: filteredActivities.length,
        byType: {
          auth: filteredActivities.filter(a => a.resource === 'auth').length,
          api: filteredActivities.filter(a => a.resource.includes('api') || a.action.includes('api')).length,
          transaction: filteredActivities.filter(a => a.resource === 'transaction').length,
          system: 0, // You can add system events if needed
        },
        byStatus: {
          success: filteredActivities.filter(a => a.status === 'success').length,
          error: filteredActivities.filter(a => a.status === 'error').length,
          warning: filteredActivities.filter(a => a.status === 'warning').length,
        },
      };

      return NextResponse.json({
        activities: paginatedActivities,
        total: filteredActivities.length,
        page,
        limit,
        totalPages: Math.ceil(filteredActivities.length / limit),
        stats,
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }
  });
}