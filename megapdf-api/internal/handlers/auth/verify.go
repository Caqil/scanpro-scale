// internal/handlers/auth/verify.go
package auth

import (
	"net/http"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// VerifyHandler handles email verification operations
type VerifyHandler struct {
	authService *auth.Service
}

// NewVerifyHandler creates a new verification handler
func NewVerifyHandler(authService *auth.Service) *VerifyHandler {
	return &VerifyHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *VerifyHandler) Register(router *gin.RouterGroup) {
	router.GET("/verify-email", h.VerifyEmail)

	// Protected route - requires authentication
	resendGroup := router.Group("/verify-email/resend")
	resendGroup.Use(middleware.Auth())
	resendGroup.POST("", h.ResendVerification)
}

// VerifyEmail verifies a user's email address using a token
func (h *VerifyHandler) VerifyEmail(c *gin.Context) {
	// Get token from query param
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Verification token is required",
			"success": false,
		})
		return
	}

	// Verify email
	if err := h.authService.VerifyEmail(c, token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Email verified successfully",
	})
}

// ResendVerification resends the verification email to the current user
func (h *VerifyHandler) ResendVerification(c *gin.Context) {
	// Get user ID from context (set by Auth middleware)
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
		statusCode := http.StatusInternalServerError
		if err.Error() == "email is already verified" {
			statusCode = http.StatusBadRequest
		}

		c.JSON(statusCode, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// For development, return the token
	response := gin.H{
		"success": true,
		"message": "Verification email sent successfully",
	}

	if token != "" && isDevelopment() {
		response["devToken"] = token
	}

	c.JSON(http.StatusOK, response)
}
