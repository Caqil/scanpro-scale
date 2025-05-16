// internal/handlers/keys/validate.go
package keys

import (
	"net/http"
	"time"

	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// ValidateHandler handles validation of API keys
type ValidateHandler struct {
	authService *auth.Service
}

// NewValidateHandler creates a new validate handler
func NewValidateHandler(authService *auth.Service) *ValidateHandler {
	return &ValidateHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *ValidateHandler) Register(router *gin.RouterGroup) {
	router.POST("/validate", h.ValidateKey)
	router.GET("/validate", h.ValidateKeyGet)
}

// ValidateKey validates an API key from a POST request
func (h *ValidateHandler) ValidateKey(c *gin.Context) {
	// Parse request body
	var request struct {
		APIKey    string `json:"apiKey"`
		Operation string `json:"operation"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"valid": false,
			"error": "Invalid request format",
		})
		return
	}

	if request.APIKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"valid": false,
			"error": "API key is required",
		})
		return
	}

	// Validate the API key
	keyInfo, err := h.authService.ValidateAPIKey(c, request.APIKey)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"error": "Invalid API key",
		})
		return
	}

	// Check operation permission if specified
	if request.Operation != "" && !keyInfo.HasPermission(request.Operation) {
		c.JSON(http.StatusOK, gin.H{
			"valid":         true,
			"hasPermission": false,
			"error":         "This API key does not have permission to perform the requested operation",
		})
		return
	}

	// Get free operations and balance information
	user, err := h.authService.GetUserDetails(c, keyInfo.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"valid": true,
			"error": "Failed to get user details",
		})
		return
	}

	// Calculate free operations remaining
	freeOpsRemaining := 500 // FREE_OPERATIONS_MONTHLY
	if user.FreeOperationsUsed > 0 {
		freeOpsRemaining = max(0, freeOpsRemaining-user.FreeOperationsUsed)
	}

	// Check if reset date has passed
	now := time.Now()
	if user.FreeOperationsReset != nil && user.FreeOperationsReset.Before(now) {
		freeOpsRemaining = 500 // Reset to full
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":                   true,
		"userId":                  keyInfo.UserID,
		"permissions":             keyInfo.Permissions,
		"freeOperationsRemaining": freeOpsRemaining,
		"currentBalance":          user.Balance,
		"hasPermission":           request.Operation == "" || keyInfo.HasPermission(request.Operation),
	})
}

// ValidateKeyGet validates an API key from a GET request
func (h *ValidateHandler) ValidateKeyGet(c *gin.Context) {
	// Get API key from query parameter or header
	apiKey := c.Query("api_key")
	if apiKey == "" {
		apiKey = c.GetHeader("X-API-Key")
	}

	if apiKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"valid": false,
			"error": "API key is required",
		})
		return
	}

	// Get operation from query parameter
	operation := c.Query("operation")

	// Validate the API key
	keyInfo, err := h.authService.ValidateAPIKey(c, apiKey)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"error": "Invalid API key",
		})
		return
	}

	// Check operation permission if specified
	if operation != "" && !keyInfo.HasPermission(operation) {
		c.JSON(http.StatusOK, gin.H{
			"valid":         true,
			"hasPermission": false,
			"error":         "This API key does not have permission to perform the requested operation",
		})
		return
	}

	// Get free operations and balance information
	user, err := h.authService.GetUserDetails(c, keyInfo.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"valid": true,
			"error": "Failed to get user details",
		})
		return
	}

	// Calculate free operations remaining
	freeOpsRemaining := 500 // FREE_OPERATIONS_MONTHLY
	if user.FreeOperationsUsed > 0 {
		freeOpsRemaining = max(0, freeOpsRemaining-user.FreeOperationsUsed)
	}

	// Check if reset date has passed
	now := time.Now()
	if user.FreeOperationsReset != nil && user.FreeOperationsReset.Before(now) {
		freeOpsRemaining = 500 // Reset to full
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":                   true,
		"userId":                  keyInfo.UserID,
		"permissions":             keyInfo.Permissions,
		"freeOperationsRemaining": freeOpsRemaining,
		"currentBalance":          user.Balance,
		"hasPermission":           operation == "" || keyInfo.HasPermission(operation),
	})
}

// Helper function
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
