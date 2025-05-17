package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/Caqil/megapdf-api/internal/config"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/pdfcpu/pdfcpu/pkg/api"
)

type PDFHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

func NewPDFHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFHandler {
	return &PDFHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// AddPageNumbersToPDF adds page numbers to a PDF file
// @Summary Add page numbers to a PDF file
// @Description Adds customizable page numbers to a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to add page numbers to (max 50MB)"
// @Param position formData string false "Position of page numbers: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right" default(bottom-center)
// @Param format formData string false "Format of page numbers: numeric, roman, alphabetic" default(numeric)
// @Param fontFamily formData string false "Font family: Helvetica, Times, Courier" default(Helvetica)
// @Param fontSize formData int false "Font size in points" default(12)
// @Param color formData string false "Text color in hex format" default(#000000)
// @Param startNumber formData int false "First page number" default(1)
// @Param prefix formData string false "Text to add before page number" default()
// @Param suffix formData string false "Text to add after page number" default()
// @Param marginX formData int false "Horizontal margin in points" default(40)
// @Param marginY formData int false "Vertical margin in points" default(30)
// @Param selectedPages formData string false "Pages to add numbers to (e.g., '1-3,5,7-9'), empty for all pages"
// @Param skipFirstPage formData bool false "Skip numbering on the first page" default(false)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,fileName=string,originalName=string,totalPages=integer,numberedPages=integer,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/pagenumber [post]
func (h *PDFHandler) AddPageNumbersToPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Validate file size (max 50MB)
	if file.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size exceeds 50MB limit",
		})
		return
	}

	// Get page numbering options
	position := c.DefaultPostForm("position", "bottom-center")
	format := c.DefaultPostForm("format", "numeric")
	fontFamily := c.DefaultPostForm("fontFamily", "Helvetica")
	fontSizeStr := c.DefaultPostForm("fontSize", "12")
	color := c.DefaultPostForm("color", "#000000")
	startNumberStr := c.DefaultPostForm("startNumber", "1")
	prefix := c.DefaultPostForm("prefix", "")
	suffix := c.DefaultPostForm("suffix", "")
	marginXStr := c.DefaultPostForm("marginX", "40")
	marginYStr := c.DefaultPostForm("marginY", "30")
	selectedPages := c.DefaultPostForm("selectedPages", "") // Empty means all pages
	skipFirstPage := c.DefaultPostForm("skipFirstPage", "false") == "true"

	// Validate position
	validPositions := map[string]bool{
		"top-left":      true,
		"top-center":    true,
		"top-right":     true,
		"bottom-left":   true,
		"bottom-center": true,
		"bottom-right":  true,
	}
	if !validPositions[position] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid position. Must be one of: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right",
		})
		return
	}

	// Validate format
	validFormats := map[string]bool{
		"numeric":    true,
		"roman":      true,
		"alphabetic": true,
	}
	if !validFormats[format] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid format. Must be one of: numeric, roman, alphabetic",
		})
		return
	}

	// Validate and parse numeric parameters
	fontSize, err := strconv.Atoi(fontSizeStr)
	if err != nil || fontSize <= 0 || fontSize > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid font size. Must be a positive number between 1 and 72",
		})
		return
	}

	startNumber, err := strconv.Atoi(startNumberStr)
	if err != nil || startNumber <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid start number. Must be a positive number",
		})
		return
	}

	marginX, err := strconv.Atoi(marginXStr)
	if err != nil || marginX < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid horizontal margin. Must be a non-negative number",
		})
		return
	}

	marginY, err := strconv.Atoi(marginYStr)
	if err != nil || marginY < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid vertical margin. Must be a non-negative number",
		})
		return
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "pagenumbers", uniqueID+"-numbered.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Check if pdfcpu is available
	if _, err := exec.LookPath("pdfcpu"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "pdfcpu tool not found",
		})
		return
	}

	// Validate PDF integrity
	cmd := exec.Command("pdfcpu", "validate", inputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("PDF validation failed: %s", string(output))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid or corrupted PDF: " + string(output),
		})
		return
	}

	// Get total page count using pdfcpu
	cmd = exec.Command("pdfcpu", "info", inputPath)
	output, err = cmd.CombinedOutput()
	if err != nil {
		log.Printf("pdfcpu info failed: %s", string(output))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get PDF information: " + string(output),
		})
		return
	}

	// Log output for debugging
	log.Printf("pdfcpu info output: %s", string(output))

	// Parse page count from pdfcpu output
	pageCountRegex := regexp.MustCompile(`(?i)Pages?\s*[:=]\s*(\d+)`)
	matches := pageCountRegex.FindStringSubmatch(string(output))

	totalPages := 0
	if len(matches) >= 2 {
		totalPages, err = strconv.Atoi(matches[1])
		if err != nil {
			log.Printf("Failed to parse page count: %s", matches[1])
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to parse page count",
			})
			return
		}
	}

	if totalPages == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PDF contains no pages or page count could not be determined",
		})
		return
	}

	// Parse selected pages
	pagesToNumber := make([]int, 0)
	if selectedPages == "" {
		// If no pages specified, number all pages
		for i := 1; i <= totalPages; i++ {
			pagesToNumber = append(pagesToNumber, i)
		}
	} else {
		// Parse page ranges (e.g., "1-3,5,7-9")
		parts := strings.Split(selectedPages, ",")
		for _, part := range parts {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}

			if strings.Contains(part, "-") {
				// It's a range
				rangeParts := strings.Split(part, "-")
				if len(rangeParts) != 2 {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Invalid page range format: " + part,
					})
					return
				}

				start, err := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
				if err != nil || start < 1 || start > totalPages {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Invalid page number in range: " + rangeParts[0],
					})
					return
				}

				end, err := strconv.Atoi(strings.TrimSpace(rangeParts[1]))
				if err != nil || end < start || end > totalPages {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Invalid page number in range: " + rangeParts[1],
					})
					return
				}

				for i := start; i <= end; i++ {
					pagesToNumber = append(pagesToNumber, i)
				}
			} else {
				// It's a single page
				page, err := strconv.Atoi(part)
				if err != nil || page < 1 || page > totalPages {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Invalid page number: " + part,
					})
					return
				}
				pagesToNumber = append(pagesToNumber, page)
			}
		}
	}

	// Skip first page if specified
	if skipFirstPage {
		for i, page := range pagesToNumber {
			if page == 1 {
				pagesToNumber = append(pagesToNumber[:i], pagesToNumber[i+1:]...)
				break
			}
		}
	}

	// Make sure there are pages to number
	if len(pagesToNumber) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No pages selected for numbering",
		})
		return
	}

	// Convert page numbers list to pdfcpu format
	pagesArg := ""
	for i, page := range pagesToNumber {
		if i > 0 {
			pagesArg += ","
		}
		pagesArg += strconv.Itoa(page)
	}

	// Map position to pdfcpu position
	pdfcpuPosition := ""
	switch position {
	case "top-left":
		pdfcpuPosition = "tl"
	case "top-center":
		pdfcpuPosition = "tc"
	case "top-right":
		pdfcpuPosition = "tr"
	case "bottom-left":
		pdfcpuPosition = "bl"
	case "bottom-center":
		pdfcpuPosition = "bc"
	case "bottom-right":
		pdfcpuPosition = "br"
	}

	// Generate script for pdfcpu watermark command
	tempScriptPath := filepath.Join(h.config.TempDir, uniqueID+"-script.sh")

	var scriptContent strings.Builder
	scriptContent.WriteString("#!/bin/bash\n\n")

	// Copy input file to output path to start with
	scriptContent.WriteString(fmt.Sprintf("cp \"%s\" \"%s\"\n\n", inputPath, outputPath))

	// Add page numbers
	for _, pageNum := range pagesToNumber {
		// Format the page number according to the selected format
		var formattedNumber string

		switch format {
		case "roman":
			formattedNumber = toRoman(startNumber + pageNum - 1)
		case "alphabetic":
			formattedNumber = toAlphabetic(startNumber + pageNum - 1)
		default: // numeric
			formattedNumber = strconv.Itoa(startNumber + pageNum - 1)
		}

		// Create the text content with prefix and suffix
		pageText := prefix + formattedNumber + suffix

		// Call pdfcpu watermark for each page
		scriptContent.WriteString(fmt.Sprintf("pdfcpu watermark add -pages %d -mode text -pos %s -margin %d,%d -font %s -size %d -color %s \"%s\" \"%s\" \"%s\"\n",
			pageNum,
			pdfcpuPosition,
			marginX,
			marginY,
			getFontMap(fontFamily),
			fontSize,
			formatColor(color),
			pageText,
			outputPath,
			outputPath,
		))
	}

	// Write the script to a file
	if err := os.WriteFile(tempScriptPath, []byte(scriptContent.String()), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create processing script: " + err.Error(),
		})
		return
	}
	defer os.Remove(tempScriptPath)

	// Execute the script
	cmd = exec.Command("/bin/bash", tempScriptPath)
	output, err = cmd.CombinedOutput()
	if err != nil {
		log.Printf("Script execution failed: %s", string(output))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to add page numbers: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=pagenumbers&filename=%s-numbered.pdf", uniqueID)

	// Return the result
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "Page numbers added successfully",
		"fileUrl":       fileURL,
		"fileName":      fmt.Sprintf("%s-numbered.pdf", uniqueID),
		"originalName":  file.Filename,
		"totalPages":    totalPages,
		"numberedPages": len(pagesToNumber),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// Helper function to convert number to Roman numerals
func toRoman(num int) string {
	if num <= 0 {
		return ""
	}

	romanNumerals := []struct {
		value   int
		numeral string
	}{
		{1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"},
		{100, "C"}, {90, "XC"}, {50, "L"}, {40, "XL"},
		{10, "X"}, {9, "IX"}, {5, "V"}, {4, "IV"}, {1, "I"},
	}

	var result strings.Builder

	for _, rn := range romanNumerals {
		for num >= rn.value {
			result.WriteString(rn.numeral)
			num -= rn.value
		}
	}

	return result.String()
}

// Helper function to convert number to alphabetic format (A, B, C, ..., Z, AA, AB, etc.)
func toAlphabetic(num int) string {
	if num <= 0 {
		return ""
	}

	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	length := len(alphabet)

	var result strings.Builder

	// Convert to base-26 representation
	n := num
	for n > 0 {
		n--
		remainder := n % length
		result.WriteByte(alphabet[remainder])
		n /= length
	}

	// Reverse the string
	runes := []rune(result.String())
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}

	return string(runes)
}

// Helper function to map font family names to pdfcpu font names
func getFontMap(fontFamily string) string {
	switch strings.ToLower(fontFamily) {
	case "times", "timesnewroman", "times new roman":
		return "times"
	case "courier":
		return "courier"
	default: // Helvetica is the default
		return "helvetica"
	}
}

// Helper function to format color string for pdfcpu
// Converts #RRGGBB to 0xrrggbb format
func formatColor(hexColor string) string {
	// Remove # prefix if present
	hexColor = strings.TrimPrefix(hexColor, "#")

	// Ensure it's a valid hex color
	if len(hexColor) != 6 {
		// Return default black if invalid
		return "0x000000"
	}

	// Return in pdfcpu format
	return "0x" + hexColor
}

// SplitPDF godoc
// @Summary Split a PDF file into multiple PDFs
// @Description Splits a PDF file into multiple PDFs based on page ranges
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to split (max 50MB)"
// @Param ranges formData string true "Page ranges for splitting (e.g., '1-3,4,5-7')"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,files=array,fileCount=integer,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/split [post]
func (h *PDFHandler) SplitPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get page ranges
	rangesStr := c.PostForm("ranges")
	if rangesStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Page ranges parameter is required",
		})
		return
	}

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputDir := filepath.Join(h.config.PublicDir, "splits", uniqueID)

	// Create output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create output directory: " + err.Error(),
		})
		return
	}

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Parse page ranges
	ranges := parsePageRanges(rangesStr)
	if len(ranges) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid page ranges format",
		})
		return
	}

	// Create files array to store output file information
	type SplitFile struct {
		Name          string `json:"name"`
		URL           string `json:"url"`
		Pages         string `json:"pages"`
		PageCount     int    `json:"pageCount"`
		SizeBytes     int64  `json:"sizeBytes"`
		SizeFormatted string `json:"sizeFormatted"`
	}

	outputFiles := []SplitFile{}

	// Split PDF for each range using pdfcpu
	for i, pageRange := range ranges {
		outputFilename := fmt.Sprintf("%s-split-%d.pdf", uniqueID, i+1)
		outputPath := filepath.Join(outputDir, outputFilename)

		// Form pdfcpu command for splitting
		cmd := exec.Command(
			"pdfcpu",
			"extract",
			"-mode", "page",
			"-pages", pageRange,
			inputPath,
			outputPath,
		)

		output, err := cmd.CombinedOutput()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to split PDF: " + string(output),
			})
			return
		}

		// Check if output file was created
		fileInfo, err := os.Stat(outputPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create split file: " + err.Error(),
			})
			return
		}

		// Calculate page count
		pageCount := countPagesInRange(pageRange)

		// Create file URL
		fileURL := fmt.Sprintf("/api/file?folder=splits/%s&filename=%s", uniqueID, outputFilename)

		// Format file size
		var sizeFormatted string
		sizeBytes := fileInfo.Size()
		if sizeBytes < 1024 {
			sizeFormatted = fmt.Sprintf("%d B", sizeBytes)
		} else if sizeBytes < 1024*1024 {
			sizeFormatted = fmt.Sprintf("%.2f KB", float64(sizeBytes)/1024)
		} else {
			sizeFormatted = fmt.Sprintf("%.2f MB", float64(sizeBytes)/(1024*1024))
		}

		// Add file to output list
		outputFiles = append(outputFiles, SplitFile{
			Name:          outputFilename,
			URL:           fileURL,
			Pages:         pageRange,
			PageCount:     pageCount,
			SizeBytes:     sizeBytes,
			SizeFormatted: sizeFormatted,
		})
	}

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   fmt.Sprintf("PDF split into %d files successfully", len(outputFiles)),
		"files":     outputFiles,
		"fileCount": len(outputFiles),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// Helper function to parse page ranges string into individual range strings
