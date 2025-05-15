// internal/api/handlers/pdf/protect.go
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

// Protect handles the PDF password protection operation
func Protect(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "protect"
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be protected")
		return
	}

	// Get protection options
	password := c.PostForm("password")
	if password == "" {
		response.Error(c, http.StatusBadRequest, "Password is required")
		return
	}

	permission := c.PostForm("permission")
	if permission == "" {
		permission = "restricted" // Default
	}

	// Parse permissions
	allowPrinting := c.PostForm("allowPrinting") == "true" || permission == "all"
	allowCopying := c.PostForm("allowCopying") == "true" || permission == "all"
	allowEditing := c.PostForm("allowEditing") == "true" || permission == "all"

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.ProtectedDir, fmt.Sprintf("%s-protected.pdf", uniqueID))

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.ProtectedDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Create protection options
	options := pdf.ProtectionOptions{
		InputPath:     inputPath,
		OutputPath:    outputPath,
		UserPassword:  password,
		OwnerPassword: password, // Using same password for both
		AllowPrinting: allowPrinting,
		AllowCopying:  allowCopying,
		AllowEditing:  allowEditing,
	}

	// Perform protection
	protectService := pdf.NewProtectService()
	err = protectService.Protect(options)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Protection failed: "+err.Error())
		return
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=protected&filename=%s-protected.pdf", uniqueID)
	resp := gin.H{
		"success":      true,
		"message":      "PDF protected with password successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-protected.pdf", uniqueID),
		"originalName": fileHeader.Filename,
		"methodUsed":   "pdfcpu",
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