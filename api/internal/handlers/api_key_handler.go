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

// ListKeys godoc
// @Summary List user's API keys
// @Description Returns all API keys for the authenticated user
// @Tags keys
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{keys=array}
// @Failure 401 {object} object{error=string} "Unauthorized"
// @Failure 500 {object} object{error=string} "Server error"
// @Router /api/keys [get]
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
			"id":          key.ID,
			"name":        key.Name,
			"key":         maskApiKey(key.Key),
			"permissions": key.Permissions,
			"lastUsed":    key.LastUsed,
			"expiresAt":   key.ExpiresAt,
			"createdAt":   key.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"keys": maskedKeys,
	})
}

// CreateKey godoc
// @Summary Create a new API key
// @Description Creates a new API key for the authenticated user
// @Tags keys
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body object{name=string,permissions=array} true "API key details"
// @Success 200 {object} object{success=boolean,key=object{id=string,name=string,key=string,permissions=array,createdAt=string}}
// @Failure 400 {object} object{error=string} "Invalid request body"
// @Failure 401 {object} object{error=string} "Unauthorized"
// @Failure 403 {object} object{error=string} "API key limit reached"
// @Failure 500 {object} object{error=string} "Server error"
// @Router /api/keys [post]
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
		Name        string   `json:"name" binding:"required"`
		Permissions []string `json:"permissions"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Create the API key
	apiKey, err := h.service.CreateKey(userID.(string), requestBody.Name, requestBody.Permissions)
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
			"id":          apiKey.ID,
			"name":        apiKey.Name,
			"key":         apiKey.Key, // Return full key only on creation
			"permissions": apiKey.Permissions,
			"createdAt":   apiKey.CreatedAt,
		},
	})
}

// RevokeKey godoc
// @Summary Revoke an API key
// @Description Revokes (deletes) an API key
// @Tags keys
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "API key ID"
// @Success 200 {object} object{success=boolean,message=string}
// @Failure 401 {object} object{error=string} "Unauthorized"
// @Failure 404 {object} object{error=string} "API key not found or does not belong to user"
// @Failure 500 {object} object{error=string} "Server error"
// @Router /api/keys/{id} [delete]
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
