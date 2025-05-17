// internal/services/email_service.go
package services

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"github.com/Caqil/megapdf-api/internal/config"
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
	if s.config.Debug {
		fmt.Printf("[DEBUG] Sending email to %s, subject: %s\n", data.To, data.Subject)
	}

	// Create a new message
	m := gomail.NewMessage()
	m.SetHeader("From", s.config.EmailFrom)
	m.SetHeader("To", data.To)
	m.SetHeader("Subject", data.Subject)

	// Parse the template
	tmpl, err := template.New(filepath.Base(data.Template)).Parse(data.Template)
	if err != nil {
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to parse email template: %v", err),
		}, err
	}

	// Execute the template with the provided data
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data.Data); err != nil {
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
		return &EmailResult{
			Success:    true,
			MessageUrl: fmt.Sprintf("http://localhost:%d/email-preview", s.config.Port),
		}, nil
	}

	// Configure the dialer
	d := gomail.NewDialer(
		s.config.SMTPHost,
		s.config.SMTPPort,
		s.config.SMTPUser,
		s.config.SMTPPass,
	)
	d.SSL = s.config.SMTPSecure

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return &EmailResult{
			Success: false,
			Error:   fmt.Sprintf("Failed to send email: %v", err),
		}, err
	}

	return &EmailResult{
		Success: true,
	}, nil
}

// SendPasswordResetEmail sends a password reset email
func (s *EmailService) SendPasswordResetEmail(to, token string) (*EmailResult, error) {
	// URL for password reset
	resetUrl := fmt.Sprintf("%s/en/reset-password?token=%s", s.config.AppURL, token)

	// Email template
	template := `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2>Password Reset Request</h2>
			<p>You requested a password reset for your MegaPDF account.</p>
			<p>Click the button below to reset your password. This link will expire in 1 hour.</p>
			<div style="margin: 30px 0;">
				<a href="{{.ResetUrl}}" 
				   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
				   Reset Password
				</a>
			</div>
			<p>If you did not request this password reset, please ignore this email.</p>
			<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
			<p style="color: #6B7280; font-size: 14px;">MegaPDF - PDF Tools</p>
		</div>
	`

	// Data for the template
	data := map[string]interface{}{
		"ResetUrl": resetUrl,
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Password Reset",
		Template: template,
		Data:     data,
	})
}

// SendVerificationEmail sends an email verification email
func (s *EmailService) SendVerificationEmail(to, token string, name string) (*EmailResult, error) {
	// URL for email verification
	verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", s.config.AppURL, token)

	// Email template
	template := `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2>Verify Your Email</h2>
			<p>Hello {{.Name}},</p>
			<p>Thank you for registering with MegaPDF. Please verify your email address by clicking the button below.</p>
			<div style="margin: 30px 0;">
				<a href="{{.VerifyUrl}}" 
				   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
				   Verify Email
				</a>
			</div>
			<p>If you did not create an account, please ignore this email.</p>
			<hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
			<p style="color: #6B7280; font-size: 14px;">MegaPDF - PDF Tools</p>
		</div>
	`

	// Data for the template
	data := map[string]interface{}{
		"Name":      name,
		"VerifyUrl": verifyUrl,
	}

	// Send the email
	return s.SendEmail(EmailData{
		To:       to,
		Subject:  "MegaPDF Email Verification",
		Template: template,
		Data:     data,
	})
}
