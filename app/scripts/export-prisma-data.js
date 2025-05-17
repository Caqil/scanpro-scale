// scripts/export-prisma-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Create migration_data directory if it doesn't exist
const migrationDir = path.join(__dirname, '..', 'migration_data');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

async function exportData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to Prisma database...');
    
    // Export users
    console.log('Exporting users...');
    const users = await prisma.user.findMany();
    fs.writeFileSync(
      path.join(migrationDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`Exported ${users.length} users`);
    
    // Export transactions
    console.log('Exporting transactions...');
    const transactions = await prisma.transaction.findMany();
    fs.writeFileSync(
      path.join(migrationDir, 'transactions.json'),
      JSON.stringify(transactions, null, 2)
    );
    console.log(`Exported ${transactions.length} transactions`);
    
    // Export API keys
    console.log('Exporting API keys...');
    const apiKeys = await prisma.apiKey.findMany();
    fs.writeFileSync(
      path.join(migrationDir, 'apikeys.json'),
      JSON.stringify(apiKeys, null, 2)
    );
    console.log(`Exported ${apiKeys.length} API keys`);
    
    // Export password reset tokens
    console.log('Exporting password reset tokens...');
    const passwordResetTokens = await prisma.passwordResetToken.findMany();
    fs.writeFileSync(
      path.join(migrationDir, 'password-reset-tokens.json'),
      JSON.stringify(passwordResetTokens, null, 2)
    );
    console.log(`Exported ${passwordResetTokens.length} password reset tokens`);
    
    // Export usage stats
    console.log('Exporting usage stats...');
    const usageStats = await prisma.usageStats.findMany();
    fs.writeFileSync(
      path.join(migrationDir, 'usage-stats.json'),
      JSON.stringify(usageStats, null, 2)
    );
    console.log(`Exported ${usageStats.length} usage stats records`);
    
    console.log('Data export completed successfully!');
    console.log(`Files saved to: ${migrationDir}`);
    
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();