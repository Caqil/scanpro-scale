// internal/handlers/auth/register.go
package auth

import (
	"net/http"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// RegisterHandler handles user registration operations
type RegisterHandler struct {
	authService *auth.Service
}

// NewRegisterHandler creates a new registration handler
func NewRegisterHandler(authService *auth.Service) *RegisterHandler {
	return &RegisterHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *RegisterHandler) Register(router *gin.RouterGroup) {
	router.POST("/register", h.RegisterUser)
}

// RegisterUser handles new user registration
func (h *RegisterHandler) RegisterUser(c *gin.Context) {
	// Parse request body
	var request struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"success": false,
		})
		return
	}

	// Register user
	user, err := h.authService.Register(c, request.Name, request.Email, request.Password)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "user with this email already exists" {
			statusCode = http.StatusConflict
		}

		c.JSON(statusCode, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// Calculate free operations remaining
	freeOpsRemaining := 500 // FREE_OPERATIONS_MONTHLY
	if user.FreeOperationsUsed > 0 {
		freeOpsRemaining = freeOpsRemaining - user.FreeOperationsUsed
	}

	// Return user details
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"user": gin.H{
			"id":                     user.ID,
			"name":                   user.Name,
			"email":                  user.Email,
			"isEmailVerified":        user.IsEmailVerified,
			"balance":                user.Balance,
			"freeOperationsUsed":     user.FreeOperationsUsed,
			"freeOperationsRemaining": freeOpsRemaining,
			"freeOperationsReset":    user.FreeOperationsReset,
		},
		"emailSent": true, // Assuming email always sent successfully
	})
}