func parsePageRanges(rangesStr string) []string {
	// Split by comma
	parts := strings.Split(rangesStr, ",")

	// Filter out empty parts
	var validRanges []string
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			validRanges = append(validRanges, trimmed)
		}
	}

	return validRanges
}

// Helper function to count pages in a range string (e.g., "1-5" has 5 pages)
func countPagesInRange(rangeStr string) int {
	// Handle single page
	if !strings.Contains(rangeStr, "-") {
		return 1
	}

	// Handle page range
	parts := strings.Split(rangeStr, "-")
	if len(parts) != 2 {
		return 0
	}

	start, err1 := strconv.Atoi(strings.TrimSpace(parts[0]))
	end, err2 := strconv.Atoi(strings.TrimSpace(parts[1]))

	if err1 != nil || err2 != nil || start > end {
		return 0
	}

	return end - start + 1
}

// WatermarkPDF godoc
// @Summary Add watermark to a PDF file
// @Description Adds text or image watermark to a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to watermark (max 50MB)"
// @Param text formData string false "Text for watermark"
// @Param image formData file false "Image for watermark (only used if text is not provided)"
// @Param opacity formData number false "Watermark opacity (0.1-1.0)" default(0.5)
// @Param position formData string false "Watermark position" Enums(center, diagonal, topleft, topright, bottomleft, bottomright) default(center)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/watermark [post]
func (h *PDFHandler) WatermarkPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get watermark text or image
	watermarkText := c.PostForm("text")
	watermarkImage, _ := c.FormFile("image")

	if watermarkText == "" && watermarkImage == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Either watermark text or image must be provided",
		})
		return
	}

	// Get opacity
	opacityStr := c.DefaultPostForm("opacity", "0.5")
	opacity, err := strconv.ParseFloat(opacityStr, 64)
	if err != nil || opacity < 0.1 || opacity > 1.0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid opacity. Must be between 0.1 and 1.0",
		})
		return
	}

	// Get position
	position := c.DefaultPostForm("position", "center")
	validPositions := map[string]bool{
		"center": true, "diagonal": true, "topleft": true,
		"topright": true, "bottomleft": true, "bottomright": true,
	}

	if !validPositions[position] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid position",
		})
		return
	}

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "watermarked", uniqueID+"-watermarked.pdf")

	// Create watermark image path if needed
	var watermarkPath string
	if watermarkImage != nil {
		watermarkPath = filepath.Join(h.config.UploadDir, uniqueID+"-watermark"+filepath.Ext(watermarkImage.Filename))
	}

	// Save uploaded files
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save PDF file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	if watermarkImage != nil {
		if err := c.SaveUploadedFile(watermarkImage, watermarkPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save watermark image: " + err.Error(),
			})
			return
		}
		defer os.Remove(watermarkPath)
	}

	// Map position to pdfcpu modes
	positionMode := "c"
	switch position {
	case "diagonal":
		positionMode = "d"
	case "topleft":
		positionMode = "tl"
	case "topright":
		positionMode = "tr"
	case "bottomleft":
		positionMode = "bl"
	case "bottomright":
		positionMode = "br"
	}

	var cmd *exec.Cmd
	if watermarkText != "" {
		// Text watermark
		cmd = exec.Command(
			"pdfcpu",
			"watermark",
			"add",
			"-mode", "text",
			"-position", positionMode,
			"-opacity", opacityStr,
			watermarkText,
			inputPath,
			outputPath,
		)
	} else {
		// Image watermark
		cmd = exec.Command(
			"pdfcpu",
			"watermark",
			"add",
			"-mode", "image",
			"-position", positionMode,
			"-opacity", opacityStr,
			watermarkPath,
			inputPath,
			outputPath,
		)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to add watermark to PDF: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=watermarked&filename=%s-watermarked.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Watermark added to PDF successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-watermarked.pdf", uniqueID),
		"originalName": file.Filename,
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// UnlockPDF godoc
// @Summary Remove password protection from a PDF file
// @Description Removes password protection from a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to unlock (max 50MB)"
// @Param password formData string true "Current PDF password"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/unlock [post]
func (h *PDFHandler) UnlockPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get password
	password := c.PostForm("password")
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password is required",
		})
		return
	}

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "unlocked", uniqueID+"-unlocked.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Unlock PDF using pdfcpu
	cmd := exec.Command(
		"pdfcpu",
		"decrypt",
		"-upw", password,
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to unlock PDF. The password may be incorrect: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=unlocked&filename=%s-unlocked.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF unlocked successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-unlocked.pdf", uniqueID),
		"originalName": file.Filename,
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// CompressPDF godoc
// @Summary Compress a PDF file
// @Description Reduces PDF file size using maximum compression
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to compress (max 50MB)"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,originalSize=integer,compressedSize=integer,compressionRatio=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/compress [post]
func (h *PDFHandler) CompressPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "compressions", uniqueID+"-compressed.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)
	pageCount, err := api.PageCountFile(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get PDF page count: " + err.Error(),
		})
		return
	}

	if pageCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PDF contains no pages",
		})
		return
	}
	// Compress the PDF using pdfcpu optimize (maximum compression)
	cmd := exec.Command(
		"pdfcpu",
		"optimize",
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to compress PDF: " + string(output),
		})
		return
	}

	// Get file sizes
	originalFileInfo, err := os.Stat(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get original file size: " + err.Error(),
		})
		return
	}

	compressedFileInfo, err := os.Stat(outputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get compressed file size: " + err.Error(),
		})
		return
	}

	// Calculate compression ratio
	originalSize := originalFileInfo.Size()
	compressedSize := compressedFileInfo.Size()
	var compressionRatio float64
	if originalSize > 0 {
		compressionRatio = float64(originalSize-compressedSize) / float64(originalSize) * 100
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=compressions&filename=%s-compressed.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"message":          fmt.Sprintf("PDF compression successful with %.2f%% reduction", compressionRatio),
		"fileUrl":          fileURL,
		"filename":         fmt.Sprintf("%s-compressed.pdf", uniqueID),
		"originalName":     file.Filename,
		"originalSize":     originalSize,
		"compressedSize":   compressedSize,
		"compressionRatio": fmt.Sprintf("%.2f%%", compressionRatio),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// RotatePDF godoc
// @Summary Rotate pages in a PDF file
// @Description Rotates pages in a PDF file by a specified angle
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to rotate (max 50MB)"
// @Param angle formData integer true "Rotation angle in degrees" Enums(90, 180, 270)
// @Param pages formData string false "Pages to rotate (e.g., '1-3,5,7-9'), empty for all pages" default(all)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/rotate [post]
func (h *PDFHandler) RotatePDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get rotation angle
	angleStr := c.PostForm("angle")
	if angleStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Rotation angle is required",
		})
		return
	}

	angle, err := strconv.Atoi(angleStr)
	if err != nil || (angle != 90 && angle != 180 && angle != 270) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid rotation angle. Must be 90, 180, or 270 degrees",
		})
		return
	}

	// Get pages to rotate (optional)
	pages := c.DefaultPostForm("pages", "all")

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "rotations", uniqueID+"-rotated.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Build pdfcpu rotate command
	var cmd *exec.Cmd
	if pages == "all" {
		cmd = exec.Command(
			"pdfcpu",
			"rotate",
			"-a", angleStr,
			inputPath,
			outputPath,
		)
	} else {
		cmd = exec.Command(
			"pdfcpu",
			"rotate",
			"-p", pages,
			"-a", angleStr,
			inputPath,
			outputPath,
		)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to rotate PDF: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=rotations&filename=%s-rotated.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      fmt.Sprintf("PDF rotated by %d degrees successfully", angle),
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-rotated.pdf", uniqueID),
		"originalName": file.Filename,
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// ProtectPDF godoc
// @Summary Password protect a PDF file
// @Description Adds password protection and permission restrictions to a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to protect (max 50MB)"
// @Param password formData string true "Password to set for the PDF (minimum 4 characters)"
// @Param permission formData string false "Permission level: restricted (apply specific permissions) or all (grant all permissions)" Enums(restricted, all) default(restricted)
// @Param allowPrinting formData boolean false "Allow document printing" default(false)
// @Param allowCopying formData boolean false "Allow content copying" default(false)
// @Param allowEditing formData boolean false "Allow content editing" default(false)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,methodUsed=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/protect [post]
func (h *PDFHandler) ProtectPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get password
	password := c.PostForm("password")
	if len(password) < 4 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password must be at least 4 characters",
		})
		return
	}

	// Get permissions
	permission := c.DefaultPostForm("permission", "restricted")
	allowPrinting := c.DefaultPostForm("allowPrinting", "false") == "true" || permission == "all"
	allowCopying := c.DefaultPostForm("allowCopying", "false") == "true" || permission == "all"
	allowEditing := c.DefaultPostForm("allowEditing", "false") == "true" || permission == "all"

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "protected", uniqueID+"-protected.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Build permission flags for pdfcpu
	var permFlag string
	if permission == "all" {
		permFlag = "all"
	} else {
		permissions := []string{}
		if allowPrinting {
			permissions = append(permissions, "printing")
		}
		if allowCopying {
			permissions = append(permissions, "extract")
		}
		if allowEditing {
			permissions = append(permissions, "modify", "annotate")
		}
		if len(permissions) == 0 {
			permFlag = "none"
		} else {
			permFlag = strings.Join(permissions, ",")
		}
	}

	// Protect the PDF using pdfcpu
	cmd := exec.Command(
		"pdfcpu",
		"encrypt",
		"-upw", password,
		"-opw", password,
		"-perm", permFlag,
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to protect PDF: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=protected&filename=%s-protected.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF protected with password successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-protected.pdf", uniqueID),
		"originalName": file.Filename,
		"methodUsed":   "pdfcpu",
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}

