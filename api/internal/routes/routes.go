package routes

import (
	"github.com/Caqil/megapdf-api/internal/handlers"
	"github.com/Caqil/megapdf-api/internal/middleware"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes configures the API routes
// @title REST API
// @version 1.0
// @description API documentation for the Go REST API with SQLite
// @host localhost:8080
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	// Initialize services
	userService := services.NewUserService(db)
	transactionService := services.NewTransactionService(db)
	accountService := services.NewAccountService(db)
	sessionService := services.NewSessionService(db)
	usageStatsService := services.NewUsageStatsService(db)
	verificationService := services.NewVerificationService(db)
	apiKeyService := services.NewApiKeyService(db)
	passwordResetService := services.NewPasswordResetService(db)
	webhookService := services.NewWebhookService(db)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	accountHandler := handlers.NewAccountHandler(accountService)
	sessionHandler := handlers.NewSessionHandler(sessionService)
	usageStatsHandler := handlers.NewUsageStatsHandler(usageStatsService)
	verificationHandler := handlers.NewVerificationHandler(verificationService)
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)
	passwordResetHandler := handlers.NewPasswordResetHandler(passwordResetService)
	webhookHandler := handlers.NewWebhookHandler(webhookService)

	// Middleware
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware())

	// API routes
	api := r.Group("/api")
	{
		// User routes
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.POST("", userHandler.CreateUser)
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
		}

		// Transaction routes
		transactions := api.Group("/transactions")
		transactions.Use(middleware.AuthMiddleware())
		{
			transactions.POST("", transactionHandler.CreateTransaction)
			transactions.GET("/:id", transactionHandler.GetTransaction)
			transactions.PUT("/:id", transactionHandler.UpdateTransaction)
			transactions.DELETE("/:id", transactionHandler.DeleteTransaction)
		}

		// Account routes
		accounts := api.Group("/accounts")
		accounts.Use(middleware.AuthMiddleware())
		{
			accounts.POST("", accountHandler.CreateAccount)
			accounts.GET("/:id", accountHandler.GetAccount)
			accounts.PUT("/:id", accountHandler.UpdateAccount)
			accounts.DELETE("/:id", accountHandler.DeleteAccount)
		}

		// Session routes
		sessions := api.Group("/sessions")
		sessions.Use(middleware.AuthMiddleware())
		{
			sessions.POST("", sessionHandler.CreateSession)
			sessions.GET("/:id", sessionHandler.GetSession)
			sessions.PUT("/:id", sessionHandler.UpdateSession)
			sessions.DELETE("/:id", sessionHandler.DeleteSession)
		}

		// UsageStats routes
		usageStats := api.Group("/usage-stats")
		usageStats.Use(middleware.AuthMiddleware())
		{
			usageStats.POST("", usageStatsHandler.CreateUsageStats)
			usageStats.GET("/:id", usageStatsHandler.GetUsageStats)
			usageStats.PUT("/:id", usageStatsHandler.UpdateUsageStats)
			usageStats.DELETE("/:id", usageStatsHandler.DeleteUsageStats)
		}

		// VerificationToken routes
		verification := api.Group("/verification-tokens")
		{
			verification.POST("", verificationHandler.CreateVerificationToken)
			verification.GET("/:identifier", verificationHandler.GetVerificationToken)
			verification.DELETE("/:identifier", verificationHandler.DeleteVerificationToken)
		}

		// ApiKey routes
		apiKeys := api.Group("/api-keys")
		apiKeys.Use(middleware.AuthMiddleware())
		{
			apiKeys.POST("", apiKeyHandler.CreateApiKey)
			apiKeys.GET("/:id", apiKeyHandler.GetApiKey)
			apiKeys.PUT("/:id", apiKeyHandler.UpdateApiKey)
			apiKeys.DELETE("/:id", apiKeyHandler.DeleteApiKey)
		}

		// PasswordResetToken routes
		passwordReset := api.Group("/password-reset-tokens")
		{
			passwordReset.POST("", passwordResetHandler.CreatePasswordResetToken)
			passwordReset.GET("/:id", passwordResetHandler.GetPasswordResetToken)
			passwordReset.DELETE("/:id", passwordResetHandler.DeletePasswordResetToken)
		}

		// WebhookEvent routes
		webhooks := api.Group("/webhooks")
		{
			webhooks.POST("", webhookHandler.CreateWebhookEvent)
			webhooks.GET("/:id", webhookHandler.GetWebhookEvent)
			webhooks.PUT("/:id", webhookHandler.UpdateWebhookEvent)
			webhooks.DELETE("/:id", webhookHandler.DeleteWebhookEvent)
		}
	}
}
