// internal/routes/routes.go
package routes

import (
	"fmt"
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

	// Initialize services
	keyValidationService := services.NewKeyValidationService(db)
	balanceService := services.NewBalanceService(db)
	authService := services.NewAuthService(db, cfg.JWTSecret)

	// Initialize handlers
	keyValidationHandler := handlers.NewKeyValidationHandler(keyValidationService)
	balanceHandler := handlers.NewBalanceHandler(balanceService)
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret)

	// API routes
	api := r.Group("/")
	{
		fmt.Println("Registering route: /api/validate-key")
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)

		// Auth routes
		auth := api.Group("/auth")
		{
			fmt.Println("Registering route: /api/auth/register")
			auth.POST("/register", authHandler.Register)

			fmt.Println("Registering route: /api/auth/login")
			auth.POST("/login", authHandler.Login)
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
		}
	}

	// Health check route for testing
	fmt.Println("Registering route: /health")
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy", "timestamp": time.Now().String()})
	})
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Root test endpoint working"})
	})
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})
	// Add Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	fmt.Println("Routes setup complete")
}
