// internal/handlers/ocr/extract.go
package ocr

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/services/ocr"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ExtractHandler handles OCR text extraction operations
type ExtractHandler struct {
	ocrService     *ocr.Service
	billingService *payment.BillingService
	uploadDir      string
	outputDir      string
	tempDir        string
}

// NewExtractHandler creates a new text extraction handler
func NewExtractHandler(ocrService *ocr.Service, billingService *payment.BillingService, uploadDir, outputDir, tempDir string) *ExtractHandler {
	return &ExtractHandler{
		ocrService:     ocrService,
		billingService: billingService,
		uploadDir:      uploadDir,
		outputDir:      outputDir,
		tempDir:        tempDir,
	}
}

// Register registers the routes for this handler
func (h *ExtractHandler) Register(router *gin.RouterGroup) {
	extractGroup := router.Group("/extract")
	extractGroup.Use(middleware.APIKey())
	extractGroup.Use(middleware.CheckOperationEligibility(h.billingService))
	
	extractGroup.POST("", h.ExtractText)
}

// ExtractText handles text extraction from a PDF using OCR
func (h *ExtractHandler) ExtractText(c *gin.Context) {
	// Get the operation ID from the context
	operation := "ocr"
	
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
			"error":   "Only PDF files can be processed for OCR",
			"success": false,
		})
		return
	}

	// Get options from the form
	language := c.PostForm("language")
	if language == "" {
		language = "eng" // Default language
	}
	
	// Get page range options
	pageRange := c.PostForm("pageRange")
	pages := c.PostForm("pages")
	preserveLayout := c.PostForm("preserveLayout") == "true"

	// Create a unique session ID
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-input.pdf", sessionID))
	outputTextPath := filepath.Join(h.outputDir, fmt.Sprintf("%s-text.txt", sessionID))
	tempSessionDir := filepath.Join(h.tempDir, sessionID)

	// Create temp directory for this session
	if err := os.MkdirAll(tempSessionDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create temporary directory",
			"success": false,
		})
		return
	}
	defer os.RemoveAll(tempSessionDir) // Clean up temp dir when done

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

	// Get total page count from the PDF
	totalPages, err := h.ocrService.GetPDFPageCount(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to read PDF information",
			"success": false,
		})
		os.Remove(inputPath) // Clean up
		return
	}

	// Parse page range
	var pagesToProcess []int
	
	if pageRange == "specific" && pages != "" {
		// Parse specific pages (e.g., "1,3,5-7")
		pagesToProcess, err = parsePageRanges(pages, totalPages)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   fmt.Sprintf("Invalid page range: %v", err),
				"success": false,
			})
			os.Remove(inputPath) // Clean up
			return
		}
	} else {
		// Process all pages
		pagesToProcess = make([]int, totalPages)
		for i := 0; i < totalPages; i++ {
			pagesToProcess[i] = i + 1 // 1-based page numbers
		}
	}

	// Limit number of pages for non-premium users
	const maxPages = 20 // Lower limit for testing
	if len(pagesToProcess) > maxPages {
		pagesToProcess = pagesToProcess[:maxPages]
	}

	if len(pagesToProcess) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No valid pages to process",
			"success": false,
		})
		os.Remove(inputPath) // Clean up
		return
	}

	// Extract text from the PDF
	extractResult, err := h.ocrService.ExtractText(c, inputPath, outputTextPath, tempSessionDir, ocr.TextExtractionOptions{
		Language:       language,
		Pages:          pagesToProcess,
		PreserveLayout: preserveLayout,
	})

	// Clean up input file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Text extraction failed: %v", err),
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
			"message":        "OCR text extraction completed successfully",
			"text":           extractResult.Text,
			"fileUrl":        fmt.Sprintf("/ocr/%s", filepath.Base(outputTextPath)),
			"filename":       filepath.Base(outputTextPath),
			"originalName":   header.Filename,
			"pagesProcessed": len(pagesToProcess),
			"totalPages":     totalPages,
			"wordCount":      extractResult.WordCount,
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
		"message":        "OCR text extraction completed successfully",
		"text":           extractResult.Text,
		"fileUrl":        fmt.Sprintf("/ocr/%s", filepath.Base(outputTextPath)),
		"filename":       filepath.Base(outputTextPath),
		"originalName":   header.Filename,
		"pagesProcessed": len(pagesToProcess),
		"totalPages":     totalPages,
		"wordCount":      extractResult.WordCount,
	})
}

// parsePageRanges parses a page range string (e.g., "1,3,5-7") into a slice of page numbers
func parsePageRanges(pagesString string, totalPages int) ([]int, error) {
	pages := make([]int, 0)
	
	// Split by commas
	parts := strings.Split(pagesString, ",")
	
	for _, part := range parts {
		part = strings.TrimSpace(part)
		
		// Check if it's a range (contains '-')
		if strings.Contains(part, "-") {
			rangeParts := strings.Split(part, "-")
			if len(rangeParts) != 2 {
				return nil, fmt.Errorf("invalid range format: %s", part)
			}
			
			start, err := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
			if err != nil {
				return nil, fmt.Errorf("invalid start number in range: %s", rangeParts[0])
			}
			
			end, err := strconv.Atoi(strings.TrimSpace(rangeParts[1]))
			if err != nil {
				return nil, fmt.Errorf("invalid end number in range: %s", rangeParts[1])
			}
			
			if start > end {
				return nil, fmt.Errorf("start number cannot be greater than end number: %d > %d", start, end)
			}
			
			// Add all pages in the range
			for i := start; i <= min(end, totalPages); i++ {
				if i > 0 && !contains(pages, i) {
					pages = append(pages, i)
				}
			}
		} else {
			// Single page number
			pageNum, err := strconv.Atoi(part)
			if err != nil {
				return nil, fmt.Errorf("invalid page number: %s", part)
			}
			
			if pageNum > 0 && pageNum <= totalPages && !contains(pages, pageNum) {
				pages = append(pages, pageNum)
			}
		}
	}
	
	// Sort pages in ascending order
	sort.Ints(pages)
	
	return pages, nil
}

// contains checks if a slice contains a value
func contains(slice []int, val int) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

// min returns the smaller of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}