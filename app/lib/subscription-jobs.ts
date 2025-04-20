// lib/subscription-jobs.ts

import { prisma } from './prisma';
import { sendSubscriptionRenewalReminderEmail, sendSubscriptionExpiredEmail } from './email';

/**
 * Check for expiring subscriptions and send reminders
 */
export async function checkExpiringSubscriptions(): Promise<number> {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Find subscriptions expiring in 3 days
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gte: new Date(),
          lte: threeDaysFromNow
        }
      },
      include: {
        user: true
      }
    });
    
    // Send reminder emails
    let remindersSent = 0;
    for (const subscription of expiringSubscriptions) {
      if (subscription.user.email) {
        await sendSubscriptionRenewalReminderEmail(
          subscription.user.email,
          subscription.user.name || '',
          subscription.tier,
          subscription.currentPeriodEnd as Date
        );
        remindersSent++;
      }
    }
    
    return remindersSent;
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
    throw error;
  }
}

/**
 * Process expired subscriptions and downgrade to free tier
 */
export async function processExpiredSubscriptions(): Promise<number> {
  try {
    // Find expired subscriptions
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          lt: new Date()
        }
      },
      include: {
        user: true
      }
    });
    
    let processedCount = 0;
    for (const subscription of expiredSubscriptions) {
      // Downgrade to free tier
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: 'free',
          status: 'expired',
        }
      });
      
      // Send notification email
      if (subscription.user.email) {
        await sendSubscriptionExpiredEmail(
          subscription.user.email,
          subscription.user.name || '',
          subscription.tier
        );
      }
      
      processedCount++;
    }
    
    return processedCount;
  } catch (error) {
    console.error('Error processing expired subscriptions:', error);
    throw error;
  }
}

/**
 * Reset monthly usage for all users when their reset date is due
 */
export async function resetMonthlyUsage(): Promise<number> {
  try {
    const today = new Date();
    
    // Find subscriptions that need usage reset
    const subscriptionsToReset = await prisma.subscription.findMany({
      where: {
        usageResetDate: {
          lt: today
        }
      }
    });
    
    let resetCount = 0;
    for (const subscription of subscriptionsToReset) {
      // Delete existing usage stats
      await prisma.usageStats.deleteMany({
        where: { userId: subscription.userId }
      });
      
      // Update the reset date to next month
      const nextReset = new Date(subscription.usageResetDate);
      nextReset.setMonth(nextReset.getMonth() + 1);
      
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          usageResetDate: nextReset
        }
      });
      
      resetCount++;
    }
    
    return resetCount;
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    throw error;
  }
}