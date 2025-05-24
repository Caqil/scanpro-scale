// internal/middleware/auth_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware authenticates users via JWT token
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// IMPORTANT: Skip authentication for password reset endpoints
		if strings.Contains(c.Request.URL.Path, "/api/auth/validate") ||
			strings.Contains(c.Request.URL.Path, "/api/auth/reset-password") {
			// Skip authentication for these endpoints
			c.Next()
			return
		}

		var token string

		// First, try to get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// If no token in header, try cookie
		if token == "" {
			cookieToken, err := c.Cookie("authToken")
			if err == nil && cookieToken != "" {
				token = cookieToken
			}
		}

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
			})
			c.Abort()
			return
		}

		// Validate token
		authService := services.NewAuthService(db.DB, jwtSecret)
		userID, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			c.Abort()
			return
		}

		// Store user ID in context
		c.Set("userId", userID)
		c.Next()
	}
}
