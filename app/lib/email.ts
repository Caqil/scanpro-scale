// lib/email.ts
import nodemailer from 'nodemailer';
import { passwordResetTemplate, passwordResetSuccessTemplate, welcomeTemplate } from './email-templates';
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
interface InvoiceData {
  userEmail: string;
  userName?: string | null;
  subscriptionTier: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  subscriptionPeriod: {
    start: Date;
    end: Date;
  };
}
// Create a transporter with configuration
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};
// Send email function
export const sendEmail = async ({ to, subject, html, text }: EmailOptions): Promise<{ success: boolean; messageUrl?: string; error?: string }> => {
  try {


    const transporter = createTransporter();

    // Set from address
    const from = process.env.EMAIL_FROM || 'noreply@scanpro.cc';

    // Send mail
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Strip HTML as fallback
      html,
    });

    console.log(`✅ Email sent to ${to}`);

    // If using Ethereal, provide preview URL
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return {
        success: true,
        // messageUrl: nodemailer.getTestMessageUrl(info) 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
};

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/verify-email?token=${token}`;

  const htmlContent = welcomeTemplate({
    name: name || 'there',
    verificationUrl
  });

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address for ScanPro',
    html: htmlContent
  });
};
// Function to send a password reset email
export const sendPasswordResetEmail = async (email: string, token: string, username?: string): Promise<{ success: boolean; messageUrl?: string; error?: string }> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/en/reset-password/${token}`;

  // Use the template from email-templates.ts
  const html = passwordResetTemplate({
    resetUrl,
    username
  });

  return sendEmail({
    to: email,
    subject: 'Reset Your ScanPro Password',
    html
  });
};

// Function to send a password reset success email
export const sendPasswordResetSuccessEmail = async (email: string, username?: string): Promise<{ success: boolean; messageUrl?: string; error?: string }> => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/en/login`;

  // Use the template from email-templates.ts
  const html = passwordResetSuccessTemplate({
    loginUrl,
    username
  });

  return sendEmail({
    to: email,
    subject: 'Your ScanPro Password Has Been Reset',
    html
  });
};
/**
 * Send a subscription invoice email
 */
export async function sendSubscriptionInvoiceEmail(data: {
  userEmail: string;
  userName?: string | null;
  subscriptionTier: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  subscriptionPeriod: {
    start: Date;
    end: Date;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      userEmail,
      userName,
      subscriptionTier,
      amount,
      currency,
      invoiceNumber,
      subscriptionPeriod
    } = data;

    // Format dates in a more readable format
    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ScanPro Invoice</h1>
          <p style="margin-top: 10px;">Subscription Invoice</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">
            Invoice Details
          </h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <strong>Invoice Number:</strong>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                ${invoiceNumber}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <strong>Subscription Tier:</strong>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-transform: capitalize;">
                ${subscriptionTier}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <strong>Period:</strong>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                ${formatDate(subscriptionPeriod.start)} - ${formatDate(subscriptionPeriod.end)}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <strong>Total Amount:</strong>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                ${currency} ${amount.toFixed(2)}
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
          <p>
            © ${new Date().getFullYear()} ScanPro. All rights reserved.<br>
            This is an automated invoice for your subscription.
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: userEmail,
      subject: `ScanPro Invoice - ${invoiceNumber}`,
      html
    });

    return result;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending invoice email'
    };
  }
}

/**
 * Send a subscription renewal reminder email
 */
export async function sendSubscriptionRenewalReminderEmail(
  email: string,
  name: string,
  tier: string,
  expiryDate: Date
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const subject = `Your ScanPro ${tier} subscription is expiring soon`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
        <h1>ScanPro Subscription Reminder</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0;">
        <p>Hello ${name || 'there'},</p>
        
        <p>This is a friendly reminder that your ScanPro <strong>${tier}</strong> subscription will expire on <strong>${formattedDate}</strong>.</p>
        
        <p>To maintain uninterrupted access to all features and benefits of your subscription, please renew before the expiration date.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" 
             style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Renew Subscription
          </a>
        </div>
        
        <p>If you choose not to renew, your account will automatically be downgraded to the free tier with limited functionality.</p>
        
        <p>Thank you for using ScanPro!</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
        <p>© ${new Date().getFullYear()} ScanPro. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return await sendEmail({ to: email, subject, html });
}

/**
 * Send a subscription expired email
 */
export async function sendSubscriptionExpiredEmail(
  email: string,
  name: string,
  previousTier: string
): Promise<{ success: boolean; error?: string }> {
  const subject = `Your ScanPro ${previousTier} subscription has expired`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
        <h1>ScanPro Subscription Update</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e0e0e0;">
        <p>Hello ${name || 'there'},</p>
        
        <p>This is to inform you that your ScanPro <strong>${previousTier}</strong> subscription has expired.</p>
        
        <p>Your account has been automatically downgraded to the free tier, which includes:</p>
        
        <ul>
          <li>Limited to 500 operations per month</li>
          <li>Basic PDF tools</li>
          <li>Standard processing speed</li>
        </ul>
        
        <p>To regain access to all the premium features you were enjoying, you can resubscribe at any time.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" 
             style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Resubscribe Now
          </a>
        </div>
        
        <p>Thank you for your past support. We hope to welcome you back soon!</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #777; font-size: 12px;">
        <p>© ${new Date().getFullYear()} ScanPro. All rights reserved.</p>
      </div>
    </div>
  `;
  
  
  return await sendEmail({ to: email, subject, html });
}