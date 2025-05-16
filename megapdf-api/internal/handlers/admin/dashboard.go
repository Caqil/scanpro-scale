// internal/handlers/admin/dashboard.go
package admin

import (
	"net/http"
	"runtime"
	"time"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/models"
	"megapdf-api/internal/repositories"

	"github.com/gin-gonic/gin"
)

// DashboardHandler handles admin dashboard requests
type DashboardHandler struct {
	userRepo        repositories.UserRepository
	transactionRepo repositories.TransactionRepository
	usageStatsRepo  repositories.UsageStatsRepository
}

// NewDashboardHandler creates a new dashboard handler
func NewDashboardHandler(userRepo repositories.UserRepository, transactionRepo repositories.TransactionRepository, usageStatsRepo repositories.UsageStatsRepository) *DashboardHandler {
	return &DashboardHandler{
		userRepo:        userRepo,
		transactionRepo: transactionRepo,
		usageStatsRepo:  usageStatsRepo,
	}
}

// Register registers the routes for this handler
func (h *DashboardHandler) Register(router *gin.RouterGroup) {
	router.GET("", h.GetDashboardStats)
}

// GetDashboardStats returns admin dashboard statistics
func (h *DashboardHandler) GetDashboardStats(c *gin.Context) {
	// Get system metrics
	systemMetrics := getSystemMetrics()

	// Get user statistics
	totalUsers, err := h.userRepo.Count()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user statistics",
		})
		return
	}

	now := time.Now()
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	// Get new users this month
	newUsersThisMonth, err := h.userRepo.CountNew(firstDayOfMonth)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch new user statistics",
		})
		return
	}

	// Get active users
	activeUsers, err := h.userRepo.CountActive(thirtyDaysAgo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch active user statistics",
		})
		return
	}

	// Get user distribution data
	freeUsers, err := h.userRepo.CountFreeUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user distribution",
		})
		return
	}

	paidUsers, err := h.userRepo.CountPaidUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user distribution",
		})
		return
	}

	inactiveUsers := totalUsers - (freeUsers + paidUsers)

	// Get API usage statistics
	totalRequests, err := h.usageStatsRepo.SumTotalCount()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch API usage statistics",
		})
		return
	}

	operationCounts, err := h.usageStatsRepo.CountByOperation()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch operation counts",
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

	// Get monthly revenue
	monthlyRevenue, err := h.transactionRepo.SumDeposits(firstDayOfMonth, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch revenue statistics",
		})
		return
	}

	// Get user growth data
	userGrowth := make([]gin.H, 12)
	for i := 11; i >= 0; i-- {
		startMonth := now.AddDate(0, -i, 0)
		startOfMonth := time.Date(startMonth.Year(), startMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth := startOfMonth.AddDate(0, 1, -1)

		// Count users at end of this month
		usersCount, _ := h.userRepo.CountBefore(endOfMonth)
		activeCount, _ := h.userRepo.CountActive(startOfMonth)

		userGrowth[11-i] = gin.H{
			"date":   startOfMonth.Format("Jan"),
			"users":  usersCount,
			"active": activeCount,
		}
	}

	// Get recent activity
	recentActivity, err := getRecentActivity(h.userRepo, h.usageStatsRepo, h.transactionRepo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch recent activity",
		})
		return
	}

	// Create dashboard response
	c.JSON(http.StatusOK, gin.H{
		"users": gin.H{
			"total":          totalUsers,
			"active":         activeUsers,
			"newThisMonth":   newUsersThisMonth,
			"bySubscription": gin.H{
				"free":     freeUsers,
				"paid":     paidUsers,
				"inactive": inactiveUsers,
			},
		},
		"apiUsage": gin.H{
			"totalRequests": totalRequests,
			"byOperation":   operationCounts,
			"topUsers":      topUsers,
		},
		"revenue": gin.H{
			"thisMonth": monthlyRevenue,
			"growth":    0, // Would need historical data to calculate
			"annual":    monthlyRevenue * 12,
		},
		"system":       systemMetrics,
		"userGrowth":   userGrowth,
		"recentActivity": recentActivity,
	})
}

