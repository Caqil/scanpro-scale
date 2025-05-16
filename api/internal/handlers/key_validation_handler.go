// internal/handlers/key_validation_handler.go
package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

type KeyValidationHandler struct {
	service *services.KeyValidationService
}

func NewKeyValidationHandler(service *services.KeyValidationService) *KeyValidationHandler {
	return &KeyValidationHandler{service: service}
}

// ValidateKey godoc
// @Summary Validate API key
// @Description Validates an API key and checks if it has permission to perform the specified operation
// @Tags keys
// @Accept json
// @Produce json
// @Param operation query string false "Operation to validate permission for"
// @Param api_key query string false "API key to validate"
// @Param x-api-key header string false "API key to validate"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/validate-key [get]
func (h *KeyValidationHandler) ValidateKey(c *gin.Context) {
	// Get API key from header or query parameter
	apiKey := c.GetHeader("x-api-key")
	if apiKey == "" {
		apiKey = c.Query("api_key")
	}

	// Get operation to validate
	operation := c.Query("operation")

	// Validate key
	result, err := h.service.ValidateKey(apiKey, operation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to validate API key: " + err.Error(),
		})
		return
	}

	// Return validation result
	c.JSON(http.StatusOK, gin.H{
		"valid":                   result.Valid,
		"userId":                  result.UserID,
		"permissions":             result.Permissions,
		"freeOperationsRemaining": result.FreeOperationsRemaining,
		"balance":                 result.Balance,
		"error":                   result.Error,
	})
}
