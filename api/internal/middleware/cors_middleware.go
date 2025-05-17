// internal/middleware/cors_middleware.go
package middleware

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles CORS for all API requests
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log request details for debugging
		fmt.Printf("Received %s request to %s with origin: %s\n",
			c.Request.Method,
			c.Request.URL.Path,
			c.Request.Header.Get("Origin"))

		// Set CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, x-api-key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			fmt.Println("Responding to OPTIONS request with 204 No Content")
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		fmt.Println("Continuing with request")
		c.Next()
	}
}
