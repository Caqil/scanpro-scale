// internal/handlers/pdf/repair.go
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

// RepairHandler handles PDF repair operations
type RepairHandler struct {
	pdfService     *pdf.RepairService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewRepairHandler creates a new repair handler
func NewRepairHandler(pdfService *pdf.RepairService, billingService *payment.BillingService, uploadDir, outputDir string) *RepairHandler {
	return &RepairHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *RepairHandler) Register(router *gin.RouterGroup) {
	repairGroup := router.Group("/repair")
	repairGroup.Use(middleware.APIKey())
	repairGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	repairGroup.POST("", h.RepairPDF)
}

// RepairPDF handles repairing corrupted PDFs
func (h *RepairHandler) RepairPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "repair"
	
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

	// Verify it's a PDF (by extension, could still be corrupted)
	if filepath.Ext(header.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be repaired",
			"success": false,
		})
		return
	}

	// Get repair options
	recoveryLevel := c.DefaultPostForm("recoveryLevel", "standard")
	forceRecovery := c.DefaultPostForm("forceRecovery", "false") == "true"
	
	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-repaired.pdf", sessionID))

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

	// Configure repair options
	repairOptions := pdf.RepairOptions{
		RecoveryLevel: recoveryLevel,
		ForceRecovery: forceRecovery,
	}

	// Repair the PDF
	result, err := h.pdfService.RepairPDF(c, inputPath, outputPath, repairOptions)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to repair PDF: %v", err),
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
			"message":      "PDF successfully repaired",
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"issuesFixed":  result.IssuesFixed,
			"severity":     result.Severity,
			"recoverable":  result.Recoverable,
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
		"message":      "PDF successfully repaired",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
		"issuesFixed":  result.IssuesFixed,
		"severity":     result.Severity,
		"recoverable":  result.Recoverable,
	})
}