// internal/handlers/user/api_keys.go
package user

import (
	"net/http"

	"megapdf-api/internal/models"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// APIKeyHandler manages API key operations
type APIKeyHandler struct {
	authService *auth.Service
}

// NewAPIKeyHandler creates a new API key handler
func NewAPIKeyHandler(authService *auth.Service) *APIKeyHandler {
	return &APIKeyHandler{
		authService: authService,
	}
}

// ListAPIKeys lists all API keys for the user
func (h *APIKeyHandler) ListAPIKeys(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get API keys
	keys, err := h.authService.GetAPIKeys(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch API keys",
			"success": false,
		})
		return
	}

	// Mask API key values for security
	var maskedKeys []models.APIKeyResponse
	for _, key := range keys {
		maskedKey := key.Key
		if len(maskedKey) > 12 {
			maskedKey = maskedKey[:8] + "..." + maskedKey[len(maskedKey)-4:]
		}

		maskedKeys = append(maskedKeys, models.APIKeyResponse{
			ID:          key.ID,
			Name:        key.Name,
			Key:         maskedKey,
			Permissions: key.Permissions,
			LastUsed:    key.LastUsed,
			ExpiresAt:   key.ExpiresAt,
			CreatedAt:   key.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"keys":    maskedKeys,
	})
}

// CreateAPIKey creates a new API key for the user
func (h *APIKeyHandler) CreateAPIKey(c *gin.Context) {
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
	var req models.CreateAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Create API key
	apiKey, err := h.authService.CreateAPIKey(c, userID.(string), req.Name, req.Permissions)
	if err != nil {
		// Handle specific error cases
		if err.Error() == "API key limit reached" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "You have reached the maximum number of API keys allowed for your account tier",
				"success": false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create API key",
			"success": false,
		})
		return
	}

	// Return the API key (only returned once)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"key": models.APIKeyResponse{
			ID:          apiKey.ID,
			Name:        apiKey.Name,
			Key:         apiKey.Key, // This is the only time the full key is returned
			Permissions: apiKey.Permissions,
			LastUsed:    apiKey.LastUsed,
			ExpiresAt:   apiKey.ExpiresAt,
			CreatedAt:   apiKey.CreatedAt,
		},
	})
}

// DeleteAPIKey deletes an API key
func (h *APIKeyHandler) DeleteAPIKey(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get key ID from URL path
	keyID := c.Param("id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "API key ID is required",
			"success": false,
		})
		return
	}

	// Delete API key
	err := h.authService.DeleteAPIKey(c, userID.(string), keyID)
	if err != nil {
		// Handle not found case
		if err.Error() == "API key not found or not owned by user" {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "API key not found",
				"success": false,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete API key",
			"success": false,
		})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "API key revoked successfully",
	})
}