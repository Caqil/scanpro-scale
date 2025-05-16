// middleware/operation.go
package middleware

import (
	"net/http"

	"megapdf-api/internal/services/billing"

	"github.com/gin-gonic/gin"
)

// CheckOperationEligibility middleware checks if a user can perform an operation
func CheckOperationEligibility(billingService *billing.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by Auth or APIKey middleware)
		userID, exists := c.Get("userID")
		if !exists {
			// No user ID, check if authentication is required
			if value, exists := c.Get("requireAuth"); exists && value.(bool) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error":   "Authentication required",
					"success": false,
				})
				return
			}

			// Not authenticated but authentication is not required
			// (for example, for public operations)
			c.Next()
			return
		}

		// Get operation from the request
		operation := getOperationFromRequest(c)
		if operation == "" {
			// No operation identified, skip check
			c.Next()
			return
		}

		// Check if the user can perform this operation
		canPerform, err := billingService.CanPerformOperation(c, userID.(string), operation)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to check operation eligibility",
				"success": false,
			})
			return
		}

		if !canPerform.CanPerform {
			c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{
				"error": canPerform.Error,
				"details": gin.H{
					"balance":                 canPerform.CurrentBalance,
					"freeOperationsRemaining": canPerform.FreeOperationsRemaining,
					"operationCost":           billing.OPERATION_COST,
				},
				"success": false,
			})
			return
		}

		// Store operation eligibility in context
		c.Set("operationEligibility", canPerform)
		c.Set("operation", operation)

		c.Next()
	}
}

// TrackOperation middleware tracks an operation after it has been performed
func TrackOperation(billingService *billing.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Process the request first
		c.Next()

		// If request was not successful (status >= 400), don't track
		if c.Writer.Status() >= 400 {
			return
		}

		// Get user ID and operation from context
		userID, exists := c.Get("userID")
		if !exists {
			return
		}

		operation := getOperationFromContext(c)
		if operation == "" {
			return
		}

		// Track operation (non-blocking)
		go func(userID string, operation string) {
			_, _ = billingService.ProcessOperation(c, userID, operation)
		}(userID.(string), operation)
	}
}

// getOperationFromContext gets the operation from gin context
func getOperationFromContext(c *gin.Context) string {
	// Try to get from context first
	if op, exists := c.Get("operation"); exists {
		return op.(string)
	}

	// Fall back to getting from request
	return getOperationFromRequest(c)
}
