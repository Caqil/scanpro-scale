package middleware

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorHandler middleware catches panics and errors
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Recover from panics
		defer func() {
			if err := recover(); err != nil {
				// Log the error
				c.Error(fmt.Errorf("panic recovered: %v", err))

				// Return error response
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal server error",
					"success": false,
				})
			}
		}()

		c.Next()

		// Check if there were any errors
		if len(c.Errors) > 0 {
			// Get the last error
			err := c.Errors.Last()

			// Check if it's already been handled
			if c.Writer.Written() {
				return
			}

			// Determine status code based on error
			statusCode := http.StatusInternalServerError
			var customErr *CustomError
			if errors.As(err.Err, &customErr) {
				statusCode = customErr.StatusCode
			}

			// Return JSON response
			c.JSON(statusCode, gin.H{
				"error":   err.Error(),
				"success": false,
			})
		}
	}
}

// CustomError is a custom error type with status code
type CustomError struct {
	Msg        string
	StatusCode int
}

func (e *CustomError) Error() string {
	return e.Msg
}

// NewError creates a new CustomError
func NewError(msg string, statusCode int) *CustomError {
	return &CustomError{
		Msg:        msg,
		StatusCode: statusCode,
	}
}
