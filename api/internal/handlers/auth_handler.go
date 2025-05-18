// internal/handlers/auth_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/db"
	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthHandler struct {
	service      *services.AuthService
	jwtSecret    string
	emailService *services.EmailService
	config       *config.Config // Add this field
}

// Updated NewAuthHandler constructor
func NewAuthHandler(service *services.AuthService, jwtSecret string, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		service:   service,
		jwtSecret: jwtSecret,
		config:    cfg,
	}
}
func (h *AuthHandler) ValidateToken(c *gin.Context) {
	var token string

	// Try to get token from header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}

	// If no token in header, try cookie
	if token == "" {
		cookieToken, err := c.Cookie("authToken")
		if err == nil && cookieToken != "" {
			token = cookieToken
		}
	}

	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "No token provided",
		})
		return
	}

	// Validate the token
	userID, err := h.service.ValidateToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Invalid token",
		})
		return
	}

	// Get user data to include role
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "User not found",
		})
		return
	}

	// Token is valid
	c.JSON(http.StatusOK, gin.H{
		"valid":  true,
		"userId": userID,
		"role":   user.Role,
	})
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	// Parse request
	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Register user
	result, err := h.service.Register(req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !result.Success {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}

	// Track if email was actually sent
	emailSent := false

	// Send verification email if email service is available
	if h.emailService != nil && result.User.VerificationToken != nil {
		// Get user directly to ensure we have the verification token
		verificationToken := *result.User.VerificationToken

		emailResult, emailErr := h.emailService.SendVerificationEmail(
			result.User.Email,
			verificationToken,
			result.User.Name,
		)

		if emailErr == nil && emailResult.Success {
			emailSent = true
			// Log success in debug mode
			if c.GetString("mode") == "development" {
				fmt.Printf("[DEBUG] Verification email sent to %s\n", result.User.Email)
			}
		} else {
			// Log the error but don't fail registration
			errMsg := "Unknown error"
			if emailErr != nil {
				errMsg = emailErr.Error()
			} else if emailResult != nil {
				errMsg = emailResult.Error
			}
			fmt.Printf("Failed to send verification email: %s\n", errMsg)
		}
	} else {
		fmt.Println("Email service not configured or verification token missing")
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token,
		"user": gin.H{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
		},
		"emailSent": emailSent, // Accurately report if email was sent
	})
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	// Parse request
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !result.Success {
		c.JSON(http.StatusUnauthorized, gin.H{"error": result.Error})
		return
	}

	// Determine if request is secure
	secure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"

	// Set token as HTTP-only cookie
	c.SetCookie(
		"authToken",  // Cookie name
		result.Token, // Cookie value
		60*60*24*7,   // Max age (7 days in seconds)
		"/",          // Path
		"",           // Domain (empty = current domain)
		secure,       // Secure (based on protocol)
		true,         // HTTP only
	)

	// Return success response with token for localStorage
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token, // Include token for localStorage
		"user": gin.H{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
			"role":            result.User.Role,
		},
	})
}
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear the authToken cookie
	c.SetCookie(
		"authToken", // Cookie name
		"",          // Empty value
		-1,          // Negative maxAge to delete the cookie
		"/",         // Path
		"",          // Domain
		false,       // Secure
		true,        // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

// RequestPasswordReset handles password reset requests
func (h *AuthHandler) RequestPasswordReset(c *gin.Context) {
	// Parse request
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	// Request password reset
	token, err := h.service.RequestPasswordReset(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process reset request"})
		return
	}

	// For security, don't reveal if email exists
	if token == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "If an account with this email exists, a password reset link has been sent",
		})
		return
	}

	// Send password reset email
	if h.emailService != nil {
		emailResult, err := h.emailService.SendPasswordResetEmail(req.Email, token.Token)
		if err != nil || !emailResult.Success {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Error sending password reset email. Please try again later.",
				"error":   err.Error(),
			})
			return
		}

		// For development, return token and preview URL
		devDetails := gin.H{}
		if c.GetString("mode") == "development" {
			devDetails["devToken"] = token.Token
			devDetails["previewUrl"] = emailResult.MessageUrl
		}

		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"message":    "Password reset link has been sent",
			"devDetails": devDetails,
		})
	} else {
		// Email service not configured
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Password reset link would be sent (email service not configured)",
			"token":   token.Token, // Only in development
		})
	}
}

// ValidateResetToken checks if a reset token is valid
func (h *AuthHandler) ValidateResetToken(c *gin.Context) {
	// Get token from query
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required", "valid": false})
		return
	}

	// Validate token
	valid, err := h.service.ValidateResetToken(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate token", "valid": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": valid,
		"message": map[bool]string{
			true:  "Token is valid",
			false: "Token is invalid or has expired",
		}[valid],
	})
}

