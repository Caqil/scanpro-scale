// api/internal/middleware/cors.go
package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Define allowed origins
		allowedOrigins := []string{
			"https://mega-pdf.com",
			"https://www.mega-pdf.com",
			"https://admin.mega-pdf.com", // ADD YOUR ACTUAL ADMIN DOMAIN HERE
			"http://localhost:3000",      // for development
			"http://localhost:3001",      // for admin development
		}

		// Add environment-specific origins
		if appURL := os.Getenv("NEXT_PUBLIC_APP_URL"); appURL != "" {
			allowedOrigins = append(allowedOrigins, appURL)
		}

		if adminURL := os.Getenv("ADMIN_URL"); adminURL != "" {
			allowedOrigins = append(allowedOrigins, adminURL)
		}

		// Check if origin is allowed
		isAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				isAllowed = true
				break
			}
		}

		// In development, allow all localhost origins
		if os.Getenv("GO_ENV") == "development" || os.Getenv("DEBUG") == "true" {
			if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
				isAllowed = true
			}
		}

		if isAllowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		// Set other CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Max-Age", "86400") // 24 hours
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})
}
