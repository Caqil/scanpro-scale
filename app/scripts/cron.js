// scripts/cron.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetSubscriptionUsage() {
  try {
    const today = new Date();
    
    // Find subscriptions where the current period has ended
    const subscriptionsToReset = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: today
        }
      },
      include: {
        user: true
      }
    });
    
    console.log(`Found ${subscriptionsToReset.length} subscriptions to reset`);
    
    let resetCount = 0;
    for (const subscription of subscriptionsToReset) {
      // Calculate new period dates
      const currentPeriodStart = new Date(subscription.currentPeriodEnd);
      const currentPeriodEnd = new Date(currentPeriodStart);
      
      // For monthly subscriptions
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      
      // Delete existing usage stats
      await prisma.usageStats.deleteMany({
        where: { userId: subscription.userId }
      });
      
      // Update subscription with new period
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart,
          currentPeriodEnd,
          usageResetDate: currentPeriodStart
        }
      });
      
      resetCount++;
      console.log(`Reset usage for user ${subscription.userId} - New period: ${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`);
    }
    
    return resetCount;
  } catch (error) {
    console.error('Error resetting subscription usage:', error);
    throw error;
  }
}

async function runCronJobs() {
  console.log('Running scheduled tasks at:', new Date().toISOString());
  
  try {
    // Other cron tasks
    const remindersSent = await checkExpiringSubscriptions();
    console.log(`- Sent ${remindersSent} subscription renewal reminders`);
    
    const expiredProcessed = await processExpiredSubscriptions();
    console.log(`- Processed ${expiredProcessed} expired subscriptions`);
    
    // Reset usage based on subscription periods
    const usageResets = await resetSubscriptionUsage();
    console.log(`- Reset usage for ${usageResets} subscriptions`);
    
    console.log('All tasks completed successfully!');
  } catch (error) {
    console.error('Error running cron jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runCronJobs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in cron jobs:', err);
    process.exit(1);
  });