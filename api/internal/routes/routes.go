// api/internal/routes/routes.go
package routes

import (
	"net/http"
	"os"
	"strconv"

	"github.com/Caqil/megapdf-api/internal/handlers"
	"github.com/Caqil/megapdf-api/internal/middleware"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupRoutes configures all the API routes
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

	// New services from Next.js API migration
	keyValidationService := services.NewKeyValidationService(db)
	balanceService := services.NewBalanceService(db)
	activityService := services.NewActivityService(db)

	// Configure OCR service with proper directories
	ocrService := services.NewOCRService(
		"./uploads",
		"./public/ocr",
		"./temp",
	)

	// Configure email service from environment variables
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPortStr := os.Getenv("SMTP_PORT")
	smtpPort, _ := strconv.Atoi(smtpPortStr)
	if smtpPort == 0 {
		smtpPort = 587 // Default port
	}
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	smtpSecureStr := os.Getenv("SMTP_SECURE")
	smtpSecure := smtpSecureStr == "true"
	contactRecipient := os.Getenv("CONTACT_RECIPIENT_EMAIL")
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-default-secret-key" // Default for development, change in production
	}
	authHandler := handlers.NewAuthHandler(userService, jwtSecret)
	setupHandler := handlers.NewSetupHandler(userService)
	// Use default values if not set
	if smtpHost == "" {
		smtpHost = "localhost"
	}
	if contactRecipient == "" {
		contactRecipient = smtpUser // Default to the SMTP user
	}

	emailService := services.NewEmailService(
		smtpHost,
		smtpPort,
		smtpUser,
		smtpPass,
		smtpSecure,
		smtpUser,
		contactRecipient,
	)

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

	// New handlers from Next.js API migration
	keyValidationHandler := handlers.NewKeyValidationHandler(keyValidationService)
	balanceHandler := handlers.NewBalanceHandler(balanceService)
	activityHandler := handlers.NewAdminActivityHandler(activityService)
	ocrHandler := handlers.NewOCRHandler(ocrService)
	contactHandler := handlers.NewContactHandler(emailService)

	// Middleware
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware())

	// API routes
	api := r.Group("/api")
	{
		// Contact form route (public)
		api.POST("/contact", contactHandler.SendContactForm)

		// API key validation route (public)
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)

		// OCR routes (with API key auth)
		ocr := api.Group("/ocr")
		ocr.Use(middleware.ApiKeyMiddleware(keyValidationService))
		{
			ocr.POST("", ocrHandler.ProcessOCR)
			ocr.POST("/extract", ocrHandler.ExtractText)
		}

		// Authentication routes are typically handled by NextAuth.js
		// Here you'd implement JWT-based auth endpoints

		// User related routes (auth required)
		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			user.GET("/balance", balanceHandler.GetBalance)
			user.POST("/deposit", balanceHandler.CreateDeposit)
			user.POST("/deposit/verify", balanceHandler.VerifyDeposit)

			// Implement other user routes migrated from Next.js
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/activity", activityHandler.GetActivity)
			admin.GET("/activity/export", activityHandler.ExportActivity)

			// Implement other admin routes migrated from Next.js
		}

		// Existing routes from the initial Go implementation
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(jwtSecret))
		users.Use(middleware.AdminMiddleware()) // Only admins can manage users
		{
			users.POST("", userHandler.CreateUser)
			users.GET("/:id", userHandler.GetUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
		}

		transactions := api.Group("/transactions")
		transactions.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			transactions.POST("", transactionHandler.CreateTransaction)
			transactions.GET("/:id", transactionHandler.GetTransaction)
			transactions.PUT("/:id", transactionHandler.UpdateTransaction)
			transactions.DELETE("/:id", transactionHandler.DeleteTransaction)
		}

		accounts := api.Group("/accounts")
		accounts.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			accounts.POST("", accountHandler.CreateAccount)
			accounts.GET("/:id", accountHandler.GetAccount)
			accounts.PUT("/:id", accountHandler.UpdateAccount)
			accounts.DELETE("/:id", accountHandler.DeleteAccount)
		}

		sessions := api.Group("/sessions")
		sessions.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			sessions.POST("", sessionHandler.CreateSession)
			sessions.GET("/:id", sessionHandler.GetSession)
			sessions.PUT("/:id", sessionHandler.UpdateSession)
			sessions.DELETE("/:id", sessionHandler.DeleteSession)
		}

		usageStats := api.Group("/usage-stats")
		usageStats.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			usageStats.POST("", usageStatsHandler.CreateUsageStats)
			usageStats.GET("/:id", usageStatsHandler.GetUsageStats)
			usageStats.PUT("/:id", usageStatsHandler.UpdateUsageStats)
			usageStats.DELETE("/:id", usageStatsHandler.DeleteUsageStats)
		}

		verification := api.Group("/verification-tokens")
		{
			verification.POST("", verificationHandler.CreateVerificationToken)
			verification.GET("/:identifier", verificationHandler.GetVerificationToken)
			verification.DELETE("/:identifier", verificationHandler.DeleteVerificationToken)
		}

		apiKeys := api.Group("/api-keys")
		apiKeys.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))
		{
			apiKeys.POST("", apiKeyHandler.CreateApiKey)
			apiKeys.GET("/:id", apiKeyHandler.GetApiKey)
			apiKeys.PUT("/:id", apiKeyHandler.UpdateApiKey)
			apiKeys.DELETE("/:id", apiKeyHandler.DeleteApiKey)
		}

		passwordReset := api.Group("/password-reset-tokens")
		{
			passwordReset.POST("", passwordResetHandler.CreatePasswordResetToken)
			passwordReset.GET("/:id", passwordResetHandler.GetPasswordResetToken)
			passwordReset.DELETE("/:id", passwordResetHandler.DeletePasswordResetToken)
		}

		webhooks := api.Group("/webhooks")
		{
			webhooks.POST("", webhookHandler.CreateWebhookEvent)
			webhooks.GET("/:id", webhookHandler.GetWebhookEvent)
			webhooks.PUT("/:id", webhookHandler.UpdateWebhookEvent)
			webhooks.DELETE("/:id", webhookHandler.DeleteWebhookEvent)

			// Add PayPal webhook handler
			webhooks.POST("/paypal", func(c *gin.Context) {
				// Implement PayPal webhook handling
				c.JSON(http.StatusOK, gin.H{"success": true})
			})
		}
	}
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)

		// Password reset routes
		auth.POST("/reset-password", passwordResetHandler.RequestPasswordReset)
		auth.GET("/reset-password", passwordResetHandler.VerifyResetToken)
		auth.POST("/reset-password/confirm", passwordResetHandler.ConfirmPasswordReset)

		// Email verification
		auth.GET("/verify-email", passwordResetHandler.VerifyEmail)
		auth.POST("/verify-email", passwordResetHandler.ResendVerificationEmail)
	}

	// Initial setup route
	setup := api.Group("/setup")
	{
		setup.POST("/admin", setupHandler.CreateInitialAdmin)
	}
}
