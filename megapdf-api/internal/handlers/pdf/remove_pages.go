// internal/handlers/pdf/remove_pages.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RemoveHandler handles PDF page removal operations
type RemoveHandler struct {
	pdfService     *pdf.RemoveService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewRemoveHandler creates a new remove handler
func NewRemoveHandler(pdfService *pdf.RemoveService, billingService *payment.BillingService, uploadDir, outputDir string) *RemoveHandler {
	return &RemoveHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *RemoveHandler) Register(router *gin.RouterGroup) {
	removeGroup := router.Group("/remove")
	removeGroup.Use(middleware.APIKey())
	removeGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	removeGroup.POST("", h.RemovePages)
}

// RemovePages handles removing pages from a PDF
func (h *RemoveHandler) RemovePages(c *gin.Context) {
	// Get the operation ID from the context
	operation := "remove"
	
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

	// Get pages to remove
	pagesToRemove := c.PostForm("pages")
	if pagesToRemove == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No pages specified for removal",
			"success": false,
		})
		return
	}
	
	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-processed.pdf", sessionID))

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

	// Parse page ranges (e.g., "1,3,5-7")
	var pageRanges []string
	for _, part := range strings.Split(pagesToRemove, ",") {
		pageRanges = append(pageRanges, strings.TrimSpace(part))
	}

	// Remove pages
	result, err := h.pdfService.RemovePages(c, inputPath, outputPath, pageRanges)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to remove pages: %v", err),
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
			"message":      fmt.Sprintf("Successfully removed %d pages from the PDF", result.PagesRemoved),
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"pagesRemoved": result.PagesRemoved,
			"originalPages": result.OriginalPages,
			"resultingPages": result.ResultingPages,
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
		"message":      fmt.Sprintf("Successfully removed %d pages from the PDF", result.PagesRemoved),
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
		"pagesRemoved": result.PagesRemoved,
		"originalPages": result.OriginalPages,
		"resultingPages": result.ResultingPages,
	})
}