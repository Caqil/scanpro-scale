// internal/handlers/utils/contact.go
package utils

import (
	"net/http"
	"strings"

	"megapdf-api/pkg/email"

	"github.com/gin-gonic/gin"
)

// ContactHandler handles contact form submissions
type ContactHandler struct {
	emailService email.EmailService
	contactEmail string
}

// NewContactHandler creates a new contact handler
func NewContactHandler(emailService email.EmailService, contactEmail string) *ContactHandler {
	return &ContactHandler{
		emailService: emailService,
		contactEmail: contactEmail,
	}
}

// SubmitContactForm handles contact form submissions
func (h *ContactHandler) SubmitContactForm(c *gin.Context) {
	// Parse request body
	var req struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Subject string `json:"subject" binding:"required"`
		Message string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing or invalid fields",
			"success": false,
		})
		return
	}

	// Basic spam prevention: check for typical spam patterns
	if h.containsSpamPatterns(req.Subject) || h.containsSpamPatterns(req.Message) {
		// Still return success to avoid spam bots from knowing they're detected
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Message sent successfully",
		})
		return
	}

	// Build email content
	subject := "Contact Form: " + req.Subject
	textBody := h.buildTextEmailContent(req.Name, req.Email, req.Subject, req.Message)
	htmlBody := h.buildHTMLEmailContent(req.Name, req.Email, req.Subject, req.Message)

	// Send the email
	err := h.emailService.SendEmail(email.EmailMessage{
		To:       h.contactEmail,
		From:     h.emailService.GetFromAddress(),
		ReplyTo:  req.Email,
		Subject:  subject,
		TextBody: textBody,
		HTMLBody: htmlBody,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to send message",
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Message sent successfully",
	})
}

// buildTextEmailContent creates the plain text version of the contact email
func (h *ContactHandler) buildTextEmailContent(name, email, subject, message string) string {
	return `New message from ` + name + ` (` + email + `)

Subject: ` + subject + `

Message:
` + message
}

// buildHTMLEmailContent creates the HTML version of the contact email
func (h *ContactHandler) buildHTMLEmailContent(name, email, subject, message string) string {
	return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>New Contact Form Submission</h2>
  <p><strong>Name:</strong> ` + name + `</p>
  <p><strong>Email:</strong> ` + email + `</p>
  <p><strong>Subject:</strong> ` + subject + `</p>
  <hr />
  <h3>Message:</h3>
  <p>` + message + `</p>
</div>
`
}

// containsSpamPatterns checks if a text contains common spam patterns
func (h *ContactHandler) containsSpamPatterns(text string) bool {
	// This is a simple example - in a real implementation, you'd want more
	// sophisticated spam detection
	spamPatterns := []string{
		"viagra",
		"cialis",
		"casino",
		"lottery",
		"bitcoin investment",
		"crypto investment",
		"make money fast",
		"wealthy",
		"inheritance",
	}

	text = strings.ToLower(text)
	for _, pattern := range spamPatterns {
		if strings.Contains(text, pattern) {
			return true
		}
	}

	return false
}