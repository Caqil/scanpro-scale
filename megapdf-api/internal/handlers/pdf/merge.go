package pdf

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/payment"
	"megapdf-api/internal/services/pdf"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// MergeHandler handles PDF merge requests
type MergeHandler struct {
	mergeService   *pdf.MergeService
	billingService *payment.BillingService
	uploadDir      string
}

// NewMergeHandler creates a new merge handler
func NewMergeHandler(mergeService *pdf.MergeService, billingService *payment.BillingService, uploadDir string) *MergeHandler {
	return &MergeHandler{
		mergeService:   mergeService,
		billingService: billingService,
		uploadDir:      uploadDir,
	}
}

// Register registers the routes for this handler
func (h *MergeHandler) Register(router *gin.RouterGroup) {
	mergeGroup := router.Group("/merge")
	mergeGroup.Use(middleware.APIKey())
	mergeGroup.Use(middleware.CheckOperationEligibility(h.billingService))

	mergeGroup.POST("", h.MergePDFs)
}

// MergePDFs handles the PDF merge endpoint
func (h *MergeHandler) MergePDFs(c *gin.Context) {
	// Get the operation ID from the context
	operation := "merge"

	// Create a multipart form parser with a memory limit
	if err := c.Request.ParseMultipartForm(64 << 20); err != nil { // 64 MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get the uploaded files
	form := c.Request.MultipartForm
	files := form.File["files"]

	if len(files) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "At least two PDF files are required for merging",
			"success": false,
		})
		return
	}

	// Get order information if provided
	var order []int
	orderParam := c.PostForm("order")
	if orderParam != "" {
		if err := json.Unmarshal([]byte(orderParam), &order); err != nil || len(order) != len(files) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid order parameter",
				"success": false,
			})
			return
		}

		// Validate order indices
		for _, idx := range order {
			if idx < 0 || idx >= len(files) {
				c.JSON(http.StatusBadRequest, gin.H{
					"error":   fmt.Sprintf("Invalid order index: %d", idx),
					"success": false,
				})
				return
			}
		}
	} else {
		// Use sequential order
		order = make([]int, len(files))
		for i := range files {
			order[i] = i
		}
	}

	// Verify all files are PDFs
	for _, file := range files {
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   fmt.Sprintf("File '%s' is not a PDF", file.Filename),
				"success": false,
			})
			return
		}
	}

	// Save all files to disk
	inputPaths := make([]string, len(files))
	sessionID := uuid.New().String()

	for i, file := range files {
		// Create a temporary file
		inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input-%d.pdf", sessionID, i))
		inputPaths[i] = inputPath

		dst, err := os.Create(inputPath)
		if err != nil {
			// Clean up any files already created
			for j := 0; j < i; j++ {
				os.Remove(inputPaths[j])
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save uploaded file",
				"success": false,
			})
			return
		}

		// Open the uploaded file
		src, err := file.Open()
		if err != nil {
			dst.Close()
			// Clean up
			for j := 0; j <= i; j++ {
				os.Remove(inputPaths[j])
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to process uploaded file",
				"success": false,
			})
			return
		}

		// Copy the file content
		if _, err = io.Copy(dst, src); err != nil {
			dst.Close()
			src.Close()
			// Clean up
			for j := 0; j <= i; j++ {
				os.Remove(inputPaths[j])
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save uploaded file",
				"success": false,
			})
			return
		}

		dst.Close()
		src.Close()
	}

	// Perform merge operation
	result, err := h.mergeService.MergePDFs(c, inputPaths, order)

	// Clean up input files regardless of result
	for _, path := range inputPaths {
		os.Remove(path)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Merge failed: %v", err),
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
			"message":        "PDF merge successful",
			"fileUrl":        result.FileURL,
			"filename":       filepath.Base(result.FilePath),
			"mergedSize":     result.MergedSize,
			"totalInputSize": result.TotalInputSize,
			"fileCount":      result.FileCount,
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
		"message":        "PDF merge successful",
		"fileUrl":        result.FileURL,
		"filename":       filepath.Base(result.FilePath),
		"mergedSize":     result.MergedSize,
		"totalInputSize": result.TotalInputSize,
		"fileCount":      result.FileCount,
	})
}
