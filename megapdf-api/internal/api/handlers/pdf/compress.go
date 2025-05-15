// internal/api/handlers/pdf/compress.go
package pdf

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
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

// Compress handles the PDF compression operation
func Compress(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "compress"
	canPerform, err := validateOperation(c, userID.(string), operationType)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to validate operation: "+err.Error())
		return
	}
	if !canPerform {
		response.Error(c, http.StatusPaymentRequired, "Insufficient balance or free operations")
		return
	}

	// Parse form
	if err := c.Request.ParseMultipartForm(constants.MaxFileSize); err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to parse form: "+err.Error())
		return
	}

	// Get file
	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to get file: "+err.Error())
		return
	}
	defer file.Close()

	// Validate file
	if err := validation.ValidateFile(fileHeader); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Validate file is PDF
	if !strings.HasSuffix(strings.ToLower(fileHeader.Filename), ".pdf") {
		response.Error(c, http.StatusBadRequest, "Only PDF files can be compressed")
		return
	}

	// Get quality option
	quality := c.PostForm("quality")
	if quality == "" {
		quality = "medium" // Default quality
	}

	if !validation.IsValidCompressionQuality(quality) {
		response.Error(c, http.StatusBadRequest, "Invalid compression quality. Use low, medium, or high.")
		return
	}

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.CompressionDir, fmt.Sprintf("%s-compressed.pdf", uniqueID))

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.CompressionDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Process compression
	compressionService := pdf.NewCompressService()
	err = compressionService.Compress(inputPath, outputPath, quality)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Compression failed: "+err.Error())
		return
	}

	// Get original and compressed file sizes
	originalSize := fileHeader.Size
	compressedStats, err := os.Stat(outputPath)
	if err != nil {
		log.Error().Err(err).Str("path", outputPath).Msg("Failed to get compressed file stats")
		// Continue despite error getting file stats
	}
	compressedSize := compressedStats.Size()

	// Calculate compression ratio
	var compressionRatio string
	if originalSize > compressedSize {
		ratio := float64(originalSize-compressedSize) / float64(originalSize) * 100
		compressionRatio = fmt.Sprintf("%.2f%%", ratio)
	} else {
		compressionRatio = "0%"
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=compressions&filename=%s-compressed.pdf", uniqueID)
	resp := gin.H{
		"success":         true,
		"message":         fmt.Sprintf("PDF optimization %s", compressionRatio != "0%" ? fmt.Sprintf("successful with %s reduction", compressionRatio) : "completed (no size reduction)"),
		"fileUrl":         fileURL,
		"filename":        fmt.Sprintf("%s-compressed.pdf", uniqueID),
		"originalName":    fileHeader.Filename,
		"originalSize":    originalSize,
		"compressedSize":  compressedSize,
		"compressionRatio": compressionRatio,
	}

	// Add billing info if available
	billingInfo, err := getBillingInfo(userID.(string), operationType)
	if err == nil {
		resp["billing"] = billingInfo
	}

	// Clean up input file
	go func() {
		time.Sleep(5 * time.Minute)
		os.Remove(inputPath)
	}()

	response.Success(c, resp)
}