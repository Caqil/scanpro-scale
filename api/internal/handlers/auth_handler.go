// internal/handlers/auth_handler.go
package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/db"
	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service      *services.AuthService
	jwtSecret    string
	emailService *services.EmailService
}

func NewAuthHandler(service *services.AuthService, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		service:   service,
		jwtSecret: jwtSecret,
	}
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
		"emailSent": true, // This should be based on actual email success
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

	// Set token as HTTP-only cookie
	c.SetCookie(
		"authToken",  // Cookie name
		result.Token, // Cookie value
		60*60*24*7,   // Max age (7 days in seconds)
		"/",          // Path
		"",           // Domain (empty = current domain)
		false,        // Secure (true in production with HTTPS)
		true,         // HTTP only
	)

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token, // Still include token in response
		"user": gin.H{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
			"role":            result.User.Role,
		},
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

	// Reset password
	err := h.service.ResetPassword(req.Token, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password has been reset successfully",
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Get user from database
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if email is already verified
	if user.IsEmailVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
		return
	}

	// Generate new verification token
	verificationToken, err := h.service.ResendVerificationEmail(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resend verification email"})
		return
	}

	// Send verification email
	if user.Email != "" && h.emailService != nil {
		emailResult, err := h.emailService.SendVerificationEmail(
			user.Email,
			verificationToken,
			user.Name,
		)

		if err != nil || !emailResult.Success {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Verification email sent successfully",
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User has no email address or email service not configured",
		})
	}
}

// SetEmailService sets the email service for this handler
func (h *AuthHandler) SetEmailService(emailService *services.EmailService) {
	h.emailService = emailService
}
