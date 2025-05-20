package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net"
	"net/smtp"
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
	fmt.Printf("Attempting to send email to %s, subject: %s\n", data.To, data.Subject)

	if s.config.SMTPHost == "" || s.config.SMTPUser == "" || s.config.SMTPPass == "" {
		fmt.Printf("ERROR: Cannot send email - SMTP settings not configured\n")
		return &EmailResult{
			Success: false,
			Error:   "SMTP settings not configured",
		}, fmt.Errorf("SMTP settings not configured")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", s.config.EmailFrom)
	m.SetHeader("To", data.To)
	m.SetHeader("Subject", data.Subject)

	// Parse the base template and any nested templates
	tmpl, err := template.New("base").Parse(data.Template)
	if err != nil {
		fmt.Printf("ERROR: Failed to parse email template: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to parse email template: %v", err),
		}, err
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data.Data); err != nil {
		fmt.Printf("ERROR: Failed to execute email template: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to execute email template: %v", err),
		}, err
	}

	fmt.Printf("[DEBUG] Rendered email body: %s\n", body.String()) // Debug rendered output
	m.SetBody("text/html", body.String())

	if s.config.Debug {
		fmt.Printf("[DEBUG] Email content:\n%s\n", body.String())
		fmt.Printf("[DEBUG] Email would be sent in production mode\n")
		return &EmailResult{
			Success:    true,
			MessageUrl: fmt.Sprintf("http://localhost:%d/email-preview", s.config.Port),
		}, nil
	}

	smtpHostPort := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPass, s.config.SMTPHost)
	dialer := &net.Dialer{Timeout: 20 * time.Second}
	var conn net.Conn
	if s.config.SMTPSecure {
		tlsConfig := &tls.Config{ServerName: s.config.SMTPHost}
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
	client, err := smtp.NewClient(conn, s.config.SMTPHost)
	if err != nil {
		fmt.Printf("ERROR: Failed to create SMTP client: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to create SMTP client: %v", err),
		}, err
	}
	defer client.Close()
	if err := client.Auth(auth); err != nil {
		fmt.Printf("ERROR: Failed to authenticate with SMTP server: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to authenticate with SMTP server: %v", err),
		}, err
	}
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
	writer, err := client.Data()
	if err != nil {
		fmt.Printf("ERROR: Failed to open data connection: %v\n", err)
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to open data connection: %v", err),
		}, err
	}
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

