// internal/handlers/user/balance.go
package user

import (
	"fmt"
	"net/http"

	"megapdf-api/internal/services/billing"

	"github.com/gin-gonic/gin"
)

// BalanceHandler manages user balance operations
type BalanceHandler struct {
	billingService *billing.Service
}

// NewBalanceHandler creates a new balance handler
func NewBalanceHandler(billingService *billing.Service) *BalanceHandler {
	return &BalanceHandler{
		billingService: billingService,
	}
}

// GetBalance gets the user's balance information
func (h *BalanceHandler) GetBalance(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get user with balance info
	user, err := h.billingService.GetUserBalance(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch balance information",
			"success": false,
		})
		return
	}

	// Get recent transactions (last 10)
	transactions, _, err := h.billingService.GetUserTransactions(c, userID.(string), 10, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch transaction history",
			"success": false,
		})
		return
	}

	// Get operation statistics for current month
	operations, err := h.billingService.GetUserOperationStats(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch operation statistics",
			"success": false,
		})
		return
	}

	// Calculate free operations info
	freeOpsUsed := user.FreeOperationsUsed
	freeOpsRemaining := billing.FREE_OPERATIONS_MONTHLY - freeOpsUsed
	if freeOpsRemaining < 0 {
		freeOpsRemaining = 0
	}

	// Format response
	response := gin.H{
		"success":                 true,
		"balance":                 user.Balance,
		"freeOperationsUsed":      freeOpsUsed,
		"freeOperationsRemaining": freeOpsRemaining,
		"freeOperationsTotal":     billing.FREE_OPERATIONS_MONTHLY,
		"nextResetDate":           user.FreeOperationsReset,
		"transactions":            transactions,
		"totalOperations":         operations.TotalOperations,
		"operationCounts":         operations.OperationCounts,
	}

	c.JSON(http.StatusOK, response)
}

// GetTransactions gets the user's transaction history with pagination
func (h *BalanceHandler) GetTransactions(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get pagination parameters
	page := 1
	pageSize := 25
	if pageStr := c.Query("page"); pageStr != "" {
		if pageInt, err := parseInt(pageStr); err == nil && pageInt > 0 {
			page = pageInt
		}
	}
	if pageSizeStr := c.Query("limit"); pageSizeStr != "" {
		if pageSizeInt, err := parseInt(pageSizeStr); err == nil && pageSizeInt > 0 {
			pageSize = pageSizeInt
		}
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get transactions
	transactions, total, err := h.billingService.GetUserTransactions(c, userID.(string), pageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch transaction history",
			"success": false,
		})
		return
	}

	// Calculate total pages
	totalPages := (int(total) + pageSize - 1) / pageSize

	// Format response
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"transactions": transactions,
		"pagination": gin.H{
			"total":      total,
			"page":       page,
			"pageSize":   pageSize,
			"totalPages": totalPages,
		},
	})
}

// Helper function to parse int
func parseInt(s string) (int, error) {
	var i int
	_, err := fmt.Sscanf(s, "%d", &i)
	return i, err
}