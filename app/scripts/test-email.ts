// scripts/test-email.ts
// Run this script with: npx ts-node scripts/test-email.ts

import { sendEmail } from '../lib/email';

async function testEmailSending() {
    console.log('Testing email configuration...');

    // Check for required environment variables
    if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) {
        console.error('Missing required environment variables:');
        console.error(!process.env.EMAIL_SERVER ? '- EMAIL_SERVER' : 'smtp://support@billiongroup.net:Aqswde!123@mail.privateemail.com:587');
        console.error(!process.env.EMAIL_FROM ? '- EMAIL_FROM' : 'support@billiongroup.net');
        process.exit(1);
    }

    console.log(`Using EMAIL_SERVER: ${process.env.EMAIL_SERVER}`);
    console.log(`Using EMAIL_FROM: ${process.env.EMAIL_FROM}`);

    // Get recipient email from command line or use default
    const recipientEmail = process.argv[2] || 'ganggasungain@gmail.com';
    console.log(`Sending test email to: ${recipientEmail}`);

    try {
        await sendEmail({
            to: recipientEmail,
            subject: 'ScanPro Email Configuration Test',
            text: 'This is a test email to verify your ScanPro email configuration is working correctly.',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FFEAA0; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #1A2238;">ScanPro</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e1e1e1; border-top: none;">
            <h2>Email Configuration Test</h2>
            <p>This is a test email to verify your ScanPro email configuration is working correctly.</p>
            <p>If you received this email, your email service is properly configured!</p>
            <p>Configuration summary:</p>
            <ul>
              <li>EMAIL_SERVER is configured</li>
              <li>EMAIL_FROM is set to: ${process.env.EMAIL_FROM}</li>
            </ul>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p>© 2025 ScanPro. All rights reserved.</p>
          </div>
        </div>
      `
        });

        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send test email:');
        console.error(error);
        process.exit(1);
    }
}

testEmailSending();