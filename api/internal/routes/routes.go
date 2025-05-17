// internal/routes/routes.go
package routes

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/handlers"
	"github.com/Caqil/megapdf-api/internal/middleware"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Add route logging
	fmt.Println("Setting up routes...")

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
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret)
	// Set email service on auth handler
	authHandler.SetEmailService(emailService)
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)
	fileHandler := handlers.NewFileHandler(cfg)

	// API routes
	api := r.Group("/api")
	{
		fmt.Println("Registering route: /api/validate-key")
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)

		fmt.Println("Registering route: /api/file")
		api.GET("/file", fileHandler.ServeFile)

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

			// Email verification routes
			fmt.Println("Registering route: /api/auth/verify-email")
			auth.GET("/verify-email", authHandler.VerifyEmail)
			auth.POST("/verify-email", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.ResendVerificationEmail)
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