// getSystemMetrics returns server metrics
func getSystemMetrics() gin.H {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Get system uptime
	uptime := time.Since(time.Unix(0, int64(m.LastGC)))
	days := int(uptime.Hours()) / 24
	hours := int(uptime.Hours()) % 24
	minutes := int(uptime.Minutes()) % 60
	uptimeStr := fmt.Sprintf("%dd %dh %dm", days, hours, minutes)

	// Get memory usage
	memoryUsage := int(float64(m.Alloc) / float64(m.Sys) * 100)

	// Determine health status
	health := "healthy"
	if memoryUsage > 80 {
		health = "degraded"
	} else if memoryUsage > 95 {
		health = "down"
	}

	return gin.H{
		"health":      health,
		"uptime":      uptimeStr,
		"memoryUsage": memoryUsage,
		"diskUsage":   getDiskUsage(),
	}
}

// getDiskUsage returns disk usage percentage
func getDiskUsage() int {
	// Simple implementation - could be expanded for more detailed stats
	var stat syscall.Statfs_t
	err := syscall.Statfs("/", &stat)
	if err != nil {
		return 0
	}

	available := stat.Bavail * uint64(stat.Bsize)
	total := stat.Blocks * uint64(stat.Bsize)
	used := total - available

	return int(float64(used) / float64(total) * 100)
}

// getRecentActivity returns recent activity logs
func getRecentActivity(userRepo repositories.UserRepository, usageStatsRepo repositories.UsageStatsRepository, transactionRepo repositories.TransactionRepository) ([]gin.H, error) {
	// Get timestamps
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	activity := make([]gin.H, 0)

	// Get recent API usage
	recentApiUsage, err := usageStatsRepo.GetRecent(thirtyDaysAgo, 20)
	if err == nil {
		for _, usage := range recentApiUsage {
			user, _ := userRepo.GetByID(usage.UserID)
			userName := "Unknown"
			userEmail := "Unknown"
			if user != nil {
				userName = user.Name
				userEmail = user.Email
			}

			activity = append(activity, gin.H{
				"id":        usage.ID,
				"userId":    usage.UserID,
				"userName":  userName,
				"userEmail": userEmail,
				"action":    "api_call",
				"resource":  usage.Operation,
				"details":   fmt.Sprintf("Used %s operation %d times", usage.Operation, usage.Count),
				"timestamp": usage.Date,
				"type":      "api",
			})
		}
	}

	// Get recent transactions
	recentTransactions, err := transactionRepo.GetRecent(thirtyDaysAgo, 15)
	if err == nil {
		for _, tx := range recentTransactions {
			user, _ := userRepo.GetByID(tx.UserID)
			userName := "Unknown"
			userEmail := "Unknown"
			if user != nil {
				userName = user.Name
				userEmail = user.Email
			}

			isDeposit := tx.Amount > 0
			action := "balance.charge"
			details := fmt.Sprintf("Charged $%.3f for operation", math.Abs(tx.Amount))
			
			if isDeposit {
				action = "balance.deposit"
				details = fmt.Sprintf("Deposited $%.2f to account balance", tx.Amount)
			}

			activity = append(activity, gin.H{
				"id":        tx.ID,
				"userId":    tx.UserID,
				"userName":  userName,
				"userEmail": userEmail,
				"action":    action,
				"resource":  "transaction",
				"details":   details,
				"timestamp": tx.CreatedAt,
				"type":      "subscription",
			})
		}
	}

	// Get recent user registrations
	recentUsers, err := userRepo.GetRecent(thirtyDaysAgo, 15)
	if err == nil {
		for _, user := range recentUsers {
			activity = append(activity, gin.H{
				"id":        user.ID,
				"userId":    user.ID,
				"userName":  user.Name,
				"userEmail": user.Email,
				"action":    "user_registered",
				"resource":  "user",
				"details":   "New user registration",
				"timestamp": user.CreatedAt,
				"type":      "user",
			})
		}
	}

	// Sort by timestamp
	sort.Slice(activity, func(i, j int) bool {
		timeI, _ := activity[i]["timestamp"].(time.Time)
		timeJ, _ := activity[j]["timestamp"].(time.Time)
		return timeI.After(timeJ)
	})

	// Take only the most recent 10
	if len(activity) > 10 {
		activity = activity[:10]
	}

	return activity, nil
}