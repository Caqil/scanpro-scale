// internal/handlers/user/deposit.go
package user

import (
	"net/http"

	"megapdf-api/internal/models"
	"megapdf-api/internal/services/billing"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
)

// DepositHandler manages user deposit operations
type DepositHandler struct {
	billingService *billing.Service
	paypalService  *payment.PayPalService
}

// NewDepositHandler creates a new deposit handler
func NewDepositHandler(billingService *billing.Service, paypalService *payment.PayPalService) *DepositHandler {
	return &DepositHandler{
		billingService: billingService,
		paypalService:  paypalService,
	}
}

// CreateDeposit creates a new deposit and returns PayPal checkout URL
func (h *DepositHandler) CreateDeposit(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Parse request body
	var req models.DepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Validate amount
	if req.Amount < 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Minimum deposit amount is $5.00",
			"success": false,
		})
		return
	}

	// Get user info for PayPal description
	user, err := h.billingService.GetUserBalance(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user information",
			"success": false,
		})
		return
	}

	// Create description
	description := "Balance Deposit"
	if user.Name != "" {
		description = "Balance Deposit for " + user.Name
	} else if user.Email != "" {
		description = "Balance Deposit for " + user.Email
	}

	// Create PayPal order
	paypalOrder, err := h.paypalService.CreateOrder(c, req.Amount, description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create payment order",
			"success": false,
		})
		return
	}

	// Create pending transaction
	transaction, err := h.billingService.CreatePendingDeposit(c, userID.(string), req.Amount, paypalOrder.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to record transaction",
			"success": false,
		})
		return
	}

	// Return checkout URL
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Please complete the payment on PayPal",
		"orderId":     paypalOrder.ID,
		"checkoutUrl": paypalOrder.ApprovalURL,
		"transaction": transaction.ID,
	})
}

// VerifyDeposit verifies a PayPal payment and completes the deposit
func (h *DepositHandler) VerifyDeposit(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Parse request body
	var req struct {
		OrderID string `json:"orderId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Verify PayPal order
	verified, amount, err := h.paypalService.GetOrderDetails(c, req.OrderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to verify payment",
			"success": false,
		})
		return
	}

	if !verified {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Payment not verified by PayPal",
		})
		return
	}

	// Complete the deposit
	err = h.billingService.CompletePendingDeposit(c, req.OrderID, amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process deposit: " + err.Error(),
			"success": false,
		})
		return
	}

	// Get updated user balance
	user, err := h.billingService.GetUserBalance(c, userID.(string))
	if err != nil {
		// Don't fail the request if we can't get the updated balance
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Deposit completed successfully",
			"amount":  amount,
		})
		return
	}

	// Return success with updated balance
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Deposit completed successfully",
		"amount":      amount,
		"newBalance":  user.Balance,
	})
}

// CaptureDeposit captures a PayPal payment that has been approved
func (h *DepositHandler) CaptureDeposit(c *gin.Context) {
	// Parse request body
	var req struct {
		OrderID string `json:"orderId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Capture PayPal order
	captured, amount, err := h.paypalService.CaptureOrder(c, req.OrderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to capture payment: " + err.Error(),
			"success": false,
		})
		return
	}

	if !captured {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Payment capture failed",
		})
		return
	}

	// Complete the deposit
	err = h.billingService.CompletePendingDeposit(c, req.OrderID, amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process deposit: " + err.Error(),
			"success": false,
		})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment captured successfully",
		"amount":  amount,
	})
}