// ResetPassword resets a user's password using a token
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	// Parse request
	var req struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token and password are required"})
		return
	}

	// Get user info from token to send confirmation email later
	var resetToken models.PasswordResetToken
	if err := db.DB.Where("token = ?", req.Token).First(&resetToken).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	// Get user details for email
	var user models.User
	if err := db.DB.Where("email = ?", resetToken.Email).First(&user).Error; err != nil {
		// Continue with password reset even if we can't find user details
		fmt.Printf("Warning: Could not get user details for reset confirmation email: %v\n", err)
	}

	// Reset password
	err := h.service.ResetPassword(req.Token, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Send confirmation email if email service is available
	emailSent := false
	if h.emailService != nil {
		emailResult, err := h.emailService.SendPasswordResetSuccessEmail(
			resetToken.Email,
			user.Name,
		)

		if err == nil && emailResult.Success {
			emailSent = true
			// Log success in debug mode
			if c.GetString("mode") == "development" {
				fmt.Printf("[DEBUG] Password reset confirmation email sent to %s\n", resetToken.Email)
			}
		} else {
			// Log the error but don't fail the password reset
			errMsg := "Unknown error"
			if err != nil {
				errMsg = err.Error()
			} else if emailResult != nil {
				errMsg = emailResult.Error
			}
			fmt.Printf("Failed to send password reset confirmation email: %s\n", errMsg)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Password has been reset successfully",
		"emailSent": emailSent,
	})
}

// VerifyEmail verifies a user's email using a token
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	// Get token from query
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
		return
	}

	// Verify email
	err := h.service.VerifyEmail(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Email verified successfully",
	})
}

// ResendVerificationEmail resends a verification email to the user
func (h *AuthHandler) ResendVerificationEmail(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}

	fmt.Printf("Request to resend verification email for user ID: %s\n", userID)

	// Get user from database
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Check if email is already verified
	if user.IsEmailVerified {
		fmt.Printf("User %s email is already verified\n", userID)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email is already verified",
		})
		return
	}

	// Generate new verification token if needed
	var verificationToken string

	if user.VerificationToken == nil || *user.VerificationToken == "" {
		// Generate new token
		verificationToken = uuid.New().String()

		// Update user
		if err := db.DB.Model(&user).Update("verification_token", verificationToken).Error; err != nil {
			fmt.Printf("Error updating verification token: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate verification token",
			})
			return
		}
	} else {
		// Use existing token
		verificationToken = *user.VerificationToken
	}

	fmt.Printf("Using verification token: %s for user: %s (%s)\n", verificationToken, user.ID, user.Email)

	// Check if email service is properly configured
	if h.emailService == nil {
		fmt.Println("Email service is not initialized")

		// In development mode, provide the token directly
		if c.GetString("mode") == "development" {
			c.JSON(http.StatusOK, gin.H{
				"success":            true,
				"message":            "DEVELOPMENT MODE: Verification would be sent in production",
				"devVerificationUrl": fmt.Sprintf("%s/api/auth/verify-email?token=%s", h.config.AppURL, verificationToken),
				"devNote":            "Configure SMTP settings to send actual emails",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Email service not configured",
			})
		}
		return
	}

	// Use function in email service to create verification URL
	verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", h.config.AppURL, verificationToken)
	fmt.Printf("Verification URL: %s\n", verifyUrl)

	// Create email template
	template := `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Hello {{.Name}},</p>
            <p>Thank you for registering with MegaPDF. Please verify your email address by clicking the button below.</p>
            <div style="margin: 30px 0; text-align: center;">
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

	userName := user.Name
	if userName == "" {
		userName = "there" // Default if name is empty
	}

	// Send verification email
	emailResult, err := h.emailService.SendEmail(services.EmailData{
		To:       user.Email,
		Subject:  "MegaPDF Email Verification",
		Template: template,
		Data: map[string]interface{}{
			"Name":      userName,
			"VerifyUrl": verifyUrl,
		},
	})

	// Check for SMTP configuration error specifically
	if err != nil && strings.Contains(err.Error(), "SMTP settings not configured") {
		// For development, provide the token directly so testing can continue
		if c.GetString("mode") == "development" {
			c.JSON(http.StatusOK, gin.H{
				"success":            true,
				"message":            "DEVELOPMENT MODE: Email sending skipped due to missing SMTP settings",
				"devVerificationUrl": verifyUrl,
				"devNote":            "Configure SMTP settings to send actual emails",
			})
		} else {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error":   "Email service not properly configured",
				"details": "The server's email configuration is incomplete",
			})
		}
		return
	}

	if err != nil {
		fmt.Printf("Error sending verification email: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to send verification email: %v", err),
		})
		return
	}

	if !emailResult.Success {
		fmt.Printf("Email sending failed: %s\n", emailResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to send verification email: %s", emailResult.Error),
		})
		return
	}

	// Return success response
	fmt.Printf("Verification email sent successfully to %s\n", user.Email)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verification email sent successfully",
	})
}

// SetEmailService sets the email service for this handler
func (h *AuthHandler) SetEmailService(emailService *services.EmailService) {
	h.emailService = emailService
}
