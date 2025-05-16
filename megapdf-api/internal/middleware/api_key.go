// middleware/api_key.go
package middleware

import (
	"net/http"
	"strings"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// APIKey middleware authenticates using an API key
func APIKey(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if already authenticated via JWT
		if _, exists := c.Get("userID"); exists {
			c.Next()
			return
		}

		// Get API key from header or query parameter
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			// No API key, continue to the next middleware or handler
			// The handler may require authentication using RequireAuth middleware
			c.Next()
			return
		}

		// Validate API key
		keyInfo, err := authService.ValidateAPIKey(c, apiKey)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid API key",
				"success": false,
			})
			return
		}

		// Get operation from request
		operation := getOperationFromRequest(c)

		// Check if key has permission for this operation
		if operation != "" && !keyInfo.HasPermission(operation) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "API key does not have permission for this operation",
				"success": false,
			})
			return
		}

		// Set user ID and other info in context
		c.Set("userID", keyInfo.UserID)
		c.Set("apiKeyID", keyInfo.ID)
		c.Set("isAPIKey", true)

		c.Next()
	}
}

// getOperationFromRequest extracts the operation name from the request
func getOperationFromRequest(c *gin.Context) string {
	// Try to get from headers first (set by main middleware)
	operation := c.GetHeader("X-Operation-Type")
	if operation != "" {
		return operation
	}

	// Try to get from URL path
	path := c.Request.URL.Path
	segments := strings.Split(path, "/")
	
	// If path is like /api/pdf/operation or /api/operation
	if len(segments) >= 3 {
		if segments[1] == "api" {
			if segments[2] == "pdf" && len(segments) >= 4 {
				return segments[3] // /api/pdf/operation
			} else {
				return segments[2] // /api/operation
			}
		}
	}

	// Try to get from query parameter
	operation = c.Query("operation")
	if operation != "" {
		return operation
	}

	return ""
}