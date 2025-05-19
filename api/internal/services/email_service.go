package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net"
	"net/smtp"
	"path/filepath"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"gopkg.in/gomail.v2"
)

// EmailService handles sending emails
type EmailService struct {
	config *config.Config
}

// NewEmailService creates a new EmailService
func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		config: cfg,
	}
}

// EmailResult represents the result of sending an email
type EmailResult struct {
	Success    bool
	Error      string
	MessageID  string
	MessageUrl string // For preview in development
}

// EmailData contains data for an email template
type EmailData struct {
	To       string
	Subject  string
	Template string
	Data     map[string]interface{}
}

// SendEmail sends an email with the given data
func (s *EmailService) SendEmail(data EmailData) (*EmailResult, error) {
	// Always log sending attempts, even in production
	fmt.Printf("Attempting to send email to %s, subject: %s\n", data.To, data.Subject)

	// Check if SMTP settings are configured
	if s.config.SMTPHost == "" || s.config.SMTPUser == "" || s.config.SMTPPass == "" {
		fmt.Printf("ERROR: Cannot send email - SMTP settings not configured\n")
		return &EmailResult{
			Success: false,
			Error:   "SMTP settings not configured",
		}, fmt.Errorf("SMTP settings not configured")
	}

	// Create a new message
	m := gomail.NewMessage()
	m.SetHeader("From", s.config.EmailFrom)
	m.SetHeader("To", data.To)
	m.SetHeader("Subject", data.Subject)

	// Parse the template
	tmpl, err := template.New(filepath.Base(data.Template)).Parse(data.Template)
	if err != nil {
		fmt.Printf("ERROR: Failed to parse email template: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to parse email template: %v", err),
		}, err
	}

	// Execute the template with the provided data
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data.Data); err != nil {
		fmt.Printf("ERROR: Failed to execute email template: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to execute email template: %v", err),
		}, err
	}

	// Set the email body
	m.SetBody("text/html", body.String())

	// In development mode, just log the email
	if s.config.Debug {
		fmt.Printf("[DEBUG] Email content:\n%s\n", body.String())
		fmt.Printf("[DEBUG] Email would be sent in production mode\n")
		return &EmailResult{
			Success:    true,
			MessageUrl: fmt.Sprintf("http://localhost:%d/email-preview", s.config.Port),
		}, nil
	}

	// Log SMTP connection details (for debugging)
	fmt.Printf("Connecting to SMTP server: %s:%d with user: %s\n",
		s.config.SMTPHost, s.config.SMTPPort, s.config.SMTPUser)

	// Configure SMTP connection
	smtpHostPort := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPass, s.config.SMTPHost)

	// Create a custom dialer with timeout
	dialer := &net.Dialer{
		Timeout: 20 * time.Second,
	}

	// Dial the SMTP server with timeout
	var conn net.Conn
	if s.config.SMTPSecure {
		tlsConfig := &tls.Config{
			ServerName: s.config.SMTPHost,
		}
		conn, err = tls.Dial("tcp", smtpHostPort, tlsConfig)
	} else {
		conn, err = dialer.Dial("tcp", smtpHostPort)
	}
	if err != nil {
		fmt.Printf("ERROR: Failed to connect to SMTP server: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to connect to SMTP server: %v", err),
		}, err
	}
	defer conn.Close()

	// Create an SMTP client
	client, err := smtp.NewClient(conn, s.config.SMTPHost)
	if err != nil {
		fmt.Printf("ERROR: Failed to create SMTP client: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to create SMTP client: %v", err),
		}, err
	}
	defer client.Close()

	// Authenticate
	if err := client.Auth(auth); err != nil {
		fmt.Printf("ERROR: Failed to authenticate with SMTP server: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to authenticate with SMTP server: %v", err),
		}, err
	}

	// Set the sender and recipient
	if err := client.Mail(s.config.EmailFrom); err != nil {
		fmt.Printf("ERROR: Failed to set sender: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to set sender: %v", err),
		}, err
	}

	if err := client.Rcpt(data.To); err != nil {
		fmt.Printf("ERROR: Failed to set recipient: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to set recipient: %v", err),
		}, err
	}

	// Send the email body
	writer, err := client.Data()
	if err != nil {
		fmt.Printf("ERROR: Failed to open data connection: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to open data connection: %v", err),
		}, err
	}

	// Construct the raw email message manually
	rawMessage := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		s.config.EmailFrom, data.To, data.Subject, body.String())

	_, err = writer.Write([]byte(rawMessage))
	if err != nil {
		fmt.Printf("ERROR: Failed to write email body: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to write email body: %v", err),
		}, err
	}

	if err := writer.Close(); err != nil {
		fmt.Printf("ERROR: Failed to close data connection: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to close data connection: %v", err),
		}, err
	}

	// Quit the SMTP session
	if err := client.Quit(); err != nil {
		fmt.Printf("ERROR: Failed to close SMTP session: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to close SMTP session: %v", err),
		}, err
	}

	fmt.Printf("Email sent successfully to %s\n", data.To)
	return &EmailResult{
		Success: true,
	}, nil
}

// baseTemplate is the main template wrapper with header and footer
// This replaces the existing baseTemplate in email_service.go
const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MegaPDF</title>
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
        <div class="logo">MegaPDF</div>
        <p class="logo-tagline">Professional PDF Tools</p>
      </div>
    </div>
    <div class="content">
      {{.Content}}
    </div>
    <div class="footer">
      {{if .FooterContent}}
        {{.FooterContent}}
      {{else}}
        <p>© {{.Year}} MegaPDF. All rights reserved.</p>
        <p>Our address: 123 PDF Lane, Document City, 45678</p>
        <div class="social-links">
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">LinkedIn</a>
        </div>
        <p>If you have any questions, please <a href="#" class="link">contact our support team</a>.</p>
        <p><a href="#" class="link">Privacy Policy</a> • <a href="#" class="link">Terms of Service</a></p>
      {{end}}
    </div>
  </div>
</body>
</html>
`

// SendPasswordResetEmail sends a password reset email
func (s *EmailService) SendPasswordResetEmail(to, token string) (*EmailResult, error) {
	// URL for password reset
	resetUrl := fmt.Sprintf("%s/en/reset-password?token=%s", s.config.AppURL, token)

	// Content template
	contentTemplate := `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Hello!</h2>
    <p>We received a request to reset your password for your MegaPDF account. To create a new password, click the secure button below:</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="{{.ResetUrl}}" class="button-primary">Reset My Password</a>
    </div>
    
    <div class="info-box">
      <p style="margin-top: 0; margin-bottom: 0;"><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
    </div>
    
    <p class="text-small">If you didn't initiate this password reset, you can safely ignore this email. Your account security is important to us, and your password will remain unchanged.</p>
    
    <hr class="divider">
    
    <p class="text-small" style="margin-bottom: 4px;">Having trouble with the button above? Copy and paste this URL into your browser:</p>
    <div class="code-block">
      {{.ResetUrl}}
    </div>
    
    <p class="text-small" style="margin-top: 24px;">For security reasons, this password reset request was received from: <br>[IP Address: 192.168.1.1] at {{.CurrentTime}}</p>
    `

	// Footer content
	footerContent := `
    <p>© {{.Year}} MegaPDF. All rights reserved.</p>
    <p>To ensure delivery to your inbox, please add <span style="font-weight: 500;">noreply@mega-pdf.com</span> to your contacts.</p>
    <p><a href="#" class="link">Privacy Policy</a> • <a href="#" class="link">Terms of Service</a> • <a href="#" class="link">Help Center</a></p>
    `

	// Combine content and footer into base template
	data := map[string]interface{}{
		"Content":       template.HTML(contentTemplate),
		"FooterContent": template.HTML(footerContent),
		"ResetUrl":      resetUrl,
		"Year":          time.Now().Year(),
		"CurrentTime":   time.Now().UTC().Format(time.RFC1123),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Password Reset",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendPasswordResetSuccessEmail sends a password reset success email
func (s *EmailService) SendPasswordResetSuccessEmail(to string, name string) (*EmailResult, error) {
	// URL for login
	loginUrl := fmt.Sprintf("%s/en/login", s.config.AppURL)

	// Use a default name if none provided
	displayName := name
	if displayName == "" {
		displayName = "there"
	}

	// Content template
	contentTemplate := `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Password Reset Successful</h2>
    <p>Hello {{.Name}}!</p>
    <div class="success-box">
      <p style="margin: 0;"><strong>Success:</strong> Your MegaPDF account password has been successfully reset.</p>
    </div>
    
    <p>You can now sign in to your account using your new password.</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="{{.LoginUrl}}" class="button-primary">Sign In to Your Account</a>
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
    
    <p class="text-small text-center" style="margin-top: 32px;">Thank you for using MegaPDF for your PDF processing needs!</p>
    `

	// Combine content into base template
	data := map[string]interface{}{
		"Content":  template.HTML(contentTemplate),
		"Name":     displayName,
		"LoginUrl": loginUrl,
		"Year":     time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Password Reset Successful",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendVerificationEmail sends an email verification email
func (s *EmailService) SendVerificationEmail(to, token string, name string) (*EmailResult, error) {
	// URL for email verification
	verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", s.config.AppURL, token)

	// Content template
	contentTemplate := `
    <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Verify Your Email Address</h2>
    <p>Hello {{.Name}}!</p>
    <p>Thank you for creating an account with MegaPDF. To complete your registration and activate all features, please verify your email address by clicking the button below:</p>
    
    <div class="text-center" style="padding: 16px 0;">
      <a href="{{.VerifyUrl}}" class="button-primary">Verify Email Address</a>
    </div>
    
    <div class="info-box">
      <p style="margin-top: 0; margin-bottom: 0;"><strong>Note:</strong> This verification link will expire in 24 hours. If you don't verify within this time frame, you'll need to request a new verification link.</p>
    </div>
    
    <p class="text-small">If you didn't create an account with MegaPDF, you can safely ignore this email.</p>
    
    <hr class="divider">
    
    <p class="text-small" style="margin-bottom: 4px;">Having trouble with the button above? Copy and paste this URL into your browser:</p>
    <div class="code-block">
      {{.VerifyUrl}}
    </div>
    
    <h3 style="font-size: 16px; font-weight: 600; margin-top: 30px;">Why Verify Your Email?</h3>
    <ul class="feature-list">
      <li class="feature-item">Secure your account with your verified email address</li>
      <li class="feature-item">Receive important notifications about your account</li>
      <li class="feature-item">Recover your account easily if you forget your password</li>
      <li class="feature-item">Get updates about new features and improvements</li>
    </ul>
    `

	// Combine content into base template
	data := map[string]interface{}{
		"Content":   template.HTML(contentTemplate),
		"Name":      name,
		"VerifyUrl": verifyUrl,
		"Year":      time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Email Verification",
		Template: baseTemplate,
		Data:     data,
	})
}

// Function to send a deposit confirmation email
func (s *EmailService) SendDepositConfirmationEmail(to string, amount float64, newBalance float64, transactionID string, username string) (*EmailResult, error) {
	// Format the amount with two decimal places
	formattedAmount := fmt.Sprintf("$%.2f", amount)
	formattedBalance := fmt.Sprintf("$%.2f", newBalance)

	// Dashboard URL
	dashboardURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)

	// Content template for deposit confirmation
	contentTemplate := `
	  <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Deposit Confirmation</h2>
	  <p>Hello {{if .Username}}{{.Username}}{{else}}there{{end}}!</p>
	  
	  <div class="success-box">
		<p style="margin: 0;"><strong>Success:</strong> Your deposit of {{.Amount}} has been processed and added to your MegaPDF account.</p>
	  </div>
	  
	  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 24px 0;">
		<h3 style="margin-top: 0; font-size: 18px; font-weight: 600; color: #111827;">Transaction Details</h3>
		<table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
		  <tr>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Transaction ID:</td>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">{{.TransactionID}}</td>
		  </tr>
		  <tr>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Date:</td>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">{{.CurrentTime}}</td>
		  </tr>
		  <tr>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6B7280;">Amount:</td>
			<td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">{{.Amount}}</td>
		  </tr>
		  <tr>
			<td style="padding: 12px 0; font-weight: 600;">New Balance:</td>
			<td style="padding: 12px 0; text-align: right; font-weight: 700; color: #111827; font-size: 18px;">{{.NewBalance}}</td>
		  </tr>
		</table>
	  </div>
	  
	  <p>Thank you for your continued support of MegaPDF. Your deposit allows you to continue using our premium PDF tools.</p>
	  
	  <div class="text-center" style="padding: 16px 0;">
		<a href="{{.DashboardURL}}" class="button-primary">View Your Account</a>
	  </div>
	  
	  <hr class="divider">
	  
	  <p class="text-small text-center">If you did not make this deposit or if you notice any issues, please contact our support team immediately.</p>
	`

	// Combine content into base template
	data := map[string]interface{}{
		"Content":       template.HTML(contentTemplate),
		"Username":      username,
		"Amount":        formattedAmount,
		"NewBalance":    formattedBalance,
		"TransactionID": transactionID,
		"DashboardURL":  dashboardURL,
		"CurrentTime":   time.Now().Format("January 2, 2006 15:04 MST"),
		"Year":          time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Deposit Confirmation",
		Template: baseTemplate,
		Data:     data,
	})
}

// Function to send a low balance warning email
func (s *EmailService) SendLowBalanceWarningEmail(to string, currentBalance float64, username string) (*EmailResult, error) {
	// Format the balance with two decimal places
	formattedBalance := fmt.Sprintf("$%.2f", currentBalance)

	// Deposit URL
	depositURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)

	// Content template for low balance warning
	contentTemplate := `
	  <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Low Balance Alert</h2>
	  <p>Hello {{if .Username}}{{.Username}}{{else}}there{{end}}!</p>
	  
	  <div class="warning-box">
		<p style="margin: 0;"><strong>Warning:</strong> Your MegaPDF account balance is running low.</p>
	  </div>
	  
	  <p>Your current account balance is <strong>{{.CurrentBalance}}</strong>. With this balance, you may not be able to perform many more PDF operations.</p>
	  
	  <p>To ensure uninterrupted access to all MegaPDF features, we recommend adding funds to your account.</p>
	  
	  <div class="text-center" style="padding: 16px 0;">
		<a href="{{.DepositURL}}" class="button-primary">Add Funds Now</a>
	  </div>
	  
	  <div class="info-box">
		<p style="margin: 0;"><strong>Reminder:</strong> Each PDF operation costs approximately $0.005 USD. Maintaining a positive balance ensures you can continue using our premium tools without interruption.</p>
	  </div>
	  
	  <hr class="divider">
	  
	  <p class="text-small text-center">If you have any questions about your account balance or billing, please contact our support team.</p>
	`

	// Combine content into base template
	data := map[string]interface{}{
		"Content":        template.HTML(contentTemplate),
		"Username":       username,
		"CurrentBalance": formattedBalance,
		"DepositURL":     depositURL,
		"Year":           time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Low Balance Alert",
		Template: baseTemplate,
		Data:     data,
	})
}

// Function to send an operation limit warning email
func (s *EmailService) SendOperationLimitWarningEmail(to string, remainingOperations int, resetDate time.Time, username string) (*EmailResult, error) {
	// Format the reset date
	formattedResetDate := resetDate.Format("Monday, January 2, 2006")

	// Upgrade URL
	upgradeURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)

	// Content template for operation limit warning
	contentTemplate := `
	  <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Operation Limit Alert</h2>
	  <p>Hello {{if .Username}}{{.Username}}{{else}}there{{end}}!</p>
	  
	  <div class="warning-box">
		<p style="margin: 0;"><strong>Notice:</strong> You're approaching your monthly free operation limit for MegaPDF.</p>
	  </div>
	  
	  <p>You have <strong>{{.RemainingOperations}} operations</strong> remaining for this month. Your free operation count will reset on <strong>{{.ResetDate}}</strong>.</p>
	  
	  <p>Options to consider:</p>
	  
	  <ul class="feature-list">
		<li class="feature-item">Add funds to your account to continue using premium features after your free operations are exhausted</li>
		<li class="feature-item">Wait until the operation count resets at the beginning of next month</li>
		<li class="feature-item">Prioritize your most important PDF tasks with your remaining operations</li>
	  </ul>
	  
	  <div class="text-center" style="padding: 16px 0;">
		<a href="{{.UpgradeURL}}" class="button-primary">Add Funds to Your Account</a>
	  </div>
	  
	  <div class="info-box">
		<p style="margin: 0;"><strong>Tip:</strong> If you regularly use MegaPDF for your work, adding funds to your account ensures uninterrupted access to all our tools.</p>
	  </div>
	  
	  <hr class="divider">
	  
	  <p class="text-small text-center">If you have any questions about our pricing or features, please contact our support team.</p>
	`

	// Combine content into base template
	data := map[string]interface{}{
		"Content":             template.HTML(contentTemplate),
		"Username":            username,
		"RemainingOperations": remainingOperations,
		"ResetDate":           formattedResetDate,
		"UpgradeURL":          upgradeURL,
		"Year":                time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Operation Limit Alert",
		Template: baseTemplate,
		Data:     data,
	})
}

// Function to send an email when operations are exhausted
func (s *EmailService) SendOperationsExhaustedEmail(to string, resetDate time.Time, username string) (*EmailResult, error) {
	// Format the reset date
	formattedResetDate := resetDate.Format("Monday, January 2, 2006")

	// Deposit URL
	depositURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)

	// Content template for exhausted operations
	contentTemplate := `
	  <h2 style="margin-top: 0; font-size: 24px; font-weight: 600; color: #111827;">Free Operations Exhausted</h2>
	  <p>Hello {{if .Username}}{{.Username}}{{else}}there{{end}}!</p>
	  
	  <div class="warning-box">
		<p style="margin: 0;"><strong>Notice:</strong> You have used all of your free PDF operations for this month.</p>
	  </div>
	  
	  <p>Your monthly free operations have been exhausted. Your operation count will reset on <strong>{{.ResetDate}}</strong>.</p>
	  
	  <p>To continue using MegaPDF services without interruption, you can add funds to your account. Each operation costs only $0.005 USD.</p>
	  
	  <div class="text-center" style="padding: 16px 0;">
		<a href="{{.DepositURL}}" class="button-primary">Add Funds Now</a>
	  </div>
	  
	  <div class="info-box">
		<p style="margin: 0;"><strong>Did you know?</strong> Adding just $5 to your account provides you with 1,000 additional PDF operations!</p>
	  </div>
	  
	  <hr class="divider">
	  
	  <p class="text-small text-center">Thank you for using MegaPDF. We appreciate your continued support.</p>
	`

	// Combine content into base template
	data := map[string]interface{}{
		"Content":    template.HTML(contentTemplate),
		"Username":   username,
		"ResetDate":  formattedResetDate,
		"DepositURL": depositURL,
		"Year":       time.Now().Year(),
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Free Operations Exhausted",
		Template: baseTemplate,
		Data:     data,
	})
}
