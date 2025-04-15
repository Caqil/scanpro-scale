// lib/email-templates.ts

interface TemplateData {
  [key: string]: any;
}

// Main template wrapper with header and footer - enhanced professional design with yellow gradient
const baseTemplate = (content: string, footerContent?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ScanPro</title>
  <style>
    /* Base styles */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
      color: #111827;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 24px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #FFEAA0;
      background-image: linear-gradient(135deg, #FFEAA0 0%, #FFDA7B 75%);
      padding: 40px 24px;
      text-align: center;
      position: relative;
    }
    .header-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.075' fill-rule='evenodd'/%3E%3C/svg%3E");
      opacity: 0.6;
      z-index: 0;
    }
    .logo-wrapper {
      position: relative;
      z-index: 1;
    }
    .logo {
      color: #1A2238;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .logo-tagline {
      color: #1A2238;
      font-size: 14px;
      margin-top: 0;
      opacity: 0.8;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 24px;
      font-size: 13px;
      color: #6B7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .social-links {
      margin: 16px 0;
    }
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #6B7280;
      text-decoration: none;
    }
    .button-primary {
      display: inline-block;
      background-color: #FFCE54;
      color: #1A2238;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
      transition: background-color 0.2s;
      box-shadow: 0 2px 4px rgba(255, 206, 84, 0.3);
    }
    .button-primary:hover {
      background-color: #FFDA7B;
    }
    .button-secondary {
      display: inline-block;
      background-color: white;
      color: #FFCE54;
      border: 1px solid #FFCE54;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button-secondary:hover {
      background-color: #FFF9E6;
    }
    .info-box {
      background-color: #FFF9E6;
      border-left: 4px solid #FFCE54;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #FEF2F2;
      border-left: 4px solid #EF4444;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success-box {
      background-color: #ECFDF5;
      border-left: 4px solid #10B981;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .divider {
      border: none;
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
    .text-center {
      text-align: center;
    }
    .text-small {
      font-size: 14px;
      color: #6B7280;
    }
    .link {
      color: #FFCE54;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
    .feature-list {
      margin: 24px 0;
      padding: 0;
      list-style-type: none;
    }
    .feature-item {
      padding: 8px 0 8px 28px;
      position: relative;
      margin-bottom: 4px;
    }
    .feature-item:before {
      content: '';
      position: absolute;
      left: 0;
      top: 12px;
      width: 16px;
      height: 16px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23FFCE54'%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clip-rule='evenodd' /%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .code-block {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 8px 12px;
      font-family: monospace;
      font-size: 12px;
      word-break: break-all;
      color: #374151;
      margin: 16px 0;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100%;
        margin: 0;
        border-radius: 0;
      }
      .header {
        padding: 30px 16px;
      }
      .content {
        padding: 24px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-pattern"></div>
      <div class="logo-wrapper">
        <div class="logo">ScanPro</div>
        <p class="logo-tagline">Professional PDF Tools</p>
      </div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      ${footerContent || `
        <p>© ${new Date().getFullYear()} ScanPro. All rights reserved.</p>
        <p>Our address: 123 PDF Lane, Document City, 45678</p>
        <div class="social-links">
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">LinkedIn</a>
        </div>
        <p>If you have any questions, please <a href="#" class="link">contact our support team</a>.</p>
        <p><a href="#" class="link">Privacy Policy</a> • <a href="#" class="link">Terms of Service</a></p>
      `}
    </div>
  </div>
</body>
</html>
`;

// Password reset email template - enhanced professional version
export const passwordResetTemplate = (data: { resetUrl: string; username?: string }) => {
  const userGreeting = data.username
      ? `Hello, ${data.username}!`
      : 'Hello!';

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">${userGreeting}</h2>
    <p>We received a request to reset your password for your ScanPro account. To create a new password, click the secure button below:</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="${data.resetUrl}" class="button-primary">Reset My Password</a>
    </div>
    
    <div class="info-box">
      <p style="margin-top: 0; margin-bottom: 0;"><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
    </div>
    
    <p class="text-small">If you didn't initiate this password reset, you can safely ignore this email. Your account security is important to us, and your password will remain unchanged.</p>
    
    <hr class="divider">
    
    <p class="text-small" style="margin-bottom: 4px;">Having trouble with the button above? Copy and paste this URL into your browser:</p>
    <div class="code-block">
      ${data.resetUrl}
    </div>
    
    <p class="text-small" style="margin-top: 24px;">For security reasons, this password reset request was received from: <br>[IP Address: 192.168.1.1] at ${new Date().toUTCString()}</p>
  `;

  const footerContent = `
    <p>© ${new Date().getFullYear()} ScanPro. All rights reserved.</p>
    <p>To ensure delivery to your inbox, please add <span style="font-weight: 500;">noreply@scanpro.cc</span> to your contacts.</p>
    <p><a href="#" class="link">Privacy Policy</a> • <a href="#" class="link">Terms of Service</a> • <a href="#" class="link">Help Center</a></p>
  `;

  return baseTemplate(content, footerContent);
};

// Password reset success confirmation email template - enhanced professional version
export const passwordResetSuccessTemplate = (data: { loginUrl: string; username?: string }) => {
  const userGreeting = data.username
      ? `Hello, ${data.username}!`
      : 'Hello!';

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Password Reset Successful</h2>
    <p>${userGreeting}</p>
    <div class="success-box">
      <p style="margin: 0;"><strong>Success:</strong> Your ScanPro account password has been successfully reset.</p>
    </div>
    
    <p>You can now sign in to your account using your new password.</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="${data.loginUrl}" class="button-primary">Sign In to Your Account</a>
    </div>
    
    <div class="warning-box">
      <p style="margin: 0;"><strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately as your account may have been compromised.</p>
    </div>
    
    <hr class="divider">
    
    <h3 style="font-size: 16px; font-weight: 600;">Account Security Tips:</h3>
    <ul class="feature-list">
      <li class="feature-item">Use strong, unique passwords for all your accounts</li>
      <li class="feature-item">Enable two-factor authentication for additional security</li>
      <li class="feature-item">Regularly monitor your account for suspicious activity</li>
      <li class="feature-item">Never share your password with anyone</li>
    </ul>
    
    <p class="text-small text-center" style="margin-top: 32px;">Thank you for using ScanPro for your PDF processing needs!</p>
  `;

  return baseTemplate(content);
};

// Welcome email template - enhanced professional version
export const welcomeTemplate = (data: { name: string;
verificationUrl: string; }) => {
  const verifySection = data.verificationUrl ? `
    <p>To get started, please verify your email address by clicking the secure button below:</p>
    <div class="text-center">
      <a href="${data.verificationUrl}" class="button-primary">Verify Email Address</a>
    </div>
  ` : '';

  const loginButton = data.verificationUrl ? `
    <div class="text-center">
      <a href="${data.verificationUrl}" class="button-primary">Sign In to Your Account</a>
    </div>
  ` : '';

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Welcome to ScanPro!</h2>
    <p>Hello, ${data.name}!</p>
    <p>Thank you for signing up for ScanPro. We're excited to have you join our community of users who trust us with their PDF management needs.</p>
    
    ${verifySection}
    
    <div class="success-box">
      <p style="margin: 0;"><strong>Your account has been created successfully.</strong> You now have access to all the powerful PDF tools that ScanPro offers.</p>
    </div>
    
    <h3 style="font-size: 18px; font-weight: 600; margin-top: 30px;">Powerful PDF Tools at Your Fingertips</h3>
    <ul class="feature-list">
      <li class="feature-item">Convert PDFs to various formats (Word, Excel, Images)</li>
      <li class="feature-item">Merge and split PDF files with precision</li>
      <li class="feature-item">Add professional watermarks and protect your documents</li>
      <li class="feature-item">Compress PDFs to reduce file size without quality loss</li>
      <li class="feature-item">Extract text and data using OCR technology</li>
    </ul>
    
    ${loginButton}
    
    <hr class="divider">
    
    <h3 style="font-size: 16px; font-weight: 600;">Quick Tips to Get Started:</h3>
    <ol style="padding-left: 20px;">
      <li>Upload your first PDF document to explore our tools</li>
      <li>Try converting a PDF to another format to see how easy it is</li>
      <li>Bookmark our dashboard for quick access</li>
    </ol>
    
    <p class="text-center" style="margin-top: 32px;">
      <span style="display: block; margin-bottom: 8px;">Need help getting started?</span>
      <a href="#" class="button-secondary">View Our Tutorial</a>
    </p>
    
    <p class="text-small text-center" style="margin-top: 16px;">
      If you have any questions or need assistance, our support team is always here to help.
    </p>
  `;

  return baseTemplate(content);
};

// Account verification email template - enhanced professional version
export const verificationTemplate = (data: { verifyUrl: string; username?: string }) => {
  const userGreeting = data.username
      ? `Hello, ${data.username}!`
      : 'Hello!';

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Verify Your Email Address</h2>
    <p>${userGreeting}</p>
    <p>Thank you for creating an account with ScanPro. To complete your registration and activate all features, please verify your email address by clicking the button below:</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="${data.verifyUrl}" class="button-primary">Verify Email Address</a>
    </div>
    
    <div class="info-box">
      <p style="margin-top: 0; margin-bottom: 0;"><strong>Note:</strong> This verification link will expire in 24 hours. If you don't verify within this time frame, you'll need to request a new verification link.</p>
    </div>
    
    <p class="text-small">If you didn't create an account with ScanPro, you can safely ignore this email.</p>
    
    <hr class="divider">
    
    <p class="text-small" style="margin-bottom: 4px;">Having trouble with the button above? Copy and paste this URL into your browser:</p>
    <div class="code-block">
      ${data.verifyUrl}
    </div>
    
    <h3 style="font-size: 16px; font-weight: 600; margin-top: 30px;">Why Verify Your Email?</h3>
    <ul class="feature-list">
      <li class="feature-item">Secure your account with your verified email address</li>
      <li class="feature-item">Receive important notifications about your account</li>
      <li class="feature-item">Recover your account easily if you forget your password</li>
      <li class="feature-item">Get updates about new features and improvements</li>
    </ul>
  `;

  return baseTemplate(content);
};

// Invoice/Receipt email template - enhanced professional version
export const invoiceTemplate = (data: {
  invoiceNumber: string;
  date: string;
  amount: string;
  planName: string;
  username?: string;
  billingPeriod?: string;
  invoiceUrl?: string;
}) => {
  const userGreeting = data.username
      ? `Hello, ${data.username}!`
      : 'Hello!';

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Your ScanPro Receipt</h2>
    <p>${userGreeting}</p>
    <p>Thank you for your subscription to ScanPro. This email confirms your payment has been processed successfully.</p>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #111827;">Payment Receipt</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Invoice Number:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Date:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Subscription Plan:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.planName}</td>
        </tr>
        ${data.billingPeriod ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Billing Period:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.billingPeriod}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0; font-weight: 600;">Total Amount:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #111827; font-size: 18px;">${data.amount}</td>
        </tr>
      </table>
    </div>
    
    ${data.invoiceUrl ? `
    <div class="text-center" style="padding: 16px 0;">
      <a href="${data.invoiceUrl}" class="button-primary">View Full Invoice</a>
    </div>
    ` : ''}
    
    <div class="info-box">
      <p style="margin-top: 0; margin-bottom: 0;"><strong>Note:</strong> Your subscription will automatically renew according to your plan terms. You can manage your subscription settings in your account dashboard.</p>
    </div>
    
    <hr class="divider">
    
    <p class="text-small text-center">If you have any questions about your billing or need assistance, please contact our support team.</p>
  `;

  return baseTemplate(content);
};

// Account security alert email template - enhanced professional version
export const securityAlertTemplate = (data: {
  alertType: 'login' | 'password_change' | 'email_change' | 'suspicious_activity';
  datetime: string;
  location?: string;
  device?: string;
  ipAddress?: string;
  username?: string;
  supportUrl?: string;
}) => {
  const userGreeting = data.username
      ? `Hello, ${data.username}!`
      : 'Hello!';

  let alertTitle = 'Security Alert';
  let alertDescription = 'There has been a security event on your ScanPro account.';

  switch (data.alertType) {
      case 'login':
          alertTitle = 'New Login Detected';
          alertDescription = 'We detected a new login to your ScanPro account.';
          break;
      case 'password_change':
          alertTitle = 'Password Changed';
          alertDescription = 'The password for your ScanPro account was recently changed.';
          break;
      case 'email_change':
          alertTitle = 'Email Address Changed';
          alertDescription = 'The email address for your ScanPro account was recently changed.';
          break;
      case 'suspicious_activity':
          alertTitle = 'Suspicious Activity Detected';
          alertDescription = 'We detected potentially suspicious activity on your ScanPro account.';
          break;
  }

  const content = `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">${alertTitle}</h2>
    <p>${userGreeting}</p>
    <p>${alertDescription}</p>
    
    <div class="warning-box">
      <p style="margin: 0;"><strong>Security Notice:</strong> If you did not initiate this action, please secure your account immediately.</p>
    </div>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 24px 0;">
      <h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #111827;">Activity Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Date & Time:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.datetime}</td>
        </tr>
        ${data.location ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Location:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.location}</td>
        </tr>
        ` : ''}
        ${data.device ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Device:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.device}</td>
        </tr>
        ` : ''}
        ${data.ipAddress ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">IP Address:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${data.ipAddress}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="${data.supportUrl || '#'}" class="button-primary">Secure My Account</a>
    </div>
    
    <h3 style="font-size: 16px; font-weight: 600; margin-top: 30px;">Recommended Security Steps:</h3>
    <ul class="feature-list">
      <li class="feature-item">Change your password immediately</li>
      <li class="feature-item">Enable two-factor authentication if not already active</li>
      <li class="feature-item">Review recent account activity for any unauthorized changes</li>
      <li class="feature-item">Log out of all devices</li>
    </ul>
    
    <p class="text-small" style="margin-top: 24px;">If you recognize this activity, you can disregard this message. Your account security is our top priority.</p>
  `;

  return baseTemplate(content);
};