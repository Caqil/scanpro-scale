// internal/handlers/auth/login.go
package auth

import (
	"net/http"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// LoginHandler handles user login operations
type LoginHandler struct {
	authService *auth.Service
}

// NewLoginHandler creates a new login handler
func NewLoginHandler(authService *auth.Service) *LoginHandler {
	return &LoginHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *LoginHandler) Register(router *gin.RouterGroup) {
	router.POST("/login", h.Login)
}

// Login handles user authentication and returns a JWT token
func (h *LoginHandler) Login(c *gin.Context) {
	// Parse request body
	var request struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"success": false,
		})
		return
	}

	// Authenticate user
	tokenResponse, err := h.authService.Login(c, request.Email, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// Return token response
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"accessToken": tokenResponse.AccessToken,
		"expiresAt":   tokenResponse.ExpiresAt,
		"tokenType":   tokenResponse.TokenType,
		"user": gin.H{
			"id":                      tokenResponse.User.ID,
			"name":                    tokenResponse.User.Name,
			"email":                   tokenResponse.User.Email,
			"role":                    tokenResponse.User.Role,
			"isEmailVerified":         tokenResponse.User.IsEmailVerified,
			"balance":                 tokenResponse.User.Balance,
			"freeOperationsUsed":      tokenResponse.User.FreeOperationsUsed,
			"freeOperationsRemaining": tokenResponse.User.FreeOperationsRemaining,
			"freeOperationsReset":     tokenResponse.User.FreeOperationsReset,
		},
	})
}
