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
// @Description Validates an API key and checks permissions for operations
// @Tags keys
// @Accept json
// @Produce json
// @Param operation query string false "Operation to validate permission for (e.g., compress, merge, protect)"
// @Param api_key query string false "API key to validate (if not provided in header)"
// @Param x-api-key header string false "API key to validate (if not provided in query)"
// @Success 200 {object} object{valid=boolean,userId=string,freeOperationsRemaining=integer,balance=number,error=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
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
		"freeOperationsRemaining": result.FreeOperationsRemaining,
		"balance":                 result.Balance,
		"error":                   result.Error,
	})
}
