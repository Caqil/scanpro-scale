// scripts/cleanup-pending-subscriptions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupPendingSubscriptions() {
  console.log('Starting pending subscription cleanup...');
  
  try {
    // Find subscriptions that have been pending for more than 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'pending',
        updatedAt: {
          lt: twentyFourHoursAgo
        }
      },
      include: {
        user: true
      }
    });
    
    console.log(`Found ${pendingSubscriptions.length} expired pending subscriptions`);
    
    // Reset them to free tier
    const updateResults = await Promise.all(
      pendingSubscriptions.map(async (subscription) => {
        console.log(`Resetting subscription for user: ${subscription.userId}`);
        
        return prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: 'free',
            status: 'active',
            paypalSubscriptionId: null,
            paypalPlanId: null,
            updatedAt: new Date()
          }
        });
      })
    );
    
    console.log(`Successfully reset ${updateResults.length} subscriptions to free tier`);
    
    return { success: true, count: updateResults.length };
  } catch (error) {
    console.error('Error cleaning up pending subscriptions:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
cleanupPendingSubscriptions()
  .then(result => {
    console.log('Cleanup result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });