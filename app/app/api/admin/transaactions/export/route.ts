// app/api/admin/transactions/export/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert each object to CSV row
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

export async function GET(request: Request) {
  return withAdminAuth(async () => {
    try {
      const { searchParams } = new URL(request.url);
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

      // Get all matching transactions (no pagination for export)
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Format transactions for CSV
      const formattedTransactions = transactions.map(tx => ({
        TransactionID: tx.id,
        UserID: tx.userId,
        UserName: tx.user?.name || 'Unknown',
        UserEmail: tx.user?.email || 'Unknown',
        Amount: tx.amount,
        BalanceAfter: tx.balanceAfter,
        Description: tx.description,
        Status: tx.status,
        CreatedAt: tx.createdAt.toISOString()
      }));

      // Convert to CSV
      const csv = convertToCSV(formattedTransactions);

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } catch (error) {
      console.error('Error exporting transactions:', error);
      return NextResponse.json(
        { error: 'Failed to export transactions' },
        { status: 500 }
      );
    }
  });
}