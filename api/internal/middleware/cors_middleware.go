// internal/middleware/cors_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles CORS for all API requests
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get origin from request
		origin := c.Request.Header.Get("Origin")

		// Allowed origins
		allowedOrigins := []string{
			"https://mega-pdf.com",
			"https://www.mega-pdf.com",
			"http://localhost:3000", // For development
		}

		// Check if origin is allowed
		allowed := false
		if origin != "" {
			for _, allowedOrigin := range allowedOrigins {
				if strings.HasPrefix(origin, allowedOrigin) {
					allowed = true
					break
				}
			}
		}

		// Set CORS headers based on origin
		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else if origin == "" {
			// If no origin specified, allow all for API clients
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// For unknown origins, default to main site
			c.Writer.Header().Set("Access-Control-Allow-Origin", "https://mega-pdf.com")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, x-api-key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
