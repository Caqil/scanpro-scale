// internal/api/handlers/pdf/sign.go
package pdf

import (
	"encoding/json"
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

// Sign handles the PDF signing operation
func Sign(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "sign"
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
	if !validation.IsPDF(fileHeader.Filename) {
		response.Error(c, http.StatusBadRequest, "Only PDF files can be signed")
		return
	}

	// Parse signature elements from form
	elementsJSON := c.PostForm("elements")
	if elementsJSON == "" {
		response.Error(c, http.StatusBadRequest, "No elements provided for signing")
		return
	}

	var elements []pdf.SignatureElement
	if err := json.Unmarshal([]byte(elementsJSON), &elements); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid elements format: "+err.Error())
		return
	}

	if len(elements) == 0 {
		response.Error(c, http.StatusBadRequest, "No valid elements provided for signing")
		return
	}

	// Parse page data from form
	pagesJSON := c.PostForm("pages")
	if pagesJSON == "" {
		response.Error(c, http.StatusBadRequest, "No page data provided")
		return
	}

	var pages []pdf.PageData
	if err := json.Unmarshal([]byte(pagesJSON), &pages); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid pages format: "+err.Error())
		return
	}

	if len(pages) == 0 {
		response.Error(c, http.StatusBadRequest, "No valid page data provided")
		return
	}

	// Get OCR options
	performOCR := c.PostForm("performOcr") == "true"
	ocrLanguage := c.PostForm("ocrLanguage")
	if ocrLanguage == "" {
		ocrLanguage = "eng" // Default language
	}

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.ProcessedDir, fmt.Sprintf("%s-signed.pdf", uniqueID))
	ocrOutputPath := ""

	if performOCR {
		ocrOutputPath = filepath.Join(constants.OCRDir, fmt.Sprintf("%s-searchable.pdf", uniqueID))
	}

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.ProcessedDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	if performOCR {
		if err := fileutils.EnsureDirectory(constants.OCRDir); err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to create OCR directory: "+err.Error())
			return
		}
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Create sign options
	signOptions := pdf.SignOptions{
		InputPath:     inputPath,
		OutputPath:    outputPath,
		Elements:      elements,
		Pages:         pages,
		PerformOCR:    performOCR,
		OCRLanguage:   ocrLanguage,
		OCROutputPath: ocrOutputPath,
	}

	// Perform signing
	signService := pdf.NewSignService()
	err = signService.Sign(signOptions)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Signing failed: "+err.Error())
		return
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=signatures&filename=%s-signed.pdf", uniqueID)
	resp := gin.H{
		"success":      true,
		"message":      "PDF signed successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-signed.pdf", uniqueID),
		"originalName": fileHeader.Filename,
	}

	// Add OCR info if performed
	if performOCR && ocrOutputPath != "" && fileExists(ocrOutputPath) {
		resp["ocrComplete"] = true
		resp["searchablePdfUrl"] = fmt.Sprintf("/api/file?folder=ocr&filename=%s-searchable.pdf", uniqueID)
		resp["searchablePdfFilename"] = fmt.Sprintf("%s-searchable.pdf", uniqueID)

		// Try to extract text from OCR'd PDF
		if text, err := signService.extractTextFromPDF(ocrOutputPath); err == nil && text != "" {
			// Save text to file
			textPath := filepath.Join(constants.OCRDir, fmt.Sprintf("%s-ocr.txt", uniqueID))
			if err := os.WriteFile(textPath, []byte(text), 0644); err == nil {
				resp["ocrText"] = text
				resp["ocrTextUrl"] = fmt.Sprintf("/api/file?folder=ocr&filename=%s-ocr.txt", uniqueID)
			}
		}
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

// Helper function to check if a file exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}
