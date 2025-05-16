// internal/middleware/auth_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware authenticates users via JWT token
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create auth service
		authService := services.NewAuthService(nil, jwtSecret)

		// Get token from header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is missing",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Use 'Bearer <token>'",
			})
			c.Abort()
			return
		}

		if tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Header must start with 'Bearer'",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token is missing",
			})
			c.Abort()
			return
		}

		// Validate token
		userID, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token: " + err.Error(),
			})
			c.Abort()
			return
		}

		// Store user ID in context
		c.Set("userId", userID)

		c.Next()
	}
}
