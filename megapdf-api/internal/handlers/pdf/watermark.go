// internal/handlers/pdf/watermark.go
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

// WatermarkHandler handles PDF watermarking operations
type WatermarkHandler struct {
	pdfService     *pdf.WatermarkService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewWatermarkHandler creates a new watermark handler
func NewWatermarkHandler(pdfService *pdf.WatermarkService, billingService *payment.BillingService, uploadDir, outputDir string) *WatermarkHandler {
	return &WatermarkHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *WatermarkHandler) Register(router *gin.RouterGroup) {
	watermarkGroup := router.Group("/watermark")
	watermarkGroup.Use(middleware.APIKey())
	watermarkGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	watermarkGroup.POST("", h.WatermarkPDF)
}

// WatermarkPDF handles adding a watermark to a PDF
func (h *WatermarkHandler) WatermarkPDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "watermark"
	
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
			"error":   "Only PDF files can be watermarked",
			"success": false,
		})
		return
	}

	// Get watermark text and options
	text := c.PostForm("text")
	if text == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Watermark text is required",
			"success": false,
		})
		return
	}
	
	// Get watermark options with defaults
	fontSize, _ := strconv.Atoi(c.DefaultPostForm("fontSize", "36"))
	opacity, _ := strconv.ParseFloat(c.DefaultPostForm("opacity", "0.3"), 64)
	rotation, _ := strconv.Atoi(c.DefaultPostForm("rotation", "45"))
	color := c.DefaultPostForm("color", "#888888")
	position := c.DefaultPostForm("position", "center")
	pages := c.PostForm("pages") // Leave empty for all pages

	// Set watermark image
	var watermarkImagePath string
	watermarkImage, _, err := c.Request.FormFile("image")
	if err == nil {
		// A watermark image was provided
		defer watermarkImage.Close()
		
		// Save image to temp file
		watermarkImagePath = filepath.Join(h.uploadDir, fmt.Sprintf("%s-watermark.png", uuid.New().String()))
		imageFile, err := os.Create(watermarkImagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save watermark image",
				"success": false,
			})
			return
		}
		defer imageFile.Close()
		
		// Copy the image content
		if _, err := io.Copy(imageFile, watermarkImage); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save watermark image",
				"success": false,
			})
			return
		}
		
		imageFile.Close()
	}

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-watermarked.pdf", sessionID))

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

	// Configure watermark options
	watermarkOptions := pdf.WatermarkOptions{
		Text:           text,
		FontSize:       fontSize,
		Opacity:        opacity,
		Rotation:       rotation,
		Color:          color,
		Position:       position,
		Pages:          pages,
		WatermarkImage: watermarkImagePath,
	}

	// Apply watermark
	result, err := h.pdfService.WatermarkPDF(c, inputPath, outputPath, watermarkOptions)

	// Clean up input file and watermark image if used
	os.Remove(inputPath)
	if watermarkImagePath != "" {
		os.Remove(watermarkImagePath)
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to watermark PDF: %v", err),
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
			"message":      "PDF successfully watermarked",
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
		"message":      "PDF successfully watermarked",
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
	})
}