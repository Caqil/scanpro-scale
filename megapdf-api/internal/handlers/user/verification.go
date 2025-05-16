// internal/handlers/user/verification.go
package user

import (
	"net/http"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// VerificationHandler manages email verification operations
type VerificationHandler struct {
	authService *auth.Service
}

// NewVerificationHandler creates a new verification handler
func NewVerificationHandler(authService *auth.Service) *VerificationHandler {
	return &VerificationHandler{
		authService: authService,
	}
}

// VerifyEmail verifies a user's email using the verification token
func (h *VerificationHandler) VerifyEmail(c *gin.Context) {
	// Get token from query parameter
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Verification token is required",
			"success": false,
		})
		return
	}

	// Verify email
	err := h.authService.VerifyEmail(c, token)
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
		"message": "Email verified successfully",
	})
}

// ResendVerificationEmail resends the verification email to the user
func (h *VerificationHandler) ResendVerificationEmail(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Resend verification email
	token, err := h.authService.ResendVerificationEmail(c, userID.(string))
	if err != nil {
		// Handle specific error cases
		if err.Error() == "email is already verified" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Email is already verified",
				"success": false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to resend verification email",
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verification email sent successfully",
	})
}
