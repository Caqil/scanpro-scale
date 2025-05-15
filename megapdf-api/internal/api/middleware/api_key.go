// internal/api/middleware/api_key.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/services/auth"
	"megapdf-api/internal/utils/response"
)

// ValidateAPIKey is a middleware for API key validation
func ValidateAPIKey(c *gin.Context) {
	// Skip validation for /api/validate-key endpoint itself
	if strings.Contains(c.Request.URL.Path, "/api/validate-key") {
		c.Next()
		return
	}

	// Get API key from header or query parameter
	apiKey := c.GetHeader("x-api-key")
	if apiKey == "" {
		apiKey = c.Query("api_key")
	}

	if apiKey == "" {
		response.Error(c, http.StatusUnauthorized, "API key is required")
		c.Abort()
		return
	}

	// Get operation type from route or header
	operation := getOperationFromRoute(c)
	if operationHeader := c.GetHeader("x-operation-type"); operationHeader != "" {
		operation = operationHeader
	}

	// Validate the API key
	apiKeyService := auth.NewAPIKeyService()
	validation, err := apiKeyService.ValidateKey(apiKey, operation)
	if err != nil {
		log.Debug().Err(err).Str("apiKey", apiKey).Str("operation", operation).Msg("API key validation failed")
		response.Error(c, http.StatusUnauthorized, validation.Error)
		c.Abort()
		return
	}

	if !validation.Valid {
		log.Debug().Str("apiKey", apiKey).Str("operation", operation).Msg("Invalid API key")
		response.Error(c, http.StatusUnauthorized, "Invalid API key")
		c.Abort()
		return
	}

	// Check if the user can perform this operation (has balance or free operations)
	canPerform, balance, freeOpsRemaining, err := apiKeyService.CanPerformOperation(validation.UserID, operation)
	if err != nil {
		log.Error().Err(err).Str("userID", validation.UserID).Str("operation", operation).Msg("Error checking operation eligibility")
		response.Error(c, http.StatusInternalServerError, "Failed to validate operation eligibility")
		c.Abort()
		return
	}

	if !canPerform {
		log.Info().Str("userID", validation.UserID).Str("operation", operation).Float64("balance", balance).Int("freeOpsRemaining", freeOpsRemaining).Msg("Insufficient resources for operation")

		// Return a specific error with details for the client
		c.JSON(http.StatusPaymentRequired, gin.H{
			"success": false,
			"error":   "Insufficient balance or free operations",
			"details": gin.H{
				"balance":                 balance,
				"freeOperationsRemaining": freeOpsRemaining,
				"operationCost":           auth.OPERATION_COST,
			},
		})
		c.Abort()
		return
	}

	// Set user info in context
	c.Set("userId", validation.UserID)
	c.Set("userRole", validation.Role)
	c.Set("apiKeyId", validation.KeyID)
	c.Set("apiPermissions", validation.Permissions)
	c.Set("authType", "apiKey")
	c.Next()
}

// getOperationFromRoute extracts operation type from route path
func getOperationFromRoute(c *gin.Context) string {
	path := c.Request.URL.Path
	pathParts := strings.Split(path, "/")

	if len(pathParts) >= 3 && pathParts[1] == "api" {
		switch pathParts[2] {
		case "pdf":
			if len(pathParts) >= 4 {
				return pathParts[3] // e.g., "convert", "compress", etc.
			}
		case "ocr":
			return "ocr"
		}
	}

	return "general"
}
