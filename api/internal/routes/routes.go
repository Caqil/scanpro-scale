// internal/routes/routes.go
package routes

import (
	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/handlers"
	"github.com/Caqil/megapdf-api/internal/middleware"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

// SetupRoutes configures all the API routes
func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize services
	keyValidationService := services.NewKeyValidationService(db)
	balanceService := services.NewBalanceService(db)
	authService := services.NewAuthService(db, cfg.JWTSecret)
	//apiKeyService := services.NewApiKeyService(db)

	// Initialize handlers
	keyValidationHandler := handlers.NewKeyValidationHandler(keyValidationService)
	balanceHandler := handlers.NewBalanceHandler(balanceService)
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret)
	//apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)

	// Middleware
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware())

	// API routes
	api := r.Group("/api")
	{
		// Public routes
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// User routes (authenticated)
		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			user.GET("/balance", balanceHandler.GetBalance)
			user.POST("/deposit", balanceHandler.CreateDeposit)
			user.POST("/deposit/verify", balanceHandler.VerifyDeposit)
		}

		// API keys routes (authenticated)
		// keys := api.Group("/keys")
		// keys.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		// {
		// 	keys.GET("", apiKeyHandler.GetUserKeys)
		// 	keys.POST("", apiKeyHandler.CreateKey)
		// 	keys.DELETE("/:id", apiKeyHandler.RevokeKey)
		// }

		// PDF operations routes with API key auth
		pdf := api.Group("/pdf")
		pdf.Use(middleware.ApiKeyMiddleware(keyValidationService))
		{
			// Implement PDF operation handlers here
			// For example: compress, merge, protect, etc.
		}
	}

	// Add Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
}
