// internal/middleware/api_key_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// ApiKeyMiddleware validates API key and checks permissions
func ApiKeyMiddleware(keyService *services.KeyValidationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get operation from path
		path := c.Request.URL.Path
		pathParts := strings.Split(path, "/")
		operation := ""
		
		// Extract operation from path
		if len(pathParts) > 2 && pathParts[1] == "api" {
			operation = pathParts[2]
		}

		// Check if this is a web UI request (browser)
		userAgent := c.GetHeader("User-Agent")
		accept := c.GetHeader("Accept")

		isWebUI := false
		if strings.Contains(accept, "text/html") && (
			strings.Contains(userAgent, "Mozilla/") ||
			strings.Contains(userAgent, "Chrome/") ||
			strings.Contains(userAgent, "Safari/") ||
			strings.Contains(userAgent, "Firefox/") ||
			strings.Contains(userAgent, "Edge/")) {
			// This is likely a browser request from the web UI
			isWebUI = true
		}

		// Skip API key validation for web UI requests
		if isWebUI {
			c.Set("operationType", operation)
			c.Next()
			return
		}

		// Get API key from header or query parameter
		apiKey := c.GetHeader("x-api-key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		// Validate API key
		result, err := keyService.ValidateKey(apiKey, operation)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error validating API key: " + err.Error(),
			})
			c.Abort()
			return
		}

		if !result.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": result.Error,
			})
			c.Abort()
			return
		}

		// Store user ID and operation type in context
		c.Set("userId", result.UserID)
		c.Set("operationType", operation)
		c.Set("permissions", result.Permissions)
		c.Set("freeOperationsRemaining", result.FreeOperationsRemaining)
		c.Set("balance", result.Balance)

		c.Next()
	}
}
