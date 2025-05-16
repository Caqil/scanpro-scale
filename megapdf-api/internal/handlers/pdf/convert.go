// internal/handlers/pdf/convert.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/payment"
	"megapdf-api/internal/services/pdf"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ConvertHandler handles PDF conversion operations
type ConvertHandler struct {
	pdfService     *pdf.ConvertService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewConvertHandler creates a new conversion handler
func NewConvertHandler(pdfService *pdf.ConvertService, billingService *payment.BillingService, uploadDir, outputDir string) *ConvertHandler {
	return &ConvertHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *ConvertHandler) Register(router *gin.RouterGroup) {
	convertGroup := router.Group("/convert")
	convertGroup.Use(middleware.APIKey())
	convertGroup.Use(middleware.CheckOperationEligibility(h.billingService))

	convertGroup.POST("", h.ConvertPDF)
}

// ConvertPDF handles the conversion of a PDF to other formats
func (h *ConvertHandler) ConvertPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "convert"

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
			"error":   "No file provided",
			"success": false,
		})
		return
	}
	defer file.Close()

	// Get target format from form
	format := c.PostForm("format")
	if format == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Target format is required",
			"success": false,
		})
		return
	}

	// Normalize and validate format
	format = strings.ToLower(format)
	supportedFormats := map[string]bool{
		"jpg": true, "jpeg": true, "png": true, "tiff": true,
		"docx": true, "xlsx": true, "pptx": true, "txt": true,
		"html": true, "md": true, "epub": true, "odt": true,
	}

	if !supportedFormats[format] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Unsupported target format",
			"success": false,
		})
		return
	}

	// Verify file is a PDF if converting from PDF
	fileExt := strings.ToLower(filepath.Ext(header.Filename))
	isPDF := fileExt == ".pdf"

	if !isPDF {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be converted",
			"success": false,
		})
		return
	}

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input%s", sessionID, fileExt))

	// Determine output extension based on format
	var outputExt string
	switch format {
	case "jpg", "jpeg":
		outputExt = ".jpg"
	case "md":
		outputExt = ".md"
	default:
		outputExt = "." + format
	}

	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-converted%s", sessionID, outputExt))

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

	// Get additional options
	dpi := c.DefaultPostForm("dpi", "300")
	quality := c.DefaultPostForm("quality", "high")

	// Configure conversion options
	conversionOptions := pdf.ConversionOptions{
		Format:  format,
		DPI:     dpi,
		Quality: quality,
	}

	// Perform conversion
	result, err := h.pdfService.ConvertPDF(c, inputPath, outputPath, conversionOptions)

	// Clean up input file
	os.Remove(inputPath)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Conversion failed: %v", err),
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
			"message":      fmt.Sprintf("Conversion to %s successful", strings.ToUpper(format)),
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"format":       format,
			"pages":        result.Pages,
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
		"message":      fmt.Sprintf("Conversion to %s successful", strings.ToUpper(format)),
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
		"format":       format,
		"pages":        result.Pages,
	})
}
