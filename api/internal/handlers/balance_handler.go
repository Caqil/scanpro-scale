// internal/handlers/balance_handler.go
package handlers

import (
	"net/http"
	"os"

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
	if requestBody.Amount < 5.00 { // Minimum amount
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Amount must be at least $5.00",
		})
		return
	}

	// Create PayPal service
	paypalService := services.NewPayPalService(
		os.Getenv("PAYPAL_CLIENT_ID"),
		os.Getenv("PAYPAL_CLIENT_SECRET"),
		os.Getenv("PAYPAL_API_BASE"),
		os.Getenv("NEXT_PUBLIC_APP_URL"),
	)

	// Create PayPal order
	orderID, approvalURL, err := paypalService.CreateOrder(
		userID.(string),
		requestBody.Amount,
		"Balance Deposit",
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create PayPal order: " + err.Error(),
		})
		return
	}

	// Create deposit transaction in database
	_, err = h.service.CreateDeposit(userID.(string), requestBody.Amount, orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create deposit: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"orderId":     orderID,
		"checkoutUrl": approvalURL,
		"amount":      requestBody.Amount,
		"message":     "Deposit transaction created. Please complete the payment.",
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
// VerifyDeposit function
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
		PayerID string `json:"payerId"` // Optional, helpful for PayPal
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Create PayPal service
	paypalService := services.NewPayPalService(
		os.Getenv("PAYPAL_CLIENT_ID"),
		os.Getenv("PAYPAL_CLIENT_SECRET"),
		os.Getenv("PAYPAL_API_BASE"),
		os.Getenv("NEXT_PUBLIC_APP_URL"),
	)

	// Verify and capture the payment
	verified, amount, err := paypalService.VerifyOrder(requestBody.OrderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to verify payment: " + err.Error(),
		})
		return
	}

	if !verified {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Payment verification failed",
		})
		return
	}

	// Complete the deposit in the database
	if err := h.service.CompleteDeposit(requestBody.OrderID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to complete deposit: " + err.Error(),
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
		"amount":     amount,
		"newBalance": result["balance"],
	})
}
