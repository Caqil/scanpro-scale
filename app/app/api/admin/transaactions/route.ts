// app/api/admin/transactions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

export async function GET(request: Request) {
  return withAdminAuth(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '25');
      const search = searchParams.get('search') || '';
      const type = searchParams.get('type') || 'all';
      const status = searchParams.get('status') || 'all';
      const dateRange = searchParams.get('dateRange') || '30d';

      // Calculate date range
      let dateFilter = new Date();
      switch (dateRange) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        case 'all':
          dateFilter = new Date(0); // All time
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 30); // Default to 30 days
      }

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        createdAt: { gte: dateFilter }
      };

      // Handle transaction type filter
      if (type !== 'all') {
        switch (type) {
          case 'deposit':
            where.amount = { gt: 0 };
            where.description = { contains: 'Deposit' };
            break;
          case 'operation':
            where.amount = { lt: 0 };
            where.description = { contains: 'Operation' };
            break;
          case 'adjustment':
            where.description = { contains: 'adjustment' };
            break;
        }
      }

      // Handle status filter
      if (status !== 'all') {
        where.status = status;
      }

      // Handle search
      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { 
            user: { 
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }
          }
        ];
      }

      // Get transactions with pagination
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.count({ where })
      ]);

      // Format transactions for response
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        userName: tx.user?.name || 'Unknown',
        userEmail: tx.user?.email || 'Unknown',
        amount: tx.amount,
        balanceAfter: tx.balanceAfter,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt.toISOString()
      }));

      return NextResponse.json({
        transactions: formattedTransactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }
  });
}