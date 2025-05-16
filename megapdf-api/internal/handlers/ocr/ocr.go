// internal/handlers/ocr/ocr.go
package ocr

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/ocr"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// OCRHandler handles OCR operations
type OCRHandler struct {
	ocrService     *ocr.Service
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewOCRHandler creates a new OCR handler
func NewOCRHandler(ocrService *ocr.Service, billingService *payment.BillingService, uploadDir, outputDir string) *OCRHandler {
	return &OCRHandler{
		ocrService:     ocrService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *OCRHandler) Register(router *gin.RouterGroup) {
	ocrGroup := router.Group("")
	ocrGroup.Use(middleware.APIKey())
	ocrGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	ocrGroup.POST("", h.ProcessOCR)
}

// ProcessOCR handles the OCR conversion of a PDF
func (h *OCRHandler) ProcessOCR(c *gin.Context) {
	// Get the operation ID from the context
	operation := "ocr"
	
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32 MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No PDF file provided",
			"success": false,
		})
		return
	}
	defer file.Close()

	// Verify it's a PDF
	if filepath.Ext(header.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be processed",
			"success": false,
		})
		return
	}

	// Get options from the form
	language := c.PostForm("language")
	if language == "" {
		language = "eng" // Default language
	}
	
	enhanceScanned := c.PostForm("enhanceScanned") == "true"
	preserveLayout := c.PostForm("preserveLayout") == "true"

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-searchable.pdf", sessionID))

	// Save the uploaded file
	inputFile, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	defer inputFile.Close()
	
	// Copy the uploaded file content
	if _, err := io.Copy(inputFile, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	
	// Close input file to ensure it's flushed to disk
	inputFile.Close()

	// Process the PDF with OCR
	result, err := h.ocrService.ProcessPDF(c, inputPath, outputPath, ocr.OCROptions{
		Language:        language,
		EnhanceScanned:  enhanceScanned,
		PreserveLayout:  preserveLayout,
	})

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("OCR processing failed: %v", err),
			"success": false,
		})
		return
	}

	// Charge for the operation
	userID, exists := c.Get("userID")
	if exists && userID != nil {
		opResult, err := h.billingService.ProcessOperation(c, userID.(string), operation)
		if err != nil {
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error":   "Failed to process operation charge",
				"success": false,
			})
			return
		}
		
		// Create response with billing details
		c.JSON(http.StatusOK, gin.H{
			"success":        true,
			"message":        "OCR processing completed successfully",
			"searchablePdfUrl": fmt.Sprintf("/api/file?folder=ocr&filename=%s", filepath.Base(outputPath)),
			"processedFile":  header.Filename,
			"language":       language,
			"billing": gin.H{
				"usedFreeOperation":       opResult.UsedFreeOperation,
				"freeOperationsRemaining": opResult.FreeOperationsRemaining,
				"currentBalance":          opResult.CurrentBalance,
				"operationCost":           payment.OperationCost,
			},
		})
		return
	}

	// Response without billing info if no user ID
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "OCR processing completed successfully",
		"searchablePdfUrl": fmt.Sprintf("/api/file?folder=ocr&filename=%s", filepath.Base(outputPath)),
		"processedFile":  header.Filename,
		"language":       language,
	})
}