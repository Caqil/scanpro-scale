package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// Recovery middleware recovers from panics
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error and stack trace
				stackTrace := debug.Stack()
				fmt.Printf("Panic recovered: %v\nStack trace: %s\n", err, stackTrace)

				// Return a generic error message
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal server error",
					"success": false,
				})
			}
		}()

		c.Next()
	}
}
