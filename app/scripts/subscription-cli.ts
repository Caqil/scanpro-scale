// scripts/subscription-cli.ts
import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import { 
  getSubscriptionDetails, 
  createSubscription, 
  cancelSubscription,
  checkExpiringSubscriptions,
  processExpiredSubscriptions,
  checkAndResetUsage
} from '../lib/paypal';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('ScanPro Subscription CLI Tool');
  console.log('-----------------------------------------');
  console.log('1. List all subscriptions');
  console.log('2. Get subscription details by PayPal ID');
  console.log('3. Set user subscription status to active');
  console.log('4. Reset user usage stats');
  console.log('5. Run expiring subscriptions check');
  console.log('6. Process expired subscriptions');
  console.log('7. Reset monthly usage for eligible users');
  console.log('8. Exit');
  console.log('-----------------------------------------');

  rl.question('Enter your choice: ', async (choice) => {
    try {
      switch (choice) {
        case '1':
          await listSubscriptions();
          break;
        case '2':
          await getSubscriptionFromPayPal();
          break;
        case '3':
          await setSubscriptionActive();
          break;
        case '4':
          await resetUserUsage();
          break;
        case '5':
          await runExpiringCheck();
          break;
        case '6':
          await runExpiredProcess();
          break;
        case '7':
          await runUsageReset();
          break;
        case '8':
          console.log('Goodbye!');
          rl.close();
          await prisma.$disconnect();
          process.exit(0);
          break;
        default:
          console.log('Invalid choice');
          main();
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      main();
    }
  });
}

async function listSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  console.log('\nSubscriptions:');
  console.log('-----------------------------------------');
  subscriptions.forEach(sub => {
    console.log(`ID: ${sub.id}`);
    console.log(`User: ${sub.user.name} (${sub.user.email})`);
    console.log(`Tier: ${sub.tier}`);
    console.log(`Status: ${sub.status}`);
    console.log(`PayPal ID: ${sub.paypalSubscriptionId || 'N/A'}`);
    console.log(`Current Period: ${sub.currentPeriodStart?.toISOString()} to ${sub.currentPeriodEnd?.toISOString() || 'N/A'}`);
    console.log(`Usage Reset Date: ${sub.usageResetDate.toISOString()}`);
    console.log('-----------------------------------------');
  });

  rl.question('Press Enter to continue...', () => {
    main();
  });
}

async function getSubscriptionFromPayPal() {
  rl.question('Enter PayPal Subscription ID: ', async (id) => {
    try {
      const details = await getSubscriptionDetails(id);
      console.log('\nSubscription Details from PayPal:');
      console.log(JSON.stringify(details, null, 2));
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }

    rl.question('Press Enter to continue...', () => {
      main();
    });
  });
}

async function setSubscriptionActive() {
  rl.question('Enter user email: ', async (email) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { subscription: true }
      });

      if (!user) {
        console.log('User not found');
        rl.question('Press Enter to continue...', () => {
          main();
        });
        return;
      }

      rl.question('Enter tier (free, basic, pro, enterprise): ', async (tier) => {
        // Default to 30 days from now
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: 'active',
            tier,
            currentPeriodStart: new Date(),
            currentPeriodEnd,
            lastPaymentDate: new Date(),
            usageResetDate: currentPeriodEnd
          }
        });

        console.log(`Subscription updated for ${user.email}`);
        rl.question('Press Enter to continue...', () => {
          main();
        });
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      rl.question('Press Enter to continue...', () => {
        main();
      });
    }
  });
}

async function resetUserUsage() {
  rl.question('Enter user email: ', async (email) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('User not found');
        rl.question('Press Enter to continue...', () => {
          main();
        });
        return;
      }

      // Delete all usage stats
      await prisma.usageStats.deleteMany({
        where: { userId: user.id }
      });

      console.log(`Usage stats reset for ${user.email}`);
      rl.question('Press Enter to continue...', () => {
        main();
      });
    } catch (error) {
      console.error('Error resetting usage:', error);
      rl.question('Press Enter to continue...', () => {
        main();
      });
    }
  });
}

async function runExpiringCheck() {
  try {
    const count = await checkExpiringSubscriptions();
    console.log(`Sent ${count} expiration reminder emails`);
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
  }

  rl.question('Press Enter to continue...', () => {
    main();
  });
}

async function runExpiredProcess() {
  try {
    const count = await processExpiredSubscriptions();
    console.log(`Processed ${count} expired subscriptions`);
  } catch (error) {
    console.error('Error processing expired subscriptions:', error);
  }

  rl.question('Press Enter to continue...', () => {
    main();
  });
}

async function runUsageReset() {
  try {
    const count = await checkAndResetUsage();
    console.log(`Reset usage for ${count} subscriptions`);
  } catch (error) {
    console.error('Error resetting usage:', error);
  }

  rl.question('Press Enter to continue...', () => {
    main();
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});