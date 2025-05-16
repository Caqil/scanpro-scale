package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/models"
	"megapdf-api/internal/services/payment"
	"megapdf-api/internal/services/pdf"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CompressHandler handles PDF compression requests
type CompressHandler struct {
	compressService *pdf.CompressService
	billingService  *payment.BillingService
	uploadDir       string
}

// NewCompressHandler creates a new compression handler
func NewCompressHandler(compressService *pdf.CompressService, billingService *payment.BillingService, uploadDir string) *CompressHandler {
	return &CompressHandler{
		compressService: compressService,
		billingService:  billingService,
		uploadDir:       uploadDir,
	}
}

// Register registers the routes for this handler
func (h *CompressHandler) Register(router *gin.RouterGroup) {
	compressGroup := router.Group("/compress")
	compressGroup.Use(middleware.APIKey())
	compressGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	compressGroup.POST("", h.CompressPDF)
}

// CompressPDF handles the PDF compression endpoint
func (h *CompressHandler) CompressPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "compress"
	
	// Create a multipart form parser
	err := c.Request.ParseMultipartForm(32 << 20) // 32 MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get the uploaded file
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
			"error":   "Only PDF files can be compressed",
			"success": false,
		})
		return
	}

	// Get compression quality option
	quality := c.PostForm("quality")
	if quality == "" {
		quality = "medium" // Default quality
	}
	
	// Validate quality option
	if quality != "low" && quality != "medium" && quality != "high" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid compression quality. Use low, medium, or high.",
			"success": false,
		})
		return
	}

	// Create a temporary file to save the uploaded PDF
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	
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
	
	// Copy the uploaded file to the input file
	_, err = io.Copy(inputFile, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	
	// Ensure input file is closed and synced to disk
	inputFile.Close()

	// Perform compression
	result, err := h.compressService.CompressPDF(c, inputPath, pdf.CompressionOptions{
		Quality: quality,
	})
	
	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Compression failed: %v", err),
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
			"success":          true,
			"message":          fmt.Sprintf("PDF optimization successful with %.2f%% reduction", result.CompressionRatio),
			"fileUrl":          result.FileURL,
			"filename":         filepath.Base(result.FilePath),
			"originalName":     header.Filename,
			"originalSize":     result.OriginalSize,
			"compressedSize":   result.CompressedSize,
			"compressionRatio": fmt.Sprintf("%.2f%%", result.CompressionRatio),
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
		"success":          true,
		"message":          fmt.Sprintf("PDF optimization successful with %.2f%% reduction", result.CompressionRatio),
		"fileUrl":          result.FileURL,
		"filename":         filepath.Base(result.FilePath),
		"originalName":     header.Filename,
		"originalSize":     result.OriginalSize,
		"compressedSize":   result.CompressedSize,
		"compressionRatio": fmt.Sprintf("%.2f%%", result.CompressionRatio),
	})
}