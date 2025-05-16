// internal/handlers/balance_handler.go
package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

type BalanceHandler struct {
	service *services.BalanceService
}

func NewBalanceHandler(service *services.BalanceService) *BalanceHandler {
	return &BalanceHandler{service: service}
}

// GetBalance godoc
// @Summary Get user balance information
// @Description Returns user's balance, free operations, and transaction history
// @Tags balance
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} object{success=boolean,balance=number,freeOperationsUsed=integer,freeOperationsRemaining=integer,freeOperationsTotal=integer,nextResetDate=string,transactions=array,totalOperations=integer,operationCounts=object}
// @Failure 401 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/user/balance [get]
func (h *BalanceHandler) GetBalance(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get balance information
	result, err := h.service.GetBalance(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get balance information: " + err.Error(),
		})
		return
	}

	// Return balance information
	c.JSON(http.StatusOK, result)
}

// CreateDeposit godoc
// @Summary Create a balance deposit
// @Description Initiates a payment process to add funds to user's balance
// @Tags balance
// @Accept json
// @Produce json
// @Param body body object{amount=number} true "Deposit amount (minimum $5.00)"
// @Security BearerAuth
// @Success 200 {object} object{success=boolean,checkoutUrl=string,orderId=string,message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/user/deposit [post]
func (h *BalanceHandler) CreateDeposit(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request body
	var requestBody struct {
		Amount float64 `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Validate amount
	if requestBody.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Amount must be greater than zero",
		})
		return
	}

	// Create deposit
	// In a real implementation, you would integrate with PayPal here
	transaction, err := h.service.CreateDeposit(userID.(string), requestBody.Amount, "temp_payment_id")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create deposit: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"transactionId": transaction.ID,
		"amount":        transaction.Amount,
		"message":       "Deposit transaction created. Please complete the payment process.",
	})
}

// VerifyDeposit godoc
// @Summary Verify a deposit transaction
// @Description Completes the deposit process after payment confirmation
// @Tags balance
// @Accept json
// @Produce json
// @Param body body object{orderId=string} true "PayPal order ID to verify"
// @Security BearerAuth
// @Success 200 {object} object{success=boolean,message=string,amount=number,newBalance=number}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/user/deposit/verify [post]
func (h *BalanceHandler) VerifyDeposit(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request body
	var requestBody struct {
		OrderID string `json:"orderId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// For demo purposes, we'll just mark the deposit as completed
	// In a real implementation, you would verify the payment with PayPal
	if err := h.service.CompleteDeposit(requestBody.OrderID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to verify deposit: " + err.Error(),
		})
		return
	}

	// Get updated balance
	result, err := h.service.GetBalance(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get updated balance: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Deposit completed successfully",
		"newBalance": result["balance"],
	})
}
