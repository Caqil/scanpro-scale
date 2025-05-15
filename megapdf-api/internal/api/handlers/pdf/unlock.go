// internal/api/handlers/pdf/unlock.go
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

// Unlock handles the PDF unlock operation
func Unlock(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "unlock"
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be unlocked")
		return
	}

	// Get password
	password := c.PostForm("password")
	if password == "" {
		response.Error(c, http.StatusBadRequest, "Password is required")
		return
	}

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-protected.pdf", uniqueID))
	outputPath := filepath.Join(constants.UnlockedDir, fmt.Sprintf("%s-unlocked.pdf", uniqueID))

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.UnlockedDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Unlock PDF
	unlockService := pdf.NewUnlockService()
	err = unlockService.Unlock(inputPath, outputPath, password)
	
	var methodUsed string
	var unlockSuccess bool
	
	if err == nil {
		unlockSuccess = true
		methodUsed = "pdfcpu"
	} else {
		// Check if file is actually password-protected
		isLocked, checkErr := unlockService.CheckLock(inputPath)
		
		if checkErr != nil || !isLocked {
			// File might not be protected or is already unlocked
			// Just copy the original file
			if err := fileutils.CopyFile(inputPath, outputPath); err != nil {
				os.Remove(inputPath)
				response.Error(c, http.StatusInternalServerError, "Failed to copy file: "+err.Error())
				return
			}
			unlockSuccess = true
			methodUsed = "copy"
		} else {
			// File is protected but unlock failed
			os.Remove(inputPath)
			response.Error(c, http.StatusBadRequest, "Failed to unlock PDF. The password may be incorrect.")
			return
		}
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=unlocked&filename=%s-unlocked.pdf", uniqueID)
	resp := gin.H{
		"success":      true,
		"message":      methodUsed == "copy" ? "PDF processed, but it may not have been password-protected" : "PDF unlocked successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-unlocked.pdf", uniqueID),
		"originalName": fileHeader.Filename,
		"methodUsed":   methodUsed,
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

// CheckLock handler to check if a PDF is password-protected
func CheckLock(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be checked")
		return
	}

	// Generate unique filename
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-check.pdf", uniqueID))

	// Ensure directory exists
	if err := fileutils.EnsureDirectory(constants.UploadDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directory: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Check if PDF is password-protected
	unlockService := pdf.NewUnlockService()
	isPasswordProtected, err := unlockService.CheckLock(inputPath)
	
	// Clean up file
	os.Remove(inputPath)
	
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to check PDF: "+err.Error())
		return
	}

	// Return result
	response.Success(c, gin.H{
		"success":           true,
		"isPasswordProtected": isPasswordProtected,
		"message":           isPasswordProtected ? "This PDF appears to be password protected" : "This PDF is not password protected",
	})
}