// MergePDFs godoc
// @Summary Merge multiple PDF files
// @Description Combines multiple PDF files into a single PDF
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "PDF files to merge (multiple files)"
// @Param order formData string false "JSON array specifying the order of files (e.g., [2,0,1])"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,mergedSize=integer,totalInputSize=integer,fileCount=integer,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/merge [post]
func (h *PDFHandler) MergePDFs(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), operation.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           services.OperationCost,
			},
		})
		return
	}

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form: " + err.Error(),
		})
		return
	}

	// Get files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get form: " + err.Error(),
		})
		return
	}

	files := form.File["files"]
	if len(files) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least two PDF files are required for merging",
		})
		return
	}

	// Check all files are PDFs
	for _, file := range files {
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("File '%s' is not a PDF", file.Filename),
			})
			return
		}
	}

	// Parse file order if provided
	fileOrder := make([]int, len(files))
	for i := range fileOrder {
		fileOrder[i] = i // Default order
	}

	orderStr := c.PostForm("order")
	if orderStr != "" {
		var order []int
		if err := json.Unmarshal([]byte(orderStr), &order); err == nil {
			// Validate order
			valid := true
			if len(order) == len(files) {
				seen := make(map[int]bool)
				for _, idx := range order {
					if idx < 0 || idx >= len(files) || seen[idx] {
						valid = false
						break
					}
					seen[idx] = true
				}

				if valid {
					fileOrder = order
				}
			}
		}
	}

	// Create unique ID and output path
	uniqueID := uuid.New().String()
	outputPath := filepath.Join(h.config.PublicDir, "merges", uniqueID+"-merged.pdf")

	// Create temp directory for input files
	tempDir, err := os.MkdirTemp(h.config.TempDir, "merge-")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create temp directory: " + err.Error(),
		})
		return
	}
	defer os.RemoveAll(tempDir)

	// Save all files to temp directory
	inputPaths := make([]string, len(files))
	totalInputSize := int64(0)

	for i, file := range files {
		inputPath := filepath.Join(tempDir, fmt.Sprintf("input-%d.pdf", i))
		if err := c.SaveUploadedFile(file, inputPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file: " + err.Error(),
			})
			return
		}

		inputPaths[i] = inputPath

		// Get file size
		fileInfo, err := os.Stat(inputPath)
		if err == nil {
			totalInputSize += fileInfo.Size()
		}
	}

	// Create ordered list of input files
	orderedInputs := make([]string, len(files))
	for i, idx := range fileOrder {
		orderedInputs[i] = inputPaths[idx]
	}

	// Merge PDFs using pdfcpu
	args := append([]string{
		"merge",
		outputPath,
	}, orderedInputs...)

	cmd := exec.Command("pdfcpu", args...)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to merge PDFs: " + string(output),
		})
		return
	}

	// Get merged file size
	mergedFileInfo, err := os.Stat(outputPath)
	var mergedSize int64
	if err != nil {
		mergedSize = 0
	} else {
		mergedSize = mergedFileInfo.Size()
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=merges&filename=%s-merged.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "PDF merge successful",
		"fileUrl":        fileURL,
		"filename":       fmt.Sprintf("%s-merged.pdf", uniqueID),
		"mergedSize":     mergedSize,
		"totalInputSize": totalInputSize,
		"fileCount":      len(files),
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           services.OperationCost,
		},
	})
}
