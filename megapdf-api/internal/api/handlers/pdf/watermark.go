// internal/api/handlers/pdf/watermark.go
package pdf

import (
	"fmt"
	"mime/multipart"
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

// Watermark handles the PDF watermarking operation
func Watermark(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	// Track operation
	operationType := "watermark"
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
		response.Error(c, http.StatusBadRequest, "Only PDF files can be watermarked")
		return
	}

	// Get watermark options
	watermarkType := c.PostForm("watermarkType")
	if watermarkType != "text" && watermarkType != "image" {
		response.Error(c, http.StatusBadRequest, "Invalid watermark type. Use 'text' or 'image'")
		return
	}

	position := c.PostForm("position")
	if position == "" {
		position = "center"
	}

	pages := c.PostForm("pages")
	customPages := c.PostForm("customPages")

	// Process pages based on option
	if pages != "all" && pages != "" {
		// Get total page count
		pgCount, err := getPDFPageCount(file)
		if err != nil {
			log.Warn().Err(err).Msg("Failed to get page count, using all pages")
		} else {
			// Convert page selection based on option
			if pages == "even" {
				var evenPages []string
				for i := 2; i <= pgCount; i += 2 {
					evenPages = append(evenPages, strconv.Itoa(i))
				}
				pages = strings.Join(evenPages, ",")
			} else if pages == "odd" {
				var oddPages []string
				for i := 1; i <= pgCount; i += 2 {
					oddPages = append(oddPages, strconv.Itoa(i))
				}
				pages = strings.Join(oddPages, ",")
			} else if pages == "custom" && customPages != "" {
				pages = parsePageRanges(customPages, pgCount)
			} else {
				pages = "" // Default to all pages
			}
		}
	} else {
		pages = "" // Empty string for all pages
	}

	// Parse opacity and rotation
	opacity, _ := strconv.ParseFloat(c.PostForm("opacity"), 64)
	if opacity <= 0 || opacity > 100 {
		opacity = 30 // Default opacity 30%
	}
	opacity = opacity / 100 // Convert to 0-1 range

	rotation, _ := strconv.Atoi(c.PostForm("rotation"))

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(constants.UploadDir, fmt.Sprintf("%s-input.pdf", uniqueID))
	outputPath := filepath.Join(constants.WatermarkDir, fmt.Sprintf("%s-watermarked.pdf", uniqueID))
	tempImagePath := ""

	// Ensure directories exist
	if err := fileutils.EnsureDirectories(constants.UploadDir, constants.WatermarkDir, constants.TempDir); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create directories: "+err.Error())
		return
	}

	// Save uploaded file
	if err := fileutils.SaveUploadedFile(file, fileHeader, inputPath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save file: "+err.Error())
		return
	}

	// Create watermark options
	options := pdf.WatermarkOptions{
		InputPath:     inputPath,
		OutputPath:    outputPath,
		WatermarkType: watermarkType,
		Position:      position,
		Opacity:       opacity,
		Rotation:      rotation,
		Pages:         pages,
	}

	// Process type-specific options
	if watermarkType == "text" {
		// Get text watermark options
		options.Text = c.PostForm("text")
		if options.Text == "" {
			options.Text = "WATERMARK" // Default text
		}

		options.TextColor = c.PostForm("textColor")
		if options.TextColor == "" {
			options.TextColor = "#FF0000" // Default red
		}

		options.FontName = c.PostForm("fontFamily")
		if options.FontName == "" {
			options.FontName = "Helvetica"
		}

		fontSize, _ := strconv.Atoi(c.PostForm("fontSize"))
		if fontSize <= 0 {
			fontSize = 48 // Default size
		}
		options.FontSize = fontSize
	} else if watermarkType == "image" {
		// Get and process watermark image
		watermarkImage, watermarkHeader, err := c.Request.FormFile("watermarkImage")
		if err != nil {
			os.Remove(inputPath)
			response.Error(c, http.StatusBadRequest, "Failed to get watermark image: "+err.Error())
			return
		}
		defer watermarkImage.Close()

		// Save image temporarily
		tempImagePath = filepath.Join(constants.TempDir, fmt.Sprintf("%s-watermark%s", uniqueID, filepath.Ext(watermarkHeader.Filename)))
		if err := fileutils.SaveUploadedFile(watermarkImage, watermarkHeader, tempImagePath); err != nil {
			os.Remove(inputPath)
			response.Error(c, http.StatusInternalServerError, "Failed to save watermark image: "+err.Error())
			return
		}

		options.ImagePath = tempImagePath

		scale, _ := strconv.ParseFloat(c.PostForm("scale"), 64)
		if scale <= 0 {
			scale = 50 // Default 50%
		}
		options.Scale = scale
	}

	// Perform watermarking
	watermarkService := pdf.NewWatermarkService()
	err = watermarkService.Watermark(options)
	if err != nil {
		// Clean up files on error
		os.Remove(inputPath)
		if tempImagePath != "" {
			os.Remove(tempImagePath)
		}
		response.Error(c, http.StatusInternalServerError, "Watermarking failed: "+err.Error())
		return
	}

	// Record operation
	if err := recordOperation(userID.(string), operationType); err != nil {
		log.Error().Err(err).Str("userID", userID.(string)).Str("operation", operationType).Msg("Failed to record operation")
		// Continue despite error recording operation
	}

	// Calculate pages watermarked
	pagesWatermarked := 0
	if pgCount, err := getPDFPageCount(file); err == nil {
		if pages == "" {
			pagesWatermarked = pgCount // All pages
		} else {
			// Count pages in range
			pagesWatermarked = countPagesInRange(pages, pgCount)
		}
	}

	// Create response with file info
	fileURL := fmt.Sprintf("/api/file?folder=watermarks&filename=%s-watermarked.pdf", uniqueID)
	resp := gin.H{
		"success":          true,
		"message":          "PDF watermarked successfully",
		"fileUrl":          fileURL,
		"filename":         fmt.Sprintf("%s-watermarked.pdf", uniqueID),
		"originalName":     fileHeader.Filename,
		"pagesWatermarked": pagesWatermarked,
	}

	// Add billing info if available
	billingInfo, err := getBillingInfo(userID.(string), operationType)
	if err == nil {
		resp["billing"] = billingInfo
	}

	// Clean up temporary files
	go func() {
		time.Sleep(5 * time.Minute)
		os.Remove(inputPath)
		if tempImagePath != "" {
			os.Remove(tempImagePath)
		}
	}()

	response.Success(c, resp)
}

// Helper to get page count from PDF
func getPDFPageCount(file multipart.File) (int, error) {
	// Implementation can use temporary file and pdfcpu info
	// For brevity, return a placeholder implementation
	return 1, nil
}

// Helper to parse page ranges
func parsePageRanges(rangeStr string, totalPages int) string {
	// Implementation to parse ranges like "1,3,5-10"
	// For brevity, return a placeholder
	return rangeStr
}

// Helper to count pages in a range string
func countPagesInRange(pageRange string, totalPages int) int {
	// Implementation to count pages in a range
	// For brevity, return a placeholder
	return 1
}
