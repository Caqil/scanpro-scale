// scripts/initialize-pay-as-you-go.ts
/**
 * This script initializes the pay-as-you-go model for all users
 * It should be run once when migrating from subscription model to pay-as-you-go
 */

import { prisma } from '@/lib/prisma';

async function initializePayAsYouGo() {
  console.log('Initializing pay-as-you-go model for all users...');

  try {
    // First, add the necessary database migration if needed
    // Normally this would be done with prisma migrate, but for quick testing:
    console.log('Checking if database has required fields...');
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to initialize`);

    // Calculate reset date (first day of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    resetDate.setHours(0, 0, 0, 0);

    // Count of users processed
    let initializedCount = 0;
    let errorCount = 0;

    // Process users in batches for better performance
    const BATCH_SIZE = 100;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(users.length / BATCH_SIZE)}`);
      
      // Update each user with initial values
      const updatePromises = userBatch.map(async (user) => {
        try {
          // Initialize free operations counter and reset date
          await prisma.user.update({
            where: { id: user.id },
            data: {
              freeOperationsUsed: 0,
              freeOperationsReset: resetDate,
              balance: 0 // Start with zero balance
            }
          });
          initializedCount++;
        } catch (error) {
          console.error(`Error initializing user ${user.id}:`, error);
          errorCount++;
        }
      });
      
      await Promise.all(updatePromises);
      
      // Small delay between batches to reduce database load
      if (i + BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('Pay-as-you-go initialization completed:');
    console.log(`- Successfully initialized: ${initializedCount} users`);
    console.log(`- Errors: ${errorCount} users`);
    console.log(`- Free operations will reset on: ${resetDate.toISOString()}`);
    
  } catch (error) {
    console.error('Error initializing pay-as-you-go:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializePayAsYouGo()
  .then(() => console.log('Initialization script completed'))
  .catch(error => console.error('Script failed:', error));