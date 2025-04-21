const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to check for subscriptions expiring soon and send reminders
async function checkExpiringSubscriptions() {
  try {
    const today = new Date();
    const reminderThreshold = new Date(today);
    reminderThreshold.setDate(today.getDate() + 7); // Look for subscriptions expiring within 7 days

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: reminderThreshold,
          gte: today,
        },
      },
      include: {
        user: true,
      },
    });

    let remindersSent = 0;
    for (const subscription of expiringSubscriptions) {
      // Placeholder for sending reminder (e.g., via email or notification service)
      console.log(
        `Sending reminder for subscription ${subscription.id} (user ${subscription.userId}) - Expires on ${subscription.currentPeriodEnd.toISOString()}`
      );
      remindersSent++;
    }

    console.log(`Processed ${expiringSubscriptions.length} expiring subscriptions, sent ${remindersSent} reminders`);
    return remindersSent;
  } catch (error) {
    console.error('Error in checkExpiringSubscriptions:', error);
    throw error;
  }
}

// Function to process subscriptions that have expired
async function processExpiredSubscriptions() {
  try {
    const today = new Date();
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lt: today,
        },
      },
    });

    let expiredCount = 0;
    for (const subscription of expiredSubscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });
      console.log(`Marked subscription ${subscription.id} as expired`);
      expiredCount++;
    }

    console.log(`Processed ${expiredSubscriptions.length} subscriptions, marked ${expiredCount} as expired`);
    return expiredCount;
  } catch (error) {
    console.error('Error in processExpiredSubscriptions:', error);
    throw error;
  }
}

// Function to reset usage for subscriptions whose period has ended
async function resetSubscriptionUsage() {
  try {
    const today = new Date();
    console.log(`Starting subscription usage reset at ${today.toISOString()}`);

    const subscriptionsToReset = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lte: today,
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`Found ${subscriptionsToReset.length} subscriptions to reset`);

    let resetCount = 0;
    for (const subscription of subscriptionsToReset) {
      try {
        // Validate currentPeriodEnd
        if (!subscription.currentPeriodEnd || isNaN(new Date(subscription.currentPeriodEnd).getTime())) {
          console.error(`Invalid currentPeriodEnd for subscription ${subscription.id}`);
          continue;
        }

        // Calculate new period dates
        const currentPeriodStart = new Date(subscription.currentPeriodEnd);
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        // Delete existing usage stats
        await prisma.usageStats.deleteMany({
          where: { userId: subscription.userId },
        });

        // Update subscription with new period
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            currentPeriodStart,
            currentPeriodEnd,
            usageResetDate: currentPeriodStart,
          },
        });

        resetCount++;
        console.log(
          `Reset usage for user ${subscription.userId} (subscription ${subscription.id}) - New period: ${currentPeriodStart.toISOString()} to ${currentPeriodEnd.toISOString()}`
        );
      } catch (error) {
        console.error(`Failed to reset subscription ${subscription.id}:`, error);
      }
    }

    console.log(`Successfully reset ${resetCount} subscriptions`);
    return resetCount;
  } catch (error) {
    console.error('Error in resetSubscriptionUsage:', error);
    throw error;
  }
}

// Main function to run all cron tasks
async function runCronJobs() {
  console.log('Running scheduled tasks at:', new Date().toISOString());

  try {
    // Check expiring subscriptions and send reminders
    const remindersSent = await checkExpiringSubscriptions();
    console.log(`- Sent ${remindersSent} subscription renewal reminders`);

    // Process expired subscriptions
    const expiredProcessed = await processExpiredSubscriptions();
    console.log(`- Processed ${expiredProcessed} expired subscriptions`);

    // Reset usage for subscriptions
    const usageResets = await resetSubscriptionUsage();
    console.log(`- Reset usage for ${usageResets} subscriptions`);

    console.log('All tasks completed successfully!');
  } catch (error) {
    console.error('Error running cron jobs:', error);
    throw error;
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Disconnected from Prisma client');
    } catch (error) {
      console.error('Error disconnecting Prisma client:', error);
    }
  }
}

// Execute cron jobs and handle process exit
runCronJobs()
  .then(() => {
    console.log('Cron jobs completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error in cron jobs:', err);
    process.exit(1);
  });