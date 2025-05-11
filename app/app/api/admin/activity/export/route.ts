// app/api/admin/activity/export/route.ts
import { NextResponse } from 'next/server';
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
      
      // Get the same filters as the main activity endpoint
      const params = new URLSearchParams({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || 'all',
        status: searchParams.get('status') || 'all',
        timeRange: searchParams.get('timeRange') || '24h',
        page: '1',
        limit: '10000', // Get more records for export
      });

      // Fetch activities using the same endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/activity?${params}`, {
        headers: request.headers, // Forward auth headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities for export');
      }

      const data = await response.json();
      
      // Format activities for CSV export
      const csvData = data.activities.map((activity: any) => ({
        Timestamp: new Date(activity.timestamp).toISOString(),
        'User Name': activity.userName,
        'User Email': activity.userEmail,
        Action: activity.action,
        Resource: activity.resource,
        Details: activity.details,
        Status: activity.status,
        'IP Address': activity.ipAddress,
        'User Agent': activity.userAgent,
      }));

      // Convert to CSV
      const csv = convertToCSV(csvData);

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } catch (error) {
      console.error('Error exporting activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to export activity logs' },
        { status: 500 }
      );
    }
  });
}