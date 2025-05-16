// internal/handlers/pdf/rotate.go
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

// RotateHandler handles PDF page rotation operations
type RotateHandler struct {
	pdfService     *pdf.RotateService
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
}

// NewRotateHandler creates a new rotation handler
func NewRotateHandler(pdfService *pdf.RotateService, billingService *payment.BillingService, uploadDir, outputDir string) *RotateHandler {
	return &RotateHandler{
		pdfService:     pdfService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
	}
}

// Register registers the routes for this handler
func (h *RotateHandler) Register(router *gin.RouterGroup) {
	rotateGroup := router.Group("/rotate")
	rotateGroup.Use(middleware.APIKey())
	rotateGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	rotateGroup.POST("", h.RotatePDF)
}

// RotatePDF handles rotating pages in a PDF
func (h *RotateHandler) RotatePDF(c *gin.Context) {
	// Get the operation ID from the context
	operation := "rotate"
	
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
			"error":   "Only PDF files can be rotated",
			"success": false,
		})
		return
	}

	// Get rotation angle and pages
	angle, err := strconv.Atoi(c.DefaultPostForm("angle", "90"))
	if err != nil || (angle != 90 && angle != 180 && angle != 270) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid rotation angle. Must be 90, 180, or 270 degrees",
			"success": false,
		})
		return
	}
	
	// Get page selection
	pageMode := c.DefaultPostForm("pageMode", "all")
	var pages []int
	
	if pageMode == "selected" {
		pagesStr := c.PostForm("pages")
		if pagesStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "No pages specified for selective rotation",
				"success": false,
			})
			return
		}
		
		// Parse page numbers
		for _, pageStr := range strings.Split(pagesStr, ",") {
			pageNum, err := strconv.Atoi(strings.TrimSpace(pageStr))
			if err != nil || pageNum <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{
					"error":   "Invalid page number format",
					"success": false,
				})
				return
			}
			pages = append(pages, pageNum)
		}
	}

	// Create session ID and file paths
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-rotated.pdf", sessionID))

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

	// Configure rotation options
	rotationOptions := pdf.RotationOptions{
		Angle:    angle,
		PageMode: pageMode,
		Pages:    pages,
	}

	// Rotate the PDF
	result, err := h.pdfService.RotatePDF(c, inputPath, outputPath, rotationOptions)

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to rotate PDF: %v", err),
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
			"message":      fmt.Sprintf("PDF pages rotated by %d degrees", angle),
			"fileUrl":      result.FileURL,
			"filename":     filepath.Base(result.FilePath),
			"originalName": header.Filename,
			"rotatedPages": len(result.RotatedPages),
			"totalPages":   result.TotalPages,
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
		"message":      fmt.Sprintf("PDF pages rotated by %d degrees", angle),
		"fileUrl":      result.FileURL,
		"filename":     filepath.Base(result.FilePath),
		"originalName": header.Filename,
		"rotatedPages": len(result.RotatedPages),
		"totalPages":   result.TotalPages,
	})
}