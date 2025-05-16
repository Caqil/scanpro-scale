// middleware/auth.go
package middleware

import (
	"net/http"
	"strings"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// Auth middleware checks if a request is authenticated via JWT
func Auth(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No Authorization header, try to check if there's an API key
			// We don't abort here to allow API key auth to be tried
			c.Next()
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

// RequireVerifiedEmail middleware ensures that a user's email is verified
func RequireVerifiedEmail() gin.HandlerFunc {
	return func(c *gin.Context) {
		// First check if user is authenticated
		userID, exists := c.Get("userID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"success": false,
			})
			return
		}

		// Check if email is verified
		verified, exists := c.Get("emailVerified")
		if !exists || verified != true {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "Email verification required",
				"success": false,
			})
			return
		}

		c.Next()
	}
}