package user

import (
	"net/http"

	"megapdf-api/internal/models"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// PasswordHandler manages user password operations
type PasswordHandler struct {
	authService *auth.Service
}

// NewPasswordHandler creates a new password handler
func NewPasswordHandler(authService *auth.Service) *PasswordHandler {
	return &PasswordHandler{
		authService: authService,
	}
}

// ChangePassword changes the user's password
func (h *PasswordHandler) ChangePassword(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Parse request body
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Validate password
	if len(req.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password must be at least 8 characters long",
			"success": false,
		})
		return
	}

	// Update password
	err := h.authService.ChangePassword(c, userID.(string), req.CurrentPassword, req.NewPassword)
	if err != nil {
		// Handle specific error cases
		if err.Error() == "current password is incorrect" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Current password is incorrect",
				"success": false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to change password",
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password updated successfully",
	})
}

// RequestPasswordReset initiates a password reset
func (h *PasswordHandler) RequestPasswordReset(c *gin.Context) {
	// Parse request body
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid email address",
			"success": false,
		})
		return
	}

	// Request password reset
	_, err := h.authService.RequestPasswordReset(c, req.Email)
	if err != nil {
		// Don't reveal if user exists or not
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "If an account with this email exists, a password reset link has been sent",
		})
		return
	}

	// Return success response (even if user doesn't exist for security)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "If an account with this email exists, a password reset link has been sent",
	})
}

// ResetPassword resets a user's password using a token
func (h *PasswordHandler) ResetPassword(c *gin.Context) {
	// Parse request body
	var req models.ConfirmPasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Validate password
	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password must be at least 8 characters long",
			"success": false,
		})
		return
	}

	// Reset password
	err := h.authService.ResetPassword(c, req.Token, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password has been reset successfully",
	})
}

// ValidateResetToken validates a password reset token
func (h *PasswordHandler) ValidateResetToken(c *gin.Context) {
	// Get token from query parameter
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Token is required",
			"success": false,
		})
		return
	}

	// Validate token
	valid, email, err := h.authService.ValidateResetToken(c, token)
	if err != nil || !valid {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"email": email,
	})
}