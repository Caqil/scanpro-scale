package middleware

import (
	"net/http"
	"strings"

	"megapdf-api/internal/services/billing"

	"github.com/gin-gonic/gin"
)

// CheckOperationEligibility middleware checks if a user can perform an operation
func CheckOperationEligibility(billingService *billing.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by Auth or APIKey middleware)
		userID, exists := c.Get("userID")
		if !exists {
			// No user ID, allow anonymous access if the endpoint supports it
			c.Next()
			return
		}

		// Get operation from route parameter or query
		operation := c.Param("operation")
		if operation == "" {
			operation = c.Query("operation")
		}
		if operation == "" {
			// Try to infer from the path (last part of the URL)
			parts := strings.Split(c.Request.URL.Path, "/")
			if len(parts) > 0 {
				operation = parts[len(parts)-1]
			}
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
					"operationCost":           billing.OperationCost,
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
