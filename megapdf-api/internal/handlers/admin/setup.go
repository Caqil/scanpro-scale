// internal/handlers/admin/setup.go
package admin

import (
	"megapdf-api/internal/middleware"
	"megapdf-api/internal/repositories"
	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
)

// RegisterAdminHandlers registers all admin handlers
func RegisterAdminHandlers(
	router *gin.Engine,
	userRepo repositories.UserRepository,
	transactionRepo repositories.TransactionRepository,
	usageStatsRepo repositories.UsageStatsRepository,
	sessionRepo repositories.SessionRepository,
	storageManager storage.StorageManager,
) {
	// Create admin router group with auth and admin middleware
	adminGroup := router.Group("/api/admin")
	adminGroup.Use(middleware.Auth())
	adminGroup.Use(middleware.Admin())

	// Initialize handlers
	dashboardHandler := NewDashboardHandler(userRepo, transactionRepo, usageStatsRepo)
	usersHandler := NewUsersHandler(userRepo, usageStatsRepo, transactionRepo)
	transactionsHandler := NewTransactionsHandler(transactionRepo, userRepo)
	activityHandler := NewActivityHandler(userRepo, usageStatsRepo, transactionRepo, sessionRepo)
	usageHandler := NewUsageHandler(usageStatsRepo, userRepo, transactionRepo)
	cleanupHandler := NewCleanupHandler(storageManager)

	// Register routes
	dashboardHandler.Register(adminGroup)
	usersHandler.Register(adminGroup)
	transactionsHandler.Register(adminGroup)
	activityHandler.Register(adminGroup)
	usageHandler.Register(adminGroup)
	cleanupHandler.Register(adminGroup)
}
