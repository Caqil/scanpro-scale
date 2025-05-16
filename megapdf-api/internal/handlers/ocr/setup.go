// internal/handlers/ocr/setup.go
package ocr

import (
	"megapdf-api/internal/services/ocr"
	"megapdf-api/internal/services/payment"
	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
)

// RegisterOCRHandlers registers all OCR handlers
func RegisterOCRHandlers(
	router *gin.Engine,
	ocrService *ocr.Service,
	billingService *payment.BillingService,
	storageManager storage.StorageManager,
) {
	// Get directory paths from storage manager
	uploadDir := storageManager.GetUploadDir()
	ocrDir := storageManager.GetProcessedDir("ocr")
	tempDir := storageManager.GetTempDir()

	// Create OCR router group
	ocrGroup := router.Group("/api/ocr")

	// Initialize handlers
	ocrHandler := NewOCRHandler(ocrService, billingService, uploadDir, ocrDir)
	extractHandler := NewExtractHandler(ocrService, billingService, uploadDir, ocrDir, tempDir)

	// Register routes
	ocrHandler.Register(ocrGroup)
	extractHandler.Register(ocrGroup)
}
