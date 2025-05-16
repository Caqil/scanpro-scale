// internal/handlers/pdf/unlock.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UnlockHandler handles PDF password removal operations
type UnlockHandler struct {
	pdfService     *pdf.UnlockService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewUnlockHandler creates a new unlock handler
func NewUnlockHandler(pdfService *pdf.UnlockService, billingService *payment.BillingService, uploadDir, outputDir string) *UnlockHandler {
	return &UnlockHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *UnlockHandler) Register(router *gin.RouterGroup) {
	unlockGroup := router.Group("/unlock")
	unlockGroup.Use(middleware.APIKey())
	unlockGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	unlockGroup.POST("", h.UnlockPDF)
}

// UnlockPDF handles removing password protection from a PDF
func (h *UnlockHandler) UnlockPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "unlock"
	
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
			"error":   "Only PDF files can be unlocked",
			"success": false,
		})
		return
	}

	// Get password from form
	password := c.PostForm("password")
	
	// Password is required
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password is required to unlock the PDF",
			"success": false,
		})
		return
	}

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-unlocked.pdf", sessionID))

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

	// Unlock the PDF
	result, err := h.pdfService.UnlockPDF(c, inputPath, outputPath, password)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   fmt.Sprintf("Failed to unlock PDF: %v", err),
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
			"success":      true,
			"message":      "PDF successfully unlocked",
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
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
		"success":      true,
		"message":      "PDF successfully unlocked",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
	})
}