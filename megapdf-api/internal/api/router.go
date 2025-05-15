// internal/api/router.go
package router

import (
	"github.com/gin-gonic/gin"

	"megapdf-api/internal/api/handlers/admin"
	"megapdf-api/internal/api/handlers/auth"
	"megapdf-api/internal/api/handlers/pdf"
	"megapdf-api/internal/api/handlers/user"
	"megapdf-api/internal/api/middleware"
	"megapdf-api/internal/config"
)

// SetupRouter configures the Gin router with all API endpoints
func SetupRouter(cfg *config.Config) *gin.Engine {
	// Set Gin mode based on environment
	if cfg.Env != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router with default middleware
	r := gin.New()
	
	// Add recovery middleware to recover from panics
	r.Use(middleware.Recovery())
	
	// Add logging middleware
	r.Use(middleware.Logging())
	
	// Add CORS middleware
	r.Use(middleware.CORS())

	// API routes
	api := r.Group("/api")
	{
		// Auth routes - no authentication required
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/login", auth.Login)
			authRoutes.POST("/register", auth.Register)
			authRoutes.POST("/reset-password", auth.RequestPasswordReset)
			authRoutes.POST("/reset-password/confirm", auth.ConfirmPasswordReset)
			authRoutes.GET("/validate", auth.ValidateToken)
			authRoutes.POST("/verify-email", auth.VerifyEmail)
		}

		// File routes - no authentication required
		api.GET("/file", handleFileDownload)

		// API key validation route
		api.GET("/validate-key", middleware.ValidateAPIKey)
		api.POST("/validate-key", middleware.ValidateAPIKey)

		// Authenticated routes - require either API key or JWT
		authenticatedRoutes := api.Group("")
		authenticatedRoutes.Use(middleware.AuthMiddleware())

		// PDF operation routes
		pdfRoutes := authenticatedRoutes.Group("/pdf")
		{
			pdfRoutes.POST("/convert", pdf.Convert)
			pdfRoutes.POST("/compress", pdf.Compress)
			pdfRoutes.POST("/merge", pdf.Merge)
			pdfRoutes.POST("/split", pdf.Split)
			pdfRoutes.GET("/split/status", pdf.GetSplitStatus)
			pdfRoutes.POST("/watermark", pdf.Watermark)
			pdfRoutes.POST("/protect", pdf.Protect)
			pdfRoutes.POST("/unlock", pdf.Unlock)
			pdfRoutes.POST("/unlock/check", pdf.CheckLock)
			pdfRoutes.POST("/remove", pdf.RemovePages)
			pdfRoutes.POST("/rotate", pdf.Rotate)
			pdfRoutes.POST("/sign", pdf.Sign)
			pdfRoutes.POST("/repair", pdf.Repair)
			pdfRoutes.POST("/pagenumber", pdf.AddPageNumbers)
			pdfRoutes.POST("/info", pdf.GetInfo)
			pdfRoutes.POST("/process", pdf.Process)
			pdfRoutes.POST("/save", pdf.Save)
		}

		// OCR routes
		ocrRoutes := authenticatedRoutes.Group("/ocr")
		{
			ocrRoutes.POST("", pdf.OCR)
			ocrRoutes.POST("/extract", pdf.ExtractText)
		}

		// User routes - require JWT authentication
		userRoutes := authenticatedRoutes.Group("/user")
		{
			userRoutes.GET("", user.GetProfile)
			userRoutes.PUT("", user.UpdateProfile)
			userRoutes.PUT("/password", user.UpdatePassword)
			userRoutes.GET("/balance", user.GetBalance)
			userRoutes.POST("/deposit", user.CreateDeposit)
			userRoutes.POST("/deposit/verify", user.VerifyDeposit)
		}

		// API Keys routes
		keysRoutes := authenticatedRoutes.Group("/keys")
		{
			keysRoutes.GET("", user.GetAPIKeys)
			keysRoutes.POST("", user.CreateAPIKey)
			keysRoutes.DELETE("/:id", user.DeleteAPIKey)
		}

		// Contact route
		api.POST("/contact", handleContact)

		// Admin routes - require admin authentication
		adminRoutes := authenticatedRoutes.Group("/admin")
		adminRoutes.Use(middleware.AdminMiddleware())
		{
			adminRoutes.GET("/dashboard", admin.GetDashboard)
			adminRoutes.GET("/transactions", admin.GetTransactions)
			adminRoutes.GET("/transactions/stats", admin.GetTransactionStats)
			adminRoutes.GET("/transactions/export", admin.ExportTransactions)
			adminRoutes.GET("/usage", admin.GetUsage)
			adminRoutes.GET("/activity", admin.GetActivity)
			adminRoutes.GET("/activity/export", admin.ExportActivity)
			adminRoutes.GET("/users", admin.GetUsers)
			adminRoutes.GET("/users/:userId", admin.GetUser)
			adminRoutes.PATCH("/users/:userId", admin.UpdateUser)
			adminRoutes.DELETE("/users/:userId", admin.DeleteUser)
			adminRoutes.GET("/cleanup", admin.Cleanup)
		}

		// Tracking route
		api.POST("/track-usage", handleTrackUsage)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	return r
}

// Simple handler for file downloads
func handleFileDownload(c *gin.Context) {
	// Implementation will be added
}

// Simple handler for contact form
func handleContact(c *gin.Context) {
	// Implementation will be added
}

// Handler for tracking usage
func handleTrackUsage(c *gin.Context) {
	// Implementation will be added
}