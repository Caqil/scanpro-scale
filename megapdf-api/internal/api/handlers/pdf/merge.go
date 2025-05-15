// internal/api/handlers/pdf/merge.go
package pdf

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/services/pdf"
	"megapdf-api/internal/utils/fileutils"
	"megapdf-api/internal/utils/response"
	"megapdf-api/internal/utils/validation"
	"megapdf-api/pkg/constants"
)

// Merge handles the PDF merge operation
func Merge(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "merge"
	canPerform, err := validateOperation(c, userID.(string), operationType)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to validate operation: "+err.Error())
		return
	}
	if !canPerform {
		response.Error(c, http.StatusPaymentRequired, "Insufficient balance or free operations")
		return
	}

	// Parse multipart form with max size limit
	if err := c.Request.ParseMultipartForm(constants.MaxFileSize * 10); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to parse form: "+err.Error())
		return
	}

	// Get all files from form
	form := c.Request.MultipartForm
	files := form.File["files"]
	
	if len(files) == 0 {
		response.Error(c, http.StatusBadRequest, "No PDF files provided")
		return
	}
	
	if len(files) < 2 {
		response.Error(c, http.StatusBadRequest, "At least two PDF files are required for merging")
		return
	}

	// Parse file order if provided
	var fileOrder []int
	orderStr := c.PostForm("order")
	if orderStr != "" {
		err := json.Unmarshal([]byte(orderStr), &fileOrder)
		if err != nil || len(fileOrder) != len(files) {
			// Invalid order, use default sequential order
			fileOrder = make([]int, len(files))
			for i := range fileOrder {
				fileOrder[i] = i
			}
		}
	} else {
		// Use default sequential order
		fileOrder = make([]int, len(files))
		for i := range fileOrder {
			fileOrder[i] = i
		}
	}

	// Generate unique ID for this operation
	uniqueID := uuid.New().String()
	
	// Create input paths array for storing saved files
	inputPaths := make([]string, len(files))
	
	// Write each file to disk
	for i, file := range files {
		// Verify it's a PDF
		if !strings.HasSuffix(strings.ToLower(file.Filename), ".pdf") {
			// Clean up already saved files
			for j := 0; j < i; j++ {
				os.Remove(inputPaths[j])
			}
			response.Error(c, http.StatusBadRequest, fmt.Sprintf("File '%s' is not a PDF", file.Filename))
			return
		}
		
		// Create path for this file
		inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input-%d.pdf", uniqueID, i))
		inputPaths[i] = inputPath
		
		// Save file
		if err := c.SaveUploadedFile(file, inputPath); err != nil {
			// Clean up already saved files
			for j := 0; j < i; j++ {
				os.Remove(inputPaths[j])
			}
			response.Error(c, http.StatusInternalServerError, "Failed to save uploaded file: "+err.Error())
			return
		}
	}
	
	// Ensure output directory exists
	if err := fileutils.EnsureDirectory(constants.MergeDir); err != nil {
		// Clean up input files
		for _, path := range inputPaths {
			os.Remove(path)
		}
		response.Error(c, http.StatusInternalServerError, "Failed to create output directory: "+err.Error())
		return
	}
	
	// Create output path
	outputFileName := fmt.Sprintf("%s-merged.pdf", uniqueID)
	outputPath := filepath.Join(constants.MergeDir, outputFileName)
	
	// Order input paths according to fileOrder
	orderedInputPaths := make([]string, len(inputPaths))
	for i, idx := range fileOrder {
		if idx >= 0 && idx < len(inputPaths) {
			orderedInputPaths[i] = inputPaths[idx]
		} else {
			orderedInputPaths[i] = inputPaths[i] // Fallback to original order
		}
	}
	
	// Perform merge
	mergeService := pdf.NewMergeService()
	err = mergeService.Merge(orderedInputPaths, outputPath)
	if err != nil {
		// Clean up input files
		for _, path := range inputPaths {
			os.Remove(path)
		}
		response.Error(c, http.StatusInternalServerError, "Merge failed: "+err.Error())
		return
	}
	
	// Calculate total input size and merged size
	var totalInputSize int64
	for _, file := range files {
		totalInputSize += file.Size
	}
	
	mergedStats, err := os.Stat(outputPath)
	mergedSize := int64(0)
	if err == nil {
		mergedSize = mergedStats.Size()
	}
	
	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}
	
	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=merges&filename=%s", outputFileName)
	resp := gin.H{
		"success":        true,
		"message":        "PDF merge successful",
		"fileUrl":        fileURL,
		"filename":       outputFileName,
		"mergedSize":     mergedSize,
		"totalInputSize": totalInputSize,
		"fileCount":      len(files),
	}
	
	// Add billing info if available
	billingInfo, err := getBillingInfo(userID.(string), operationType)
	if err == nil {
		resp["billing"] = billingInfo
	}
	
	// Clean up input files in the background after a delay
	go func() {
		time.Sleep(5 * time.Minute)
		for _, path := range inputPaths {
			os.Remove(path)
		}
	}()
	
	response.Success(c, resp)
}