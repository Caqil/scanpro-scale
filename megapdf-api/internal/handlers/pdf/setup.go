// internal/handlers/pdf/setup.go
package pdf

import (
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"
	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
)

// RegisterPDFHandlers registers all PDF handlers
func RegisterPDFHandlers(
	router *gin.Engine,
	pdfServices *pdf.Services,
	billingService *payment.BillingService,
	storageManager storage.StorageManager,
) {
	// Get directory paths from storage manager
	uploadDir := storageManager.GetUploadDir()
	
	// Create PDF router group
	pdfGroup := router.Group("/api/pdf")

	// Initialize handlers
	convertHandler := NewConvertHandler(pdfServices.Convert, billingService, uploadDir, storageManager.GetProcessedDir("conversions"))
	compressHandler := NewCompressHandler(pdfServices.Compress, billingService, uploadDir, storageManager.GetProcessedDir("compressions"))
	mergeHandler := NewMergeHandler(pdfServices.Merge, billingService, uploadDir, storageManager.GetProcessedDir("merges"))
	splitHandler := NewSplitHandler(pdfServices.Split, billingService, uploadDir, storageManager.GetProcessedDir("splits"))
	watermarkHandler := NewWatermarkHandler(pdfServices.Watermark, billingService, uploadDir, storageManager.GetProcessedDir("watermarked"))
	protectHandler := NewProtectHandler(pdfServices.Protect, billingService, uploadDir, storageManager.GetProcessedDir("protected"))
	unlockHandler := NewUnlockHandler(pdfServices.Unlock, billingService, uploadDir, storageManager.GetProcessedDir("unlocked"))
	rotateHandler := NewRotateHandler(pdfServices.Rotate, billingService, uploadDir, storageManager.GetProcessedDir("rotations"))
	removeHandler := NewRemoveHandler(pdfServices.Remove, billingService, uploadDir, storageManager.GetProcessedDir("processed"))
	signHandler := NewSignHandler(pdfServices.Sign, billingService, uploadDir, storageManager.GetProcessedDir("signatures"))
	repairHandler := NewRepairHandler(pdfServices.Repair, billingService, uploadDir, storageManager.GetProcessedDir("repaired"))
	infoHandler := NewInfoHandler(pdfServices.Info, uploadDir)
	pagenumberHandler := NewPageNumberHandler(pdfServices.PageNumber, billingService, uploadDir, storageManager.GetProcessedDir("pagenumbers"))

	// Register routes
	convertHandler.Register(pdfGroup)
	compressHandler.Register(pdfGroup)
	mergeHandler.Register(pdfGroup)
	splitHandler.Register(pdfGroup)
	watermarkHandler.Register(pdfGroup)
	protectHandler.Register(pdfGroup)
	unlockHandler.Register(pdfGroup)
	rotateHandler.Register(pdfGroup)
	removeHandler.Register(pdfGroup)
	signHandler.Register(pdfGroup)
	repairHandler.Register(pdfGroup)
	infoHandler.Register(pdfGroup)
	pagenumberHandler.Register(pdfGroup)
}