// internal/api/handlers/pdf/repair.go
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

// Repair handles the PDF repair operation
func Repair(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "repair"
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be repaired")
		return
	}

	// Get repair options
	repairMode := c.PostForm("repairMode")
	if repairMode == "" {
		repairMode = "standard" // Default mode
	}

	if !isValidRepairMode(repairMode) {
		response.Error(c, http.StatusBadRequest, "Invalid repair mode. Use 'standard', 'advanced', or 'optimization'")
		return
	}

	// Get advanced options
	password := c.PostForm("password")
	preserveFormFields := c.PostForm("preserveFormFields") == "true"
	preserveAnnotations := c.PostForm("preserveAnnotations") == "true"
	preserveBookmarks := c.PostForm("preserveBookmarks") == "true"
	optimizeImages := c.PostForm("optimizeImages") == "true"

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.ProcessedDir, fmt.Sprintf("%s-repaired.pdf", uniqueID))

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.ProcessedDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Get original file size
	originalSize := fileHeader.Size

	// Create repair options
	repairOptions := pdf.RepairOptions{
		InputPath:          inputPath,
		OutputPath:         outputPath,
		RepairMode:         repairMode,
		Password:           password,
		PreserveFormFields: preserveFormFields,
		PreserveAnnotations: preserveAnnotations,
		PreserveBookmarks:  preserveBookmarks,
		OptimizeImages:     optimizeImages,
	}

	// Perform repair
	repairService := pdf.NewRepairService()
	err = repairService.Repair(repairOptions)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Repair failed: "+err.Error())
		return
	}

	// Get repaired file size
	repairedStats, err := os.Stat(outputPath)
	if err != nil {
		log.Error().Err(err).Str("path", outputPath).Msg("Failed to get repaired file stats")
		// Continue despite error getting file stats
	}
	newSize := repairedStats.Size()

	// Generate repair details
	repairDetails := generateRepairDetails(repairMode, originalSize, newSize, password != "")

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=repaired&filename=%s-repaired.pdf", uniqueID)
	resp := gin.H{
		"success":      true,
		"message":      "PDF repaired successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-repaired.pdf", uniqueID),
		"originalName": fileHeader.Filename,
		"details":      repairDetails,
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

// Helper functions

// Check if repair mode is valid
func isValidRepairMode(mode string) bool {
	validModes := []string{"standard", "advanced", "optimization"}
	for _, validMode := range validModes {
		if mode == validMode {
			return true
		}
	}
	return false
}

// Generate repair details for response
func generateRepairDetails(mode string, originalSize int64, newSize int64, hadPassword bool) gin.H {
	fixed := []string{}
	warnings := []string{}

	// Add details based on mode
	switch mode {
	case "standard":
		fixed = append(fixed, "Fixed cross-reference table")
		fixed = append(fixed, "Rebuilt document structure")
		warnings = append(warnings, "Basic repair applied, some advanced issues may remain")
	case "advanced":
		fixed = append(fixed, "Fixed cross-reference table")
		fixed = append(fixed, "Rebuilt document structure")
		fixed = append(fixed, "Fixed content streams")
		fixed = append(fixed, "Linearized for fast web viewing")
	case "optimization":
		fixed = append(fixed, "Optimized PDF structure")
		fixed = append(fixed, "Removed redundant data")
		fixed = append(fixed, "Optimized and compressed images")
	}

	// Add password-specific details
	if hadPassword {
		fixed = append(fixed, "Removed password protection")
	}

	details := gin.H{
		"fixed":        fixed,
		"warnings":     warnings,
		"originalSize": originalSize,
		"newSize":      newSize,
	}

	return details
}