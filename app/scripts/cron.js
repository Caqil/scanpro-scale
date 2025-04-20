// scripts/cron.js

const { PrismaClient } = require('@prisma/client');
const { checkExpiringSubscriptions, processExpiredSubscriptions, resetMonthlyUsage } = require('../lib/subscription-jobs');
const { cleanupFiles, cleanupExpiredResetTokens } = require('../lib/cleanup-service');

// Initialize Prisma client
const prisma = new PrismaClient();

async function runCronJobs() {
  console.log('Running scheduled tasks at:', new Date().toISOString());
  
  try {
    // Subscription-related tasks
    const remindersSent = await checkExpiringSubscriptions();
    console.log(`- Sent ${remindersSent} subscription renewal reminders`);
    
    const expiredProcessed = await processExpiredSubscriptions();
    console.log(`- Processed ${expiredProcessed} expired subscriptions`);
    
    const usageResets = await resetMonthlyUsage();
    console.log(`- Reset usage for ${usageResets} subscriptions`);
    
    // Cleanup tasks
    const cleanupResult = await cleanupFiles(1440); // 24 hours (1440 minutes)
    console.log(`- Cleaned up ${cleanupResult.stats?.totalCleaned || 0} temporary files (${(cleanupResult.stats?.totalSize || 0) / (1024 * 1024)} MB)`);
    
    const tokensDeleted = await cleanupExpiredResetTokens();
    console.log(`- Deleted ${tokensDeleted.count} expired password reset tokens`);
    
    console.log('All tasks completed successfully!');
  } catch (error) {
    console.error('Error running cron jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the jobs
runCronJobs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in cron jobs:', err);
    process.exit(1);
  });