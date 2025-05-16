// internal/handlers/utils/setup.go
package utils

import (
	"megapdf-api/internal/services/billing"
	"megapdf-api/internal/services/payment"
	"megapdf-api/pkg/email"
	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterRoutes registers all utility routes
func RegisterRoutes(
	router *gin.Engine,
	db *gorm.DB,
	storage storage.StorageManager,
	emailService email.EmailService,
	paypalService *payment.PayPalService,
	billingService *billing.Service,
	authMW gin.HandlerFunc,
	adminMW gin.HandlerFunc,
) {
	// Create handlers
	fileHandler := NewFileHandler(storage)
	contactHandler := NewContactHandler(emailService, getContactEmail())
	webhooksHandler := NewWebhooksHandler(paypalService, billingService)
	healthHandler := NewHealthHandler(db)

	// File routes
	router.GET("/api/file", fileHandler.GetFile)
	router.POST("/api/upload", authMW, fileHandler.UploadFile)
	router.DELETE("/api/file", authMW, fileHandler.DeleteFile)

	// Contact route
	router.POST("/api/contact", contactHandler.SubmitContactForm)

	// Webhook routes
	router.POST("/api/webhooks/paypal", webhooksHandler.PayPalWebhook)

	// Health check routes
	router.GET("/api/health", healthHandler.HealthCheck)
	router.GET("/api/health/detailed", adminMW, healthHandler.DetailedHealthCheck)
}

// getContactEmail gets the contact email from environment or config
func getContactEmail() string {
	// In a real implementation, this would come from a config file or environment variable
	return "contact@example.com"
}
