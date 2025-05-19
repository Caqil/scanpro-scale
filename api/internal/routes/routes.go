// internal/routes/routes.go
package routes

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func maskPassword(password string) string {
	if password != "" {
		return "********"
	}
	return "[not set]"
}
func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Add route logging
	fmt.Println("Setting up routes...")
	// Initialize email service with additional logging
	fmt.Println("Initializing email service with config:")
	fmt.Printf("  SMTP Host: %s\n", cfg.SMTPHost)
	fmt.Printf("  SMTP Port: %d\n", cfg.SMTPPort)
	fmt.Printf("  SMTP User: %s\n", cfg.SMTPUser)               // Log just presence, not the actual username
	fmt.Printf("  SMTP Pass: %s\n", maskPassword(cfg.SMTPPass)) // Mask password for security
	fmt.Printf("  Email From: %s\n", cfg.EmailFrom)
	fmt.Printf("  App URL: %s\n", cfg.AppURL)
	fmt.Printf("  Debug Mode: %v\n", cfg.Debug)
	// Apply CORS middleware globally
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware())
	r.Use(func(c *gin.Context) {
		now := time.Now().UTC()
		c.Set("now", map[string]interface{}{
			"date": now.Format(time.RFC3339),
		})
		c.Next()
	})
	// Set development mode info in context
	mode := "production"
	if cfg.Debug {
		mode = "development"
		r.Use(func(c *gin.Context) {
			c.Set("mode", "development")
			c.Next()
		})
	} else {
		r.Use(func(c *gin.Context) {
			c.Set("mode", "production")
			c.Next()
		})
	}

	fmt.Println("Running in", mode, "mode")

	// Initialize services
	keyValidationService := services.NewKeyValidationService(db)
	balanceService := services.NewBalanceService(db)
	authService := services.NewAuthService(db, cfg.JWTSecret)
	apiKeyService := services.NewApiKeyService(db)
	emailService := services.NewEmailService(cfg)
	pdfHandler := handlers.NewPDFHandler(balanceService, cfg)

	// Initialize handlers
	keyValidationHandler := handlers.NewKeyValidationHandler(keyValidationService)
	balanceHandler := handlers.NewBalanceHandler(balanceService)
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret, cfg)
	trackUsageHandler := handlers.NewTrackUsageHandler()
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)
	fileHandler := handlers.NewFileHandler(cfg)
	adminHandler := handlers.NewAdminHandler()
	paypalWebhookHandler := handlers.NewPayPalWebhookHandler()
	fmt.Println("Setting email service on auth handler")
	authHandler.SetEmailService(emailService)
	settingsHandler := handlers.NewSettingsHandler()
	// API routes
	api := r.Group("/api")
	{
		fmt.Println("Registering route: /api/validate-key")
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)
		fmt.Println("Registering route: /api/validate-token")
		api.POST("/webhooks/paypal", paypalWebhookHandler.HandleWebhook)
		api.GET("/validate-token", func(c *gin.Context) {
			// Get token from cookie
			token, err := c.Cookie("authToken")

			// If no cookie, try from Authorization header
			if err != nil {
				authHeader := c.GetHeader("Authorization")
				if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
					token = strings.TrimPrefix(authHeader, "Bearer ")
				}
			}

			// No token found
			if token == "" {
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "No token provided",
				})
				return
			}

			// Validate the token
			userID, err := authService.ValidateToken(token)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "Invalid token",
				})
				return
			}

			// Get user data to include role
			var user models.User
			if err := db.First(&user, "id = ?", userID).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "User not found",
				})
				return
			}

			// Token is valid
			c.JSON(http.StatusOK, gin.H{
				"valid":  true,
				"userId": userID,
				"role":   user.Role,
			})
		})
		if balanceHandlerType := reflect.TypeOf(balanceHandler); balanceHandlerType != nil {
			if method, exists := balanceHandlerType.MethodByName("SetEmailService"); exists {
				fmt.Println("Setting email service on balance handler")
				reflect.ValueOf(balanceHandler).Method(method.Index).Call([]reflect.Value{reflect.ValueOf(emailService)})
			} else {
				fmt.Println("Balance handler does not have SetEmailService method yet")
			}
		}

		fmt.Println("Registering route: /api/file")
		api.GET("/file", fileHandler.ServeFile)
		fmt.Println("Registering route: /api/track-usage")
		api.GET("/track-usage", middleware.AuthMiddleware(cfg.JWTSecret), trackUsageHandler.GetUsageStats)
		api.POST("/track-usage", middleware.AuthMiddleware(cfg.JWTSecret), trackUsageHandler.TrackOperation)
		// Auth routes
		auth := api.Group("/auth")
		{
			fmt.Println("Registering route: /api/auth/register")
			auth.POST("/register", authHandler.Register)

			fmt.Println("Registering route: /api/auth/login")
			auth.POST("/login", authHandler.Login)

			// Password reset routes
			fmt.Println("Registering route: /api/auth/reset-password")
			auth.POST("/reset-password", authHandler.RequestPasswordReset)

			fmt.Println("Registering route: /api/auth/reset-password/confirm")
			auth.POST("/reset-password/confirm", authHandler.ResetPassword)

			fmt.Println("Registering route: /api/auth/validate")
			auth.GET("/validate", authHandler.ValidateResetToken)
			fmt.Println("Registering route: /api/auth/validate-token")

			// Email verification routes
			fmt.Println("Registering route: /api/auth/verify-email")
			auth.GET("/verify-email", authHandler.VerifyEmail)
			auth.POST("/verify-email", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.ResendVerificationEmail)

			fmt.Println("Registering route: /api/auth/logout")
			auth.POST("/logout", func(c *gin.Context) {
				// Clear the auth cookie by setting it to expire immediately
				c.SetCookie(
					"authToken", // Cookie name
					"",          // Empty value
					-1,          // Max age (-1 = delete now)
					"/",         // Path
					"",          // Domain
					false,       // Secure
					true,        // HTTP only
				)

				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Logged out successfully",
				})
			})
		}

		pdf := api.Group("/pdf")
		pdf.Use(middleware.ApiKeyMiddleware(keyValidationService))
		{
			fmt.Println("Registering route: /api/pdf/compress")
			pdf.POST("/compress", pdfHandler.CompressPDF)

			fmt.Println("Registering route: /api/pdf/protect")
			pdf.POST("/protect", pdfHandler.ProtectPDF)

			fmt.Println("Registering route: /api/pdf/merge")
			pdf.POST("/merge", pdfHandler.MergePDFs)

			// New routes
			fmt.Println("Registering route: /api/pdf/split")
			pdf.POST("/split", pdfHandler.SplitPDF)

			fmt.Println("Registering route: /api/pdf/split/status")
			pdf.GET("/split/status", pdfHandler.GetSplitStatus)

			fmt.Println("Registering route: /api/pdf/rotate")
			pdf.POST("/rotate", pdfHandler.RotatePDF)

			fmt.Println("Registering route: /api/pdf/pagenumber")
			pdf.POST("/pagenumber", pdfHandler.AddPageNumbersToPDF)

			fmt.Println("Registering route: /api/pdf/remove")
			pdf.POST("/remove", pdfHandler.RemovePagesFromPDF)

			fmt.Println("Registering route: /api/pdf/watermark")
			pdf.POST("/watermark", pdfHandler.WatermarkPDF)

			fmt.Println("Registering route: /api/pdf/unlock")
			pdf.POST("/unlock", pdfHandler.UnlockPDF)
		}

		// User routes
		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			fmt.Println("Registering route: /api/user/balance")
			user.GET("/balance", balanceHandler.GetBalance)

			fmt.Println("Registering route: /api/user/deposit")
			user.POST("/deposit", balanceHandler.CreateDeposit)

			fmt.Println("Registering route: /api/user/deposit/verify")
			user.POST("/deposit/verify", balanceHandler.VerifyDeposit)

			// User profile routes
			fmt.Println("Registering route: /api/user/profile")
			user.GET("/profile", handlers.GetUserProfile)
			user.PUT("/profile", handlers.UpdateUserProfile)

			// Password change route
			fmt.Println("Registering route: /api/user/password")
			user.PUT("/password", handlers.ChangeUserPassword)
		}
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/dashboard", adminHandler.GetDashboardStats)
			admin.GET("/users", adminHandler.GetUsers)
			admin.GET("/users/:id", adminHandler.GetUser)
			admin.POST("/users", adminHandler.CreateUser)
			admin.PATCH("/users/:id", adminHandler.UpdateUser)
			admin.DELETE("/users/:id", adminHandler.DeleteUser)
			admin.GET("/api-usage", adminHandler.GetAPIUsage)
			admin.GET("/transactions", adminHandler.GetTransactions)
			admin.GET("/activity", adminHandler.GetActivityLogs)
			admin.POST("/settings", adminHandler.UpdateSettings)
			admin.GET("/pricing", adminHandler.GetPricingSettings)
			admin.POST("/pricing", adminHandler.UpdatePricingSettings)
			admin.POST("/operation-pricing", adminHandler.UpdateOperationPricing)
			admin.GET("/settings/:category", settingsHandler.GetSettings)
			admin.POST("/settings/:category", settingsHandler.UpdateSettings)
			admin.GET("/settings", settingsHandler.GetAllSettings)
		}
		keys := api.Group("/keys")
		keys.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			fmt.Println("Registering route: /api/keys")
			keys.GET("", apiKeyHandler.ListKeys)
			keys.POST("", apiKeyHandler.CreateKey)

			fmt.Println("Registering route: /api/keys/:id")
			keys.DELETE("/:id", apiKeyHandler.RevokeKey)
		}
	}

	// Add email preview route in development mode
	if cfg.Debug {
		r.GET("/email-preview", func(c *gin.Context) {
			c.HTML(http.StatusOK, "email_preview.html", gin.H{
				"title": "Email Preview",
				"body":  "This is a preview of an email that would be sent in production mode.",
			})
		})
	}

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	fmt.Println("Routes setup complete")
}
