// scripts/usage-reset-hourly.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetExpiredSubscriptionUsage() {
  try {
    const now = new Date();
    console.log(`Checking for expired subscription periods at: ${now.toISOString()}`);
    
    // Find subscriptions that have passed their period end
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: now
        }
      },
      include: {
        user: true
      }
    });
    
    if (expiredSubscriptions.length === 0) {
      console.log('No subscriptions need usage reset at this time');
      return 0;
    }
    
    console.log(`Found ${expiredSubscriptions.length} subscriptions to reset`);
    
    let resetCount = 0;
    for (const subscription of expiredSubscriptions) {
      // Calculate new period dates
      const newPeriodStart = new Date(subscription.currentPeriodEnd);
      const newPeriodEnd = new Date(newPeriodStart);
      
      // Add one month for monthly subscriptions
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      // Delete all usage stats for this user
      await prisma.usageStats.deleteMany({
        where: { userId: subscription.userId }
      });
      
      // Update subscription with new period
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          usageResetDate: newPeriodStart
        }
      });
      
      resetCount++;
      console.log(`Reset usage for user ${subscription.userId} - Period: ${newPeriodStart.toISOString()} to ${newPeriodEnd.toISOString()}`);
    }
    
    console.log(`Successfully reset usage for ${resetCount} subscriptions`);
    return resetCount;
  } catch (error) {
    console.error('Error in usage reset:', error);
    throw error;
  }
}

async function run() {
  try {
    const resetCount = await resetExpiredSubscriptionUsage();
    console.log(`Completed. Total resets: ${resetCount}`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

run();