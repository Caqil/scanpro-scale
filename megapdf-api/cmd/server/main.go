// cmd/server/main.go - Application entry point
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"megapdf-api/internal/config"
	"megapdf-api/internal/middleware"
	"megapdf-api/internal/repositories"
	"megapdf-api/internal/services/auth"
	"megapdf-api/internal/services/payment"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/pkg/email"
	"megapdf-api/pkg/storage"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Setup logger
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := repositories.InitDatabase(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize storage
	storageProvider := storage.NewLocalFileStorage(cfg.Storage)

	// Initialize email service
	emailService := email.NewSMTPService(cfg.SMTP)

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	apiKeyRepo := repositories.NewAPIKeyRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)
	usageStatsRepo := repositories.NewUsageStatsRepository(db)
	passwordResetRepo := repositories.NewPasswordResetRepository(db)

	// Initialize services
	authService := auth.NewAuthService(userRepo, passwordResetRepo, emailService, cfg.JWT)
	pdfService := pdf.NewPDFService(storageProvider, cfg.PDFTools)
	billingService := payment.NewBillingService(userRepo, transactionRepo, usageStatsRepo, cfg.Billing)

	// Create router
	router := gin.New()

	// Apply middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowOrigins,
		AllowMethods:     cfg.CORS.AllowMethods,
		AllowHeaders:     cfg.CORS.AllowHeaders,
		ExposeHeaders:    cfg.CORS.ExposeHeaders,
		AllowCredentials: cfg.CORS.AllowCredentials,
		MaxAge:           time.Duration(cfg.CORS.MaxAge) * time.Hour,
	}))

	// Setup routes
	handlers.SetupRoutes(router, authService, pdfService, billingService, userRepo, apiKeyRepo, storageProvider, cfg)

	// Create HTTP server
	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s:%d", cfg.Server.Host, cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create timeout context for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}

	log.Println("Server exited properly")
}
