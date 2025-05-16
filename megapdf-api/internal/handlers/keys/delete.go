// internal/handlers/keys/delete.go
package keys

import (
	"net/http"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// DeleteHandler handles deletion of API keys
type DeleteHandler struct {
	authService *auth.Service
}

// NewDeleteHandler creates a new delete handler
func NewDeleteHandler(authService *auth.Service) *DeleteHandler {
	return &DeleteHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *DeleteHandler) Register(router *gin.RouterGroup) {
	// Protected route - requires authentication
	router.Use(middleware.Auth())
	router.DELETE("/:id", h.DeleteKey)
}

// DeleteKey revokes an API key
func (h *DeleteHandler) DeleteKey(c *gin.Context) {
	// Get user ID from context (set by Auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"success": false,
		})
		return
	}

	// Get key ID from URL
	keyID := c.Param("id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "API key ID is required",
			"success": false,
		})
		return
	}

	// Delete the key
	err := h.authService.DeleteAPIKey(c, userID.(string), keyID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		
		// Check for specific errors
		if err.Error() == "API key not found or not owned by user" {
			statusCode = http.StatusNotFound
		}
		
		c.JSON(statusCode, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "API key revoked successfully",
	})
}