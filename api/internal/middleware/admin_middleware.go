// internal/middleware/admin_middleware.go
package middleware

import (
	"net/http"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/gin-gonic/gin"
)

// AdminMiddleware checks if the user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context
		userID, exists := c.Get("userId")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User ID not found in context",
			})
			c.Abort()
			return
		}

		// Get user from database
		var user models.User
		if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})
			c.Abort()
			return
		}

		// Check if user has admin role
		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
