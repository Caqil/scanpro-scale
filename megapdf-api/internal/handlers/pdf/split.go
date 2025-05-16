// internal/handlers/pdf/split.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SplitHandler handles PDF splitting operations
type SplitHandler struct {
	pdfService     *pdf.SplitService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewSplitHandler creates a new split handler
func NewSplitHandler(pdfService *pdf.SplitService, billingService *payment.BillingService, uploadDir, outputDir string) *SplitHandler {
	return &SplitHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *SplitHandler) Register(router *gin.RouterGroup) {
	splitGroup := router.Group("/split")
	splitGroup.Use(middleware.APIKey())
	splitGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	splitGroup.POST("", h.SplitPDF)
}

// SplitPDF handles splitting a PDF into multiple files
func (h *SplitHandler) SplitPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "split"
	
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
			"error":   "Only PDF files can be split",
			"success": false,
		})
		return
	}

	// Get split mode and parameters
	splitMode := c.DefaultPostForm("mode", "pages")
	
	var splitOptions pdf.SplitOptions
	
	switch splitMode {
	case "pages":
		// Split into individual pages
		splitOptions.Mode = "pages"
		
	case "ranges":
		// Split into ranges of pages
		ranges := c.PostForm("ranges")
		if ranges == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Page ranges must be specified for range mode",
				"success": false,
			})
			return
		}
		
		splitOptions.Mode = "ranges"
		splitOptions.Ranges = strings.Split(ranges, ",")
		
	case "fixed":
		// Split into fixed-size chunks
		chunkSizeStr := c.PostForm("chunkSize")
		if chunkSizeStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Chunk size must be specified for fixed mode",
				"success": false,
			})
			return
		}
		
		chunkSize, err := strconv.Atoi(chunkSizeStr)
		if err != nil || chunkSize <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid chunk size, must be a positive integer",
				"success": false,
			})
			return
		}
		
		splitOptions.Mode = "fixed"
		splitOptions.ChunkSize = chunkSize
		
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid split mode. Supported modes: pages, ranges, fixed",
			"success": false,
		})
		return
	}

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputDir := filepath.Join(h.outputDir, sessionID)
	
	// Create output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create output directory",
			"success": false,
		})
		return
	}

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

	// Split the PDF
	result, err := h.pdfService.SplitPDF(c, inputPath, outputDir, splitOptions)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to split PDF: %v", err),
			"success": false,
		})
		return
	}

	// Prepare file URLs for all output files
	fileURLs := make([]string, len(result.OutputFiles))
	for i, filePath := range result.OutputFiles {
		fileURLs[i] = fmt.Sprintf("/api/file?folder=splits&filename=%s", filepath.Base(filePath))
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
			"message":      fmt.Sprintf("PDF successfully split into %d files", len(result.OutputFiles)),
			"fileUrls":     fileURLs,
			"fileCount":    len(result.OutputFiles),
			"originalName": header.Filename,
			"pages":        result.TotalPages,
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
		"message":      fmt.Sprintf("PDF successfully split into %d files", len(result.OutputFiles)),
		"fileUrls":     fileURLs,
		"fileCount":    len(result.OutputFiles),
		"originalName": header.Filename,
		"pages":        result.TotalPages,
	})
}