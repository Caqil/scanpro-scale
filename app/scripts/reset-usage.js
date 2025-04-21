// scripts/reset-usage.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetMonthlyUsage() {
  console.log('Starting monthly usage reset...');
  
  const date = new Date();
  console.log(`Reset initiated at ${date.toISOString()}`);
  
  try {
    // Get current month for archiving
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const yearMonth = `${previousMonth.getFullYear()}-${(previousMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Archive current month's stats
    await prisma.$executeRaw`
      INSERT INTO usage_archive (userId, operation, yearMonth, totalCount)
      SELECT userId, operation, ${yearMonth}, SUM(count) as totalCount
      FROM usage_stats
      GROUP BY userId, operation
    `;
    
    console.log(`Archived usage data for ${yearMonth}`);
    
    // Delete current stats
    const deletedCount = await prisma.usageStats.deleteMany({});
    
    console.log(`Reset completed. Deleted ${deletedCount.count} usage records.`);
    
    return { success: true, message: `Reset ${deletedCount.count} usage records` };
  } catch (error) {
    console.error('Error resetting usage:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
resetMonthlyUsage()
  .then(result => {
    console.log('Result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });