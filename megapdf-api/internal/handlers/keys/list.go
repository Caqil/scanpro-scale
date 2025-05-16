// internal/handlers/keys/list.go
package keys

import (
	"net/http"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// ListHandler handles retrieval of API keys
type ListHandler struct {
	authService *auth.Service
}

// NewListHandler creates a new list handler
func NewListHandler(authService *auth.Service) *ListHandler {
	return &ListHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *ListHandler) Register(router *gin.RouterGroup) {
	// Protected route - requires authentication
	router.Use(middleware.Auth())
	router.GET("", h.ListKeys)
}

// ListKeys returns all API keys for the authenticated user
func (h *ListHandler) ListKeys(c *gin.Context) {
	// Get user ID from context (set by Auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"success": false,
		})
		return
	}

	// Get all API keys for this user
	keys, err := h.authService.GetAPIKeys(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch API keys",
			"success": false,
		})
		return
	}

	// Format keys for response (mask the actual key value)
	maskedKeys := make([]gin.H, len(keys))
	for i, key := range keys {
		// Mask API key for security (only show first 8 and last 4 characters)
		maskedKey := key.Key
		if len(key.Key) > 12 {
			maskedKey = key.Key[:8] + "..." + key.Key[len(key.Key)-4:]
		}

		maskedKeys[i] = gin.H{
			"id":          key.ID,
			"name":        key.Name,
			"key":         maskedKey,
			"permissions": key.Permissions,
			"lastUsed":    key.LastUsed,
			"expiresAt":   key.ExpiresAt,
			"createdAt":   key.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"keys": maskedKeys,
	})
}