// baseTemplate with professional design and red accents
const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{.Subject}}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #1a1a1a;
      color: #e0e0e0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #2a2a2a;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    .header {
      background-color: #ff3333;
      padding: 20px;
      text-align: center;
      border-bottom: 2px solid #cc0000;
    }
    .logo {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      text-transform: uppercase;
    }
    .content {
      padding: 30px;
    }
    .footer {
      background-color: #1a1a1a;
      padding: 20px;
      font-size: 12px;
      color: #999999;
      text-align: center;
      border-top: 1px solid #444444;
    }
    .button {
      display: inline-block;
      background-color: #ff3333;
      color: #ffffff;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #cc0000;
    }
    .info-box {
      background-color: #333333;
      border-left: 4px solid #ff6666;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
    }
    .warning-box {
      background-color: #4a0000;
      border-left: 4px solid #ff3333;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      color: #ff9999;
    }
    .success-box {
      background-color: #003300;
      border-left: 4px solid #00cc00;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      color: #99ff99;
    }
    .divider {
      border: none;
      height: 1px;
      background-color: #444444;
      margin: 20px 0;
    }
    .text-center {
      text-align: center;
    }
    .text-muted {
      color: #999999;
      font-size: 14px;
    }
    .link {
      color: #ff6666;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
    .feature-list {
      margin: 15px 0;
      padding-left: 20px;
      list-style-type: none;
    }
    .feature-item {
      position: relative;
      padding: 8px 0;
    }
    .feature-item:before {
      content: '✓';
      position: absolute;
      left: -20px;
      color: #ff3333;
      font-weight: bold;
    }
    .code-block {
      background-color: #222222;
      border: 1px solid #555555;
      border-radius: 5px;
      padding: 12px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #e0e0e0;
      margin: 15px 0;
      word-break: break-all;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .table td {
      padding: 10px 0;
      border-bottom: 1px solid #555555;
    }
    .table td:first-child {
      color: #999999;
    }
    .table td:last-child {
      text-align: right;
      font-weight: 500;
      color: #ffffff;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100%;
        margin: 0;
        border-radius: 0;
      }
      .header {
        padding: 15px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">MegaPDF</h1>
    </div>
    <div class="content">
      {{.Content}}
    </div>
    <div class="footer">
      {{if .FooterContent}}
        {{.FooterContent}}
      {{else}}
        <p>© {{.Year}} MegaPDF. All rights reserved.</p>
        <p><a href="#" class="link">Privacy Policy</a> | <a href="#" class="link">Terms of Service</a> | <a href="#" class="link">Contact Support</a></p>
      {{end}}
    </div>
  </div>
</body>
</html>
`

// SendVerificationEmail sends an email verification email
func (s *EmailService) SendVerificationEmail(to, token string, name string) (*EmailResult, error) {
	verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", s.config.AppURL, token)
	displayName := name
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Verify Your Email</h2>
      <p>Hello {{.Name}},</p>
      <p>Thank you for joining MegaPDF. Please verify your email to activate your account.</p>
      <div class="text-center">
        <a href="{{.VerifyUrl}}" class="button">Verify Email</a>
      </div>
      <div class="info-box">
        <p style="margin: 0;">This link expires in 24 hours.</p>
      </div>
      <p class="text-muted">If you didn’t sign up, please ignore this email.</p>
      <div class="code-block">{{.VerifyUrl}}</div>
      <h3 style="font-size: 18px; font-weight: 600; color: #ff9999;">Why Verify?</h3>
      <ul class="feature-list">
        <li class="feature-item">Secure your account</li>
        <li class="feature-item">Receive important notifications</li>
        <li class="feature-item">Enable account recovery</li>
      </ul>
    `
	data := map[string]interface{}{
		"Content":   template.HTML(contentTemplate),
		"Name":      displayName,
		"VerifyUrl": verifyUrl,
		"Year":      time.Now().Year(),
		"Subject":   "MegaPDF Email Verification",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Email Verification",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendPasswordResetEmail sends a password reset email
func (s *EmailService) SendPasswordResetEmail(to, token string) (*EmailResult, error) {
	resetUrl := fmt.Sprintf("%s/en/reset-password?token=%s", s.config.AppURL, token)
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Password Reset Request</h2>
      <p>We received a request to reset your MegaPDF account password. Click the button below to set a new password:</p>
      <div class="text-center">
        <a href="{{.ResetUrl}}" class="button">Reset Password</a>
      </div>
      <div class="info-box">
        <p style="margin: 0;">This link expires in 1 hour for security reasons.</p>
      </div>
      <p class="text-muted">If you didn’t request a password reset, please ignore this email or contact support.</p>
      <div class="code-block">{{.ResetUrl}}</div>
      <p class="text-muted">Request received at {{.CurrentTime}}.</p>
    `
	data := map[string]interface{}{
		"Content":     template.HTML(contentTemplate),
		"ResetUrl":    resetUrl,
		"CurrentTime": time.Now().UTC().Format(time.RFC1123),
		"Year":        time.Now().Year(),
		"Subject":     "MegaPDF Password Reset",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Password Reset",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendPasswordResetSuccessEmail sends a password reset success email
func (s *EmailService) SendPasswordResetSuccessEmail(to string, name string) (*EmailResult, error) {
	loginUrl := fmt.Sprintf("%s/en/login", s.config.AppURL)
	displayName := name
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Password Reset Successful</h2>
      <p>Hello {{.Name}},</p>
      <div class="success-box">
        <p style="margin: 0;">Your password has been successfully updated.</p>
      </div>
      <p>You can now sign in with your new password.</p>
      <div class="text-center">
        <a href="{{.LoginUrl}}" class="button">Sign In</a>
      </div>
      <div class="warning-box">
        <p style="margin: 0;">If you didn’t make this change, contact support immediately.</p>
      </div>
      <h3 style="font-size: 18px; font-weight: 600; color: #ff9999;">Security Tips</h3>
      <ul class="feature-list">
        <li class="feature-item">Use a strong, unique password</li>
        <li class="feature-item">Enable two-factor authentication</li>
        <li class="feature-item">Monitor account activity regularly</li>
      </ul>
    `
	data := map[string]interface{}{
		"Content":  template.HTML(contentTemplate),
		"Name":     displayName,
		"LoginUrl": loginUrl,
		"Year":     time.Now().Year(),
		"Subject":  "MegaPDF Password Reset Successful",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Password Reset Successful",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendDepositConfirmationEmail sends a deposit confirmation email
func (s *EmailService) SendDepositConfirmationEmail(to string, amount float64, newBalance float64, transactionID string, username string) (*EmailResult, error) {
	formattedAmount := fmt.Sprintf("$%.2f", amount)
	formattedBalance := fmt.Sprintf("$%.2f", newBalance)
	dashboardURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)
	displayName := username
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Deposit Confirmation</h2>
      <p>Hello {{.Username}},</p>
      <div class="success-box">
        <p style="margin: 0;">Your deposit of {{.Amount}} was successfully processed.</p>
      </div>
      <table class="table">
        <tr><td>Transaction ID</td><td>{{.TransactionID}}</td></tr>
        <tr><td>Date</td><td>{{.CurrentTime}}</td></tr>
        <tr><td>Amount</td><td>{{.Amount}}</td></tr>
        <tr><td>New Balance</td><td>{{.NewBalance}}</td></tr>
      </table>
      <div class="text-center">
        <a href="{{.DashboardURL}}" class="button">View Account</a>
      </div>
      <p class="text-muted">If you didn’t make this deposit, contact support immediately.</p>
    `
	data := map[string]interface{}{
		"Content":       template.HTML(contentTemplate),
		"Username":      displayName,
		"Amount":        formattedAmount,
		"NewBalance":    formattedBalance,
		"TransactionID": transactionID,
		"DashboardURL":  dashboardURL,
		"CurrentTime":   time.Now().Format("January 2, 2006 15:04 MST"),
		"Year":          time.Now().Year(),
		"Subject":       "MegaPDF Deposit Confirmation",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Deposit Confirmation",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendLowBalanceWarningEmail sends a low balance warning email
func (s *EmailService) SendLowBalanceWarningEmail(to string, currentBalance float64, username string) (*EmailResult, error) {
	formattedBalance := fmt.Sprintf("$%.2f", currentBalance)
	depositURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)
	displayName := username
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Low Balance Alert</h2>
      <p>Hello {{.Username}},</p>
      <div class="warning-box">
        <p style="margin: 0;">Your account balance is running low at {{.CurrentBalance}}.</p>
      </div>
      <p>To continue using MegaPDF without interruption, please add funds to your account.</p>
      <div class="text-center">
        <a href="{{.DepositURL}}" class="button">Add Funds</a>
      </div>
      <div class="info-box">
        <p style="margin: 0;">Each PDF operation costs approximately $0.005 USD.</p>
      </div>
      <p class="text-muted">Contact support if you have questions about your balance.</p>
    `
	data := map[string]interface{}{
		"Content":        template.HTML(contentTemplate),
		"Username":       displayName,
		"CurrentBalance": formattedBalance,
		"DepositURL":     depositURL,
		"Year":           time.Now().Year(),
		"Subject":        "MegaPDF Low Balance Alert",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Low Balance Alert",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendOperationLimitWarningEmail sends an operation limit warning email
func (s *EmailService) SendOperationLimitWarningEmail(to string, remainingOperations int, resetDate time.Time, username string) (*EmailResult, error) {
	formattedResetDate := resetDate.Format("January 2, 2006")
	upgradeURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)
	displayName := username
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Operation Limit Alert</h2>
      <p>Hello {{.Username}},</p>
      <div class="warning-box">
        <p style="margin: 0;">You have {{.RemainingOperations}} free operations left this month.</p>
      </div>
      <p>Your free operations will reset on {{.ResetDate}}. To continue using MegaPDF, consider adding funds.</p>
      <div class="text-center">
        <a href="{{.UpgradeURL}}" class="button">Add Funds</a>
      </div>
      <ul class="feature-list">
        <li class="feature-item">Add funds for uninterrupted access</li>
        <li class="feature-item">Wait for the reset on {{.ResetDate}}</li>
        <li class="feature-item">Prioritize tasks with remaining operations</li>
      </ul>
      <p class="text-muted">Contact support for pricing or feature questions.</p>
    `
	data := map[string]interface{}{
		"Content":             template.HTML(contentTemplate),
		"Username":            displayName,
		"RemainingOperations": remainingOperations,
		"ResetDate":           formattedResetDate,
		"UpgradeURL":          upgradeURL,
		"Year":                time.Now().Year(),
		"Subject":             "MegaPDF Operation Limit Alert",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Operation Limit Alert",
		Template: baseTemplate,
		Data:     data,
	})
}

// SendOperationsExhaustedEmail sends an email when operations are exhausted
func (s *EmailService) SendOperationsExhaustedEmail(to string, resetDate time.Time, username string) (*EmailResult, error) {
	formattedResetDate := resetDate.Format("January 2, 2006")
	depositURL := fmt.Sprintf("%s/en/dashboard/billing", s.config.AppURL)
	displayName := username
	if displayName == "" {
		displayName = "User"
	}
	contentTemplate := `
      <h2 style="font-size: 24px; font-weight: 700; color: #ff6666; margin-top: 0;">Free Operations Exhausted</h2>
      <p>Hello {{.Username}},</p>
      <div class="warning-box">
        <p style="margin: 0;">You’ve used all your free PDF operations this month.</p>
      </div>
      <p>Your free operations will reset on {{.ResetDate}}. Add funds to continue using MegaPDF now.</p>
      <div class="text-center">
        <a href="{{.DepositURL}}" class="button">Add Funds</a>
      </div>
      <div class="info-box">
        <p style="margin: 0;">A $5 deposit provides 1,000 additional operations.</p>
      </div>
      <p class="text-muted">Thank you for choosing MegaPDF.</p>
    `
	data := map[string]interface{}{
		"Content":    template.HTML(contentTemplate),
		"Username":   displayName,
		"ResetDate":  formattedResetDate,
		"DepositURL": depositURL,
		"Year":       time.Now().Year(),
		"Subject":    "MegaPDF Free Operations Exhausted",
	}
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Free Operations Exhausted",
		Template: baseTemplate,
		Data:     data,
	})
}
