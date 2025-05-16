package middleware

import (
	"net/http"
	"strings"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// Auth middleware checks if a request is authenticated
func Auth(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Authorization header is required",
				"success": false,
			})
			return
		}

		// Check if it's a Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid Authorization header format",
				"success": false,
			})
			return
		}

		// Validate token
		claims, err := authService.ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid or expired token",
				"success": false,
			})
			return
		}

		// Set user ID and role in context
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

// APIKey middleware authenticates using an API key
func APIKey(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if already authenticated
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
			c.Next() // Allow endpoint to decide if authentication is required
			return
		}

		// Validate API key
		keyInfo, err := authService.ValidateAPIKey(c, apiKey)
		if err != nil {
			if c.Request.URL.Path == "/api/validate-key" {
				// Don't abort on the validation endpoint
				c.Set("apiKeyError", err.Error())
				c.Next()
				return
			}

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid API key",
				"success": false,
			})
			return
		}

		// Get operation from path or query
		operation := ""
		pathParts := strings.Split(c.Request.URL.Path, "/")
		if len(pathParts) > 2 {
			operation = pathParts[len(pathParts)-1]
		}
		if c.Query("operation") != "" {
			operation = c.Query("operation")
		}

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

// Admin middleware checks if the user is an admin
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"success": false,
			})
			return
		}

		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "Admin access required",
				"success": false,
			})
			return
		}

		c.Next()
	}
}

// RequireAuth middleware ensures that a user is authenticated
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"success": false,
			})
			return
		}

		c.Next()
	}
}
