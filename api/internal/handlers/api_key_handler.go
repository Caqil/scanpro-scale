// internal/handlers/api_key_handler.go
package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

type ApiKeyHandler struct {
	service *services.ApiKeyService
}

func NewApiKeyHandler(service *services.ApiKeyService) *ApiKeyHandler {
	return &ApiKeyHandler{service: service}
}

func (h *ApiKeyHandler) ListKeys(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get user's API keys
	keys, err := h.service.GetUserKeys(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch API keys: " + err.Error(),
		})
		return
	}

	// Mask API key values for security
	maskedKeys := []gin.H{}
	for _, key := range keys {
		maskedKeys = append(maskedKeys, gin.H{
			"id":        key.ID,
			"name":      key.Name,
			"key":       maskApiKey(key.Key),
			"lastUsed":  key.LastUsed,
			"expiresAt": key.ExpiresAt,
			"createdAt": key.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"keys": maskedKeys,
	})
}

func (h *ApiKeyHandler) CreateKey(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request body
	var requestBody struct {
		Name string `json:"name" binding:"required"`
		// Permissions removed
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Create the API key - pass an empty slice for permissions
	apiKey, err := h.service.CreateKey(userID.(string), requestBody.Name, []string{})
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "API key limit reached" {
			statusCode = http.StatusForbidden
		}

		c.JSON(statusCode, gin.H{
			"error": "Failed to create API key: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"key": gin.H{
			"id":        apiKey.ID,
			"name":      apiKey.Name,
			"key":       apiKey.Key, // Return full key only on creation
			"createdAt": apiKey.CreatedAt,
		},
	})
}

func (h *ApiKeyHandler) RevokeKey(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get key ID from path
	keyID := c.Param("id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "API key ID is required",
		})
		return
	}

	// Revoke the key
	if err := h.service.RevokeKey(keyID, userID.(string)); err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "API key not found or does not belong to user" {
			statusCode = http.StatusNotFound
		}

		c.JSON(statusCode, gin.H{
			"error": "Failed to revoke API key: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "API key revoked successfully",
	})
}

// Helper function to mask API key for display
func maskApiKey(key string) string {
	if len(key) <= 12 {
		return key
	}

	prefix := key[:8]
	suffix := key[len(key)-4:]

	return prefix + "..." + suffix
}
