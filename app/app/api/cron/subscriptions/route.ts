// app/api/cron/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  checkExpiringSubscriptions, 
  processExpiredSubscriptions, 
  checkAndResetUsage 
} from '@/lib/paypal';

// This endpoint will be called by a cron job service like Vercel Cron or an external tool
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = request.headers.get('x-cron-secret');
    const configuredSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || cronSecret !== configuredSecret) {
      console.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the job type from query parameters
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('job') || 'all';
    
    const results: Record<string, any> = {};
    
    console.log(`Running subscription cron job: ${jobType}`);
    
    // Run all jobs or specific ones based on the job parameter
    if (jobType === 'all' || jobType === 'check-expiring') {
      const remindersSent = await checkExpiringSubscriptions();
      results.remindersSent = remindersSent;
    }
    
    if (jobType === 'all' || jobType === 'process-expired') {
      const processedCount = await processExpiredSubscriptions();
      results.processedExpired = processedCount;
    }
    
    if (jobType === 'all' || jobType === 'reset-usage') {
      const resetCount = await checkAndResetUsage();
      results.usageReset = resetCount;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}