// internal/handlers/admin/usage.go
package admin

import (
	"net/http"
	"sort"
	"time"

	"megapdf-api/internal/repositories"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
)

// UsageHandler handles admin usage statistics
type UsageHandler struct {
	usageStatsRepo  repositories.UsageStatsRepository
	userRepo        repositories.UserRepository
	transactionRepo repositories.TransactionRepository
}

// NewUsageHandler creates a new usage handler
func NewUsageHandler(usageStatsRepo repositories.UsageStatsRepository, userRepo repositories.UserRepository, transactionRepo repositories.TransactionRepository) *UsageHandler {
	return &UsageHandler{
		usageStatsRepo:  usageStatsRepo,
		userRepo:        userRepo,
		transactionRepo: transactionRepo,
	}
}

// Register registers the routes for this handler
func (h *UsageHandler) Register(router *gin.RouterGroup) {
	router.GET("/usage", h.GetUsageStats)
}

// GetUsageStats returns API usage statistics
func (h *UsageHandler) GetUsageStats(c *gin.Context) {
	// Get daily usage for the last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	// Get daily statistics
	dailyStats, err := h.usageStatsRepo.GetDailyStats(thirtyDaysAgo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch daily statistics",
		})
		return
	}

	// Format daily statistics
	daily := make([]gin.H, len(dailyStats))
	for i, stat := range dailyStats {
		daily[i] = gin.H{
			"date":     stat.Date.Format("Jan 2"),
			"requests": stat.Count,
			"users":    stat.UserCount,
			"revenue":  float64(stat.Count) * payment.OperationCost,
		}
	}

	// Get usage by operation
	operationUsage, err := h.usageStatsRepo.GetUsageByOperation()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch operation usage",
		})
		return
	}

	// Format operation usage
	byOperation := make(map[string]int)
	for _, op := range operationUsage {
		byOperation[op.Operation] = op.Count
	}

	// Get usage breakdown by user type (free vs paid)
	userTypeUsage, err := h.usageStatsRepo.GetUsageByUserType()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user type usage",
		})
		return
	}

	// Get top API users
	topUsers, err := h.usageStatsRepo.GetTopUsers(10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch top users",
		})
		return
	}

	// Get endpoint performance data (mocked)
	topEndpoints := make([]gin.H, 0)
	for op, count := range byOperation {
		topEndpoints = append(topEndpoints, gin.H{
			"endpoint":        "/api/" + op,
			"count":           count,
			"avgResponseTime": 100 + (count % 500), // Mock response time between 100-600ms
		})
	}

	// Sort endpoints by count
	sort.Slice(topEndpoints, func(i, j int) bool {
		return topEndpoints[i]["count"].(int) > topEndpoints[j]["count"].(int)
	})

	// Take top 8 endpoints
	if len(topEndpoints) > 8 {
		topEndpoints = topEndpoints[:8]
	}

	// Calculate total revenue
	totalOperations := 0
	for _, count := range byOperation {
		totalOperations += count
	}
	totalRevenue := float64(totalOperations) * payment.OperationCost

	// Calculate revenue by operation
	revenueByOperation := make(map[string]float64)
	for op, count := range byOperation {
		revenueByOperation[op] = float64(count) * payment.OperationCost
	}

	c.JSON(http.StatusOK, gin.H{
		"daily":       daily,
		"byOperation": byOperation,
		"byTier": gin.H{
			"free": userTypeUsage.FreeUsage,
			"paid": userTypeUsage.PaidUsage,
		},
		"topEndpoints": topEndpoints,
		"topUsers":     topUsers,
		"revenue": gin.H{
			"total":       totalRevenue,
			"byOperation": revenueByOperation,
		},
	})
}
