// internal/handlers/admin/transactions.go
package admin

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"megapdf-api/internal/repositories"

	"github.com/gin-gonic/gin"
)

// TransactionsHandler handles admin transaction operations
type TransactionsHandler struct {
	transactionRepo repositories.TransactionRepository
	userRepo        repositories.UserRepository
}

// NewTransactionsHandler creates a new transactions handler
func NewTransactionsHandler(transactionRepo repositories.TransactionRepository, userRepo repositories.UserRepository) *TransactionsHandler {
	return &TransactionsHandler{
		transactionRepo: transactionRepo,
		userRepo:        userRepo,
	}
}

// Register registers the routes for this handler
func (h *TransactionsHandler) Register(router *gin.RouterGroup) {
	transactionGroup := router.Group("/transactions")
	transactionGroup.GET("", h.GetTransactions)
	transactionGroup.GET("/export", h.ExportTransactions)
	transactionGroup.GET("/stats", h.GetTransactionStats)
}

// GetTransactions returns a list of transactions with pagination
func (h *TransactionsHandler) GetTransactions(c *gin.Context) {
	// Parse query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "25")
	search := c.DefaultQuery("search", "")
	transactionType := c.DefaultQuery("type", "all")
	status := c.DefaultQuery("status", "all")
	dateRange := c.DefaultQuery("dateRange", "30d")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	// Calculate date filter
	var dateFilter time.Time
	now := time.Now()

	switch dateRange {
	case "7d":
		dateFilter = now.AddDate(0, 0, -7)
	case "30d":
		dateFilter = now.AddDate(0, 0, -30)
	case "90d":
		dateFilter = now.AddDate(0, 0, -90)
	case "all":
		dateFilter = time.Unix(0, 0)
	default:
		dateFilter = now.AddDate(0, 0, -30) // Default to 30 days
	}

	// Get transactions with pagination
	transactions, total, err := h.transactionRepo.GetPaginated(page, limit, search, transactionType, status, dateFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch transactions",
		})
		return
	}

	// Format transactions for response
	formattedTransactions := make([]gin.H, len(transactions))
	for i, tx := range transactions {
		user, _ := h.userRepo.GetByID(tx.UserID)
		userName := "Unknown"
		userEmail := "Unknown"

		if user != nil {
			userName = user.Name
			userEmail = user.Email
		}

		formattedTransactions[i] = gin.H{
			"id":           tx.ID,
			"userId":       tx.UserID,
			"userName":     userName,
			"userEmail":    userEmail,
			"amount":       tx.Amount,
			"balanceAfter": tx.BalanceAfter,
			"description":  tx.Description,
			"status":       tx.Status,
			"createdAt":    tx.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": formattedTransactions,
		"total":        total,
		"page":         page,
		"limit":        limit,
		"totalPages":   (total + limit - 1) / limit,
	})
}

// ExportTransactions exports transactions as CSV
func (h *TransactionsHandler) ExportTransactions(c *gin.Context) {
	// Parse parameters
	search := c.DefaultQuery("search", "")
	transactionType := c.DefaultQuery("type", "all")
	status := c.DefaultQuery("status", "all")
	dateRange := c.DefaultQuery("dateRange", "30d")

	// Calculate date filter
	var dateFilter time.Time
	now := time.Now()

	switch dateRange {
	case "7d":
		dateFilter = now.AddDate(0, 0, -7)
	case "30d":
		dateFilter = now.AddDate(0, 0, -30)
	case "90d":
		dateFilter = now.AddDate(0, 0, -90)
	case "all":
		dateFilter = time.Unix(0, 0)
	default:
		dateFilter = now.AddDate(0, 0, -30) // Default to 30 days
	}

	// Get all transactions matching the filter
	transactions, err := h.transactionRepo.GetAllFiltered(search, transactionType, status, dateFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch transactions",
		})
		return
	}

	// Format transactions for CSV
	csvData := [][]string{
		{"TransactionID", "UserID", "UserName", "UserEmail", "Amount", "BalanceAfter", "Description", "Status", "CreatedAt"},
	}

	for _, tx := range transactions {
		user, _ := h.userRepo.GetByID(tx.UserID)
		userName := "Unknown"
		userEmail := "Unknown"

		if user != nil {
			userName = user.Name
			userEmail = user.Email
		}

		csvData = append(csvData, []string{
			tx.ID,
			tx.UserID,
			userName,
			userEmail,
			fmt.Sprintf("%.2f", tx.Amount),
			fmt.Sprintf("%.2f", tx.BalanceAfter),
			tx.Description,
			tx.Status,
			tx.CreatedAt.Format(time.RFC3339),
		})
	}

	// Convert to CSV string
	csv := convertToCSV(csvData)

	// Set response headers
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"transactions-%s.csv\"", time.Now().Format("2006-01-02")))

	// Write CSV content
	c.String(http.StatusOK, csv)
}

// GetTransactionStats returns transaction statistics
func (h *TransactionsHandler) GetTransactionStats(c *gin.Context) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	// Get deposit statistics
	depositStats, err := h.transactionRepo.GetDepositStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch deposit statistics",
		})
		return
	}

	// Get operation statistics
	operationStats, err := h.transactionRepo.GetOperationStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch operation statistics",
		})
		return
	}

	// Get operations performed today
	todayOperations, err := h.transactionRepo.CountOperationsInPeriod(today, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch today's operations",
		})
		return
	}

	// Get transaction trends for last 14 days
	trends := make([]gin.H, 14)
	for i := 13; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
		endOfDay := startOfDay.AddDate(0, 0, 1).Add(-time.Second)

		// Get deposits for this day
		dayDeposits, _ := h.transactionRepo.SumDeposits(startOfDay, endOfDay)
		// Get operations for this day
		dayOperations, _ := h.transactionRepo.CountOperationsInPeriod(startOfDay, endOfDay)

		trends[13-i] = gin.H{
			"date":       startOfDay.Format("Jan 2"),
			"income":     dayDeposits,
			"operations": dayOperations,
		}
	}

	// Get transaction stats by user type
	paidUserStats, freeUserStats, err := h.transactionRepo.GetStatsByUserType()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user type statistics",
		})
		return
	}

	// Calculate average deposit
	averageDeposit := 0.0
	if depositStats.Count > 0 {
		averageDeposit = depositStats.Amount / float64(depositStats.Count)
	}

	c.JSON(http.StatusOK, gin.H{
		"overview": gin.H{
			"total":           depositStats.Count + operationStats.Count,
			"income":          depositStats.Amount,
			"expenses":        math.Abs(operationStats.Amount),
			"averageDeposit":  averageDeposit,
			"depositCount":    depositStats.Count,
			"operationsToday": todayOperations,
			"totalOperations": operationStats.Count,
		},
		"trends": trends,
		"byUserType": []gin.H{
			{
				"type":      "paid",
				"income":    paidUserStats.Income,
				"count":     paidUserStats.Count,
				"userCount": paidUserStats.UserCount,
			},
			{
				"type":      "free",
				"income":    freeUserStats.Income,
				"count":     freeUserStats.Count,
				"userCount": freeUserStats.UserCount,
			},
		},
	})
}

// Helper function to convert data to CSV
func convertToCSV(data [][]string) string {
	var result string
	for _, row := range data {
		for i, cell := range row {
			// Escape cell if it contains comma or quote
			if strings.Contains(cell, ",") || strings.Contains(cell, "\"") {
				cell = "\"" + strings.ReplaceAll(cell, "\"", "\"\"") + "\""
			}
			result += cell
			if i < len(row)-1 {
				result += ","
			}
		}
		result += "\n"
	}
	return result
}
