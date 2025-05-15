// internal/api/handlers/pdf/convert.go
package pdf

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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

// Convert handles the PDF conversion operation
func Convert(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "convert"
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

	// Get output format
	outputFormat := c.PostForm("outputFormat")
	if !validation.IsSupportedFormat(outputFormat) {
		response.Error(c, http.StatusBadRequest, "Unsupported output format: "+outputFormat)
		return
	}

	// Get input format from file or form
	inputFormat := fileutils.GetFormatFromFilename(fileHeader.Filename)
	if inputFormat == "" {
		inputFormat = c.PostForm("inputFormat")
		if !validation.IsSupportedFormat(inputFormat) {
			response.Error(c, http.StatusBadRequest, "Unsupported input format")
			return
		}
	}

	// Get additional options
	ocr := c.PostForm("ocr") == "true"
	quality, _ := strconv.Atoi(c.PostForm("quality"))
	if quality <= 0 {
		quality = 90 // Default quality
	}
	password := c.PostForm("password")

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.%s", uniqueID, inputFormat))
	outputPath := filepath.Join(constants.ConversionDir, fmt.Sprintf("%s-output.%s", uniqueID, outputFormat))

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.ConversionDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Process conversion
	conversionOptions := pdf.ConversionOptions{
		InputPath:    inputPath,
		OutputPath:   outputPath,
		InputFormat:  inputFormat,
		OutputFormat: outputFormat,
		Quality:      quality,
		OCR:          ocr,
		Password:     password,
	}

	// Perform conversion
	conversionService := pdf.NewConvertService()
	err = conversionService.Convert(conversionOptions)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Conversion failed: "+err.Error())
		return
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=conversions&filename=%s-output.%s", uniqueID, outputFormat)
	resp := gin.H{
		"success":      true,
		"message":      "Conversion successful",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-output.%s", uniqueID, outputFormat),
		"originalName": fileHeader.Filename,
		"inputFormat":  inputFormat,
		"outputFormat": outputFormat,
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

// Helper functions for operation validation and billing
func validateOperation(c *gin.Context, userID, operationType string) (bool, error) {
	// Implementation will be added
	return true, nil
}

func recordOperation(userID, operationType string) error {
	// Implementation will be added
	return nil
}

func getBillingInfo(userID, operationType string) (gin.H, error) {
	// Implementation will be added
	return gin.H{}, nil
}
