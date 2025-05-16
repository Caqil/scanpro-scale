// internal/handlers/pdf/pagenumber.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PageNumberHandler handles adding page numbers to PDFs
type PageNumberHandler struct {
	pdfService     *pdf.PageNumberService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewPageNumberHandler creates a new page number handler
func NewPageNumberHandler(pdfService *pdf.PageNumberService, billingService *payment.BillingService, uploadDir, outputDir string) *PageNumberHandler {
	return &PageNumberHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *PageNumberHandler) Register(router *gin.RouterGroup) {
	pageNumberGroup := router.Group("/pagenumber")
	pageNumberGroup.Use(middleware.APIKey())
	pageNumberGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	pageNumberGroup.POST("", h.AddPageNumbers)
}

// AddPageNumbers handles adding page numbers to a PDF
func (h *PageNumberHandler) AddPageNumbers(c *gin.Context) {
	// Get the operation ID from the context
	operation := "pagenumber"
	
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

	// Get options
	position := c.DefaultPostForm("position", "bottom-center")
	startNumber, _ := strconv.Atoi(c.DefaultPostForm("startNumber", "1"))
	fontSize, _ := strconv.ParseFloat(c.DefaultPostForm("fontSize", "12"), 64)
	color := c.DefaultPostForm("color", "#000000")
	prefix := c.DefaultPostForm("prefix", "")
	suffix := c.DefaultPostForm("suffix", "")
	fontName := c.DefaultPostForm("fontName", "Helvetica")
	skipFirstPage := c.DefaultPostForm("skipFirstPage", "false") == "true"
	marginX, _ := strconv.ParseFloat(c.DefaultPostForm("marginX", "30"), 64)
	marginY, _ := strconv.ParseFloat(c.DefaultPostForm("marginY", "30"), 64)
	
	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-numbered.pdf", sessionID))

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

	// Configure page number options
	pageNumberOptions := pdf.PageNumberOptions{
		Position:     position,
		StartNumber:  startNumber,
		FontSize:     fontSize,
		Color:        color,
		Prefix:       prefix,
		Suffix:       suffix,
		FontName:     fontName,
		SkipFirstPage: skipFirstPage,
		MarginX:      marginX,
		MarginY:      marginY,
	}

	// Add page numbers
	result, err := h.pdfService.AddPageNumbers(c, inputPath, outputPath, pageNumberOptions)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to add page numbers: %v", err),
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
			"message":      "Page numbers added successfully",
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"pages":        result.PageCount,
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
		"message":      "Page numbers added successfully",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
		"pages":        result.PageCount,
	})
}