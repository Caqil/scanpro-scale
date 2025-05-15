// internal/api/handlers/pdf/pagenumber.go
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

// AddPageNumbers handles the PDF page numbering operation
func AddPageNumbers(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "pagenumber"
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be processed")
		return
	}

	// Get page numbering options
	format := c.PostForm("format")
	if format == "" {
		format = "numeric" // Default
	}
	if !isValidNumberFormat(format) {
		response.Error(c, http.StatusBadRequest, "Invalid number format. Use 'numeric', 'roman', or 'alphabetic'")
		return
	}

	position := c.PostForm("position")
	if position == "" {
		position = "bottom-center" // Default
	}
	if !isValidPosition(position) {
		response.Error(c, http.StatusBadRequest, "Invalid position")
		return
	}

	fontFamily := c.PostForm("fontFamily")
	if fontFamily == "" {
		fontFamily = "Helvetica" // Default
	}

	fontSize, _ := strconv.Atoi(c.PostForm("fontSize"))
	if fontSize <= 0 {
		fontSize = 12 // Default
	}

	color := c.PostForm("color")
	if color == "" {
		color = "#000000" // Default to black
	}

	startNumber, _ := strconv.Atoi(c.PostForm("startNumber"))
	if startNumber <= 0 {
		startNumber = 1 // Default
	}

	prefix := c.PostForm("prefix")
	suffix := c.PostForm("suffix")
	marginX, _ := strconv.Atoi(c.PostForm("marginX"))
	marginY, _ := strconv.Atoi(c.PostForm("marginY"))
	if marginX <= 0 {
		marginX = 40 // Default
	}
	if marginY <= 0 {
		marginY = 30 // Default
	}

	skipFirstPage := c.PostForm("skipFirstPage") == "true"
	selectedPages := []int{}

	// Parse selected pages if provided
	pagesStr := c.PostForm("selectedPages")
	if pagesStr != "" {
		selectedPages = parsePageRanges(pagesStr)
	}

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.ProcessedDir, fmt.Sprintf("%s-numbered.pdf", uniqueID))

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

	// Create page numbering options
	pageNumberOptions := pdf.PageNumberOptions{
		InputPath:     inputPath,
		OutputPath:    outputPath,
		Format:        format,
		Position:      position,
		FontFamily:    fontFamily,
		FontSize:      fontSize,
		Color:         color,
		StartNumber:   startNumber,
		Prefix:        prefix,
		Suffix:        suffix,
		MarginX:       marginX,
		MarginY:       marginY,
		SelectedPages: selectedPages,
		SkipFirstPage: skipFirstPage,
	}

	// Add page numbers to PDF
	pageNumberService := pdf.NewPageNumberService()
	err = pageNumberService.AddPageNumbers(pageNumberOptions)
	if err != nil {
		// Clean up input file on error
		os.Remove(inputPath)
		response.Error(c, http.StatusInternalServerError, "Page numbering failed: "+err.Error())
		return
	}

	// Get total and numbered page count
	totalPages, _ := pageNumberService.getPDFPageCount(inputPath)
	numberedPages := len(selectedPages)
	if numberedPages == 0 { // If no specific pages selected, all pages are numbered
		numberedPages = totalPages
		if skipFirstPage {
			numberedPages--
		}
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=pagenumbers&filename=%s-numbered.pdf", uniqueID)
	resp := gin.H{
		"success":       true,
		"message":       "PDF page numbers added successfully",
		"fileUrl":       fileURL,
		"fileName":      fmt.Sprintf("%s-numbered.pdf", uniqueID),
		"originalName":  fileHeader.Filename,
		"totalPages":    totalPages,
		"numberedPages": numberedPages,
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

// Check if number format is valid
func isValidNumberFormat(format string) bool {
	validFormats := []string{"numeric", "roman", "alphabetic"}
	for _, valid := range validFormats {
		if format == valid {
			return true
		}
	}
	return false
}

// Check if position is valid
func isValidPosition(position string) bool {
	validPositions := []string{
		"bottom-center", "bottom-left", "bottom-right",
		"top-center", "top-left", "top-right",
	}
	for _, valid := range validPositions {
		if position == valid {
			return true
		}
	}
	return false
}

// Parse page ranges from string (e.g., "1,3,5-10")
func parsePageRanges(pagesString string) []int {
	pages := []int{}

	// If empty string, return empty slice
	if pagesString == "" {
		return pages
	}

	// Split by commas
	parts := strings.Split(pagesString, ",")

	for _, part := range parts {
		trimmedPart := strings.TrimSpace(part)
		if trimmedPart == "" {
			continue
		}

		// Check if it's a range (contains '-')
		if strings.Contains(trimmedPart, "-") {
			rangeParts := strings.Split(trimmedPart, "-")
			if len(rangeParts) == 2 {
				start, startErr := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
				end, endErr := strconv.Atoi(strings.TrimSpace(rangeParts[1]))

				if startErr == nil && endErr == nil && start <= end {
					// Add all pages in range
					for i := start; i <= end; i++ {
						if i > 0 && !contains(pages, i) {
							pages = append(pages, i)
						}
					}
				}
			}
		} else {
			// Single page number
			page, err := strconv.Atoi(trimmedPart)
			if err == nil && page > 0 && !contains(pages, page) {
				pages = append(pages, page)
			}
		}
	}

	return pages
}

// Helper function to check if a slice contains a value
func contains(slice []int, value int) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}
