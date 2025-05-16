// middleware/admin.go
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Admin middleware checks if the user is an admin
func Admin() gin.HandlerFunc {
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

		// Get user role
		role, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Role information missing",
				"success": false,
			})
			return
		}

		// Check if user is admin
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

// withAdminAuth is a convenience wrapper that can be used around admin-only
// handler functions for protecting admin routes
func withAdminAuth(handler func() (interface{}, error)) gin.HandlerFunc {
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

		// Get user role
		role, exists := c.Get("userRole")
		if !exists || role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "Admin access required",
				"success": false,
			})
			return
		}

		// Call the handler function
		result, err := handler()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   err.Error(),
				"success": false,
			})
			return
		}

		// Return the result
		c.JSON(http.StatusOK, result)
	}
}