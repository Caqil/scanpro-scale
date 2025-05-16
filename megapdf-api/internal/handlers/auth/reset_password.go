// internal/handlers/auth/reset_password.go
package auth

import (
	"net/http"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// ResetPasswordHandler handles password reset operations
type ResetPasswordHandler struct {
	authService *auth.Service
}

// NewResetPasswordHandler creates a new password reset handler
func NewResetPasswordHandler(authService *auth.Service) *ResetPasswordHandler {
	return &ResetPasswordHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *ResetPasswordHandler) Register(router *gin.RouterGroup) {
	router.POST("/reset-password", h.RequestReset)
	router.GET("/reset-password", h.VerifyToken)
	router.POST("/reset-password/confirm", h.ConfirmReset)
}

// RequestReset initiates the password reset process
func (h *ResetPasswordHandler) RequestReset(c *gin.Context) {
	// Parse request body
	var request struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Email is required",
			"success": false,
		})
		return
	}

	// Generate and send reset token
	token, err := h.authService.RequestPasswordReset(c, request.Email)
	
	// For security, don't reveal if the email exists or not
	// Always return success even if the email doesn't exist
	response := gin.H{
		"success": true,
		"message": "If an account with this email exists, a password reset link has been sent",
	}

	// For development, return the token and preview URL
	if token != "" && isDevelopment() {
		response["devToken"] = token
		response["previewUrl"] = "/dev/email-preview?token=" + token
	}

	c.JSON(http.StatusOK, response)
}

// VerifyToken validates a password reset token
func (h *ResetPasswordHandler) VerifyToken(c *gin.Context) {
	// Get token from query param
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
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "An error occurred verifying the token",
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": valid,
		"email": valid ? email : nil,
	})
}

// ConfirmReset completes the password reset process
func (h *ResetPasswordHandler) ConfirmReset(c *gin.Context) {
	// Parse request body
	var request struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Token and password are required",
			"success": false,
		})
		return
	}

	// Validate token before updating password
	valid, _, err := h.authService.ValidateResetToken(c, request.Token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "An error occurred validating the token",
			"success": false,
		})
		return
	}

	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid or expired token",
			"success": false,
		})
		return
	}

	// Reset password
	if err := h.authService.ResetPassword(c, request.Token, request.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "An error occurred updating your password: " + err.Error(),
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password has been reset successfully",
	})
}

// isDevelopment checks if the app is running in development mode
func isDevelopment() bool {
	return os.Getenv("ENVIRONMENT") == "development"
}