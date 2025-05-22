// internal/handlers/pdf_edit_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PDFEditHandler handles PDF editing operations
type PDFEditHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

// NewPDFEditHandler creates a new PDF editing handler
func NewPDFEditHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFEditHandler {
	return &PDFEditHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// PDFContent represents the structure of a PDF document
type PDFContent struct {
	Pages    []PDFPage     `json:"pages"`
	Elements []PDFElement  `json:"elements"`
	Images   []PDFImage    `json:"images"`
	Fonts    []PDFFont     `json:"fonts"`
	Metadata PDFMetadata   `json:"metadata"`
	FormData []PDFFormData `json:"formData"`
}

// PDFPage represents a page in the PDF
type PDFPage struct {
	Number   int     `json:"number"`
	Width    float64 `json:"width"`
	Height   float64 `json:"height"`
	Contents string  `json:"contents"`
}

// PDFElement represents a text element in the PDF
type PDFElement struct {
	ID       string  `json:"id"`
	Type     string  `json:"type"` // text, checkbox, etc.
	Text     string  `json:"text"`
	Font     string  `json:"font"`
	FontSize float64 `json:"fontSize"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Width    float64 `json:"width"`
	Height   float64 `json:"height"`
	PageNum  int     `json:"pageNum"`
	Checked  bool    `json:"checked,omitempty"` // For checkboxes
}

// PDFImage represents an image in the PDF
type PDFImage struct {
	ID      string  `json:"id"`
	Path    string  `json:"path"`
	X       float64 `json:"x"`
	Y       float64 `json:"y"`
	Width   float64 `json:"width"`
	Height  float64 `json:"height"`
	PageNum int     `json:"pageNum"`
}

// PDFFont represents a font in the PDF
type PDFFont struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
	Path string `json:"path"`
}

// PDFMetadata represents metadata of the PDF
type PDFMetadata struct {
	Title    string `json:"title"`
	Author   string `json:"author"`
	Subject  string `json:"subject"`
	Keywords string `json:"keywords"`
	Creator  string `json:"creator"`
}

// PDFFormData represents form data in the PDF
type PDFFormData struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Name    string `json:"name"`
	Value   string `json:"value"`
	PageNum int    `json:"pageNum"`
}

// UploadForEdit godoc
// @Summary Upload PDF for editing
// @Description Uploads a PDF and extracts its content for editing
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to edit"
// @Success 200 {object} object{success=boolean,message=string,editId=string,content=PDFContent}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/edit/upload [post]
func (h *PDFEditHandler) UploadForEdit(c *gin.Context) {
	// Check if user is authorized
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Process operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "edit")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process operation: " + err.Error()})
		return
	}
	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{"error": result.Error})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file provided or invalid file"})
		return
	}
	defer file.Close()

	// Validate file type
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF files are supported"})
		return
	}

	// Generate unique ID for this edit session
	editID := uuid.New().String()

	// Create directories for this edit session
	editDir := filepath.Join(h.config.TempDir, editID)
	outputDir := filepath.Join(editDir, "output")
	os.MkdirAll(outputDir, 0755)

	// Save the uploaded file
	inputPath := filepath.Join(editDir, "input.pdf")
	outFile, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded file: " + err.Error()})
		return
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded file: " + err.Error()})
		return
	}

	// Extract PDF content
	content, err := h.extractPDFContent(inputPath, outputDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract PDF content: " + err.Error()})
		return
	}

	// Return success with extracted content
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "PDF uploaded and prepared for editing",
		"editId":  editID,
		"content": content,
	})
}

// SaveEdit godoc
// @Summary Save edited PDF
// @Description Saves the changes made to a PDF
// @Tags pdf
// @Accept json
// @Produce json
// @Param request body object{editId=string,content=PDFContent} true "Edit information"
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/edit/save [post]
func (h *PDFEditHandler) SaveEdit(c *gin.Context) {
	// Parse request
	var request struct {
		EditID  string     `json:"editId"`
		Content PDFContent `json:"content"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format: " + err.Error()})
		return
	}

	// Validate required fields
	if request.EditID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Edit ID is required"})
		return
	}

	// Get paths
	editDir := filepath.Join(h.config.TempDir, request.EditID)
	inputPath := filepath.Join(editDir, "input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "edited", request.EditID+".pdf")

	// Make sure output directory exists
	os.MkdirAll(filepath.Join(h.config.PublicDir, "edited"), 0755)

	// Check if input file exists
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Edit session not found or expired"})
		return
	}

	// Create edited PDF
	err := h.createEditedPDF(request.Content, inputPath, outputPath, editDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create edited PDF: " + err.Error()})
		return
	}

	// Return success response
	fileURL := fmt.Sprintf("/api/file?folder=edited&filename=%s.pdf", request.EditID)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "PDF edited successfully",
		"fileUrl": fileURL,
	})
}

// extractPDFContent extracts all content from a PDF file
// extractPDFContent extracts all content from a PDF file
func (h *PDFEditHandler) extractPDFContent(pdfPath, outputDir string) (*PDFContent, error) {
	content := &PDFContent{}

	// Create subdirectories for extraction
	imagesDir := filepath.Join(outputDir, "images")
	fontsDir := filepath.Join(outputDir, "fonts")
	contentDir := filepath.Join(outputDir, "content")
	pagesDir := filepath.Join(outputDir, "pages")
	metaDir := filepath.Join(outputDir, "meta")

	os.MkdirAll(imagesDir, 0755)
	os.MkdirAll(fontsDir, 0755)
	os.MkdirAll(contentDir, 0755)
	os.MkdirAll(pagesDir, 0755)
	os.MkdirAll(metaDir, 0755)

	// 1. Extract images
	fmt.Println("Extracting images...")
	cmd := exec.Command("pdfcpu", "extract", "-mode", "image", pdfPath, imagesDir)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Warning: Failed to extract images: %v\n", err)
	}

	// Process extracted images
	imageFiles, err := filepath.Glob(filepath.Join(imagesDir, "*"))
	if err == nil {
		for i, imgPath := range imageFiles {
			image := PDFImage{
				ID: fmt.Sprintf("img_%d", i+1),
				Path: fmt.Sprintf("/api/file?folder=temp/%s/output/images&filename=%s",
					filepath.Base(outputDir), filepath.Base(imgPath)),
				X:       100,
				Y:       100 + float64(i*150),
				Width:   200,
				Height:  150,
				PageNum: 1,
			}
			content.Images = append(content.Images, image)
		}
	}

	// 2. Extract fonts
	fmt.Println("Extracting fonts...")
	cmd = exec.Command("pdfcpu", "extract", "-mode", "font", pdfPath, fontsDir)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Warning: Failed to extract fonts: %v\n", err)
	}

	// Process extracted fonts
	fontFiles, err := filepath.Glob(filepath.Join(fontsDir, "*"))
	if err == nil {
		for i, fontPath := range fontFiles {
			font := PDFFont{
				ID:   fmt.Sprintf("font_%d", i+1),
				Name: filepath.Base(fontPath),
				Type: "Type1",
				Path: fontPath,
			}
			content.Fonts = append(content.Fonts, font)
		}
	}

	// 3. Extract metadata
	fmt.Println("Extracting metadata...")
	cmd = exec.Command("pdfcpu", "extract", "-mode", "meta", pdfPath, metaDir)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Warning: Failed to extract metadata: %v\n", err)
	} else {
		metaFiles, err := filepath.Glob(filepath.Join(metaDir, "*.xml"))
		if err == nil && len(metaFiles) > 0 {
			content.Metadata = PDFMetadata{
				Title:    "Document Title",
				Author:   "Author",
				Subject:  "Subject",
				Keywords: "Keywords",
				Creator:  "Creator",
			}
		}
	}

	// 4. Extract page content
	fmt.Println("Extracting page content...")
	cmd = exec.Command("pdfcpu", "extract", "-mode", "content", pdfPath, contentDir)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Warning: Failed to extract page content: %v\n", err)
	}

	// 5. Extract pages
	fmt.Println("Extracting pages...")
	cmd = exec.Command("pdfcpu", "extract", "-mode", "page", pdfPath, pagesDir)
	if err := cmd.Run(); err != nil {
		fmt.Printf("Warning: Failed to extract pages: %v\n", err)
	}

	// Process pages and content
	// Process pages and content
	pageFiles, err := filepath.Glob(filepath.Join(pagesDir, "*.pdf"))
	if err == nil {
		// Sort page files by page number
		// This is simplified - in real implementation, ensure proper sorting

		for i := range pageFiles {
			pageNum := i + 1

			// Create page entry
			page := PDFPage{
				Number: pageNum,
				Width:  595, // Default A4 width in points
				Height: 842, // Default A4 height in points
			}

			// Try to get content file for this page
			contentFile := filepath.Join(contentDir, fmt.Sprintf("%d.txt", pageNum))
			if contentData, err := ioutil.ReadFile(contentFile); err == nil {
				page.Contents = string(contentData)

				// Parse content to extract text elements
				elements := h.parsePageContent(string(contentData), pageNum)
				content.Elements = append(content.Elements, elements...)
			}

			content.Pages = append(content.Pages, page)
		}
	}
	return content, nil
}

// parsePageContent extracts text elements from page content
func (h *PDFEditHandler) parsePageContent(content string, pageNum int) []PDFElement {
	var elements []PDFElement

	// This is a simplified parser for demonstration
	// In a real implementation, you'd need to properly parse the PDF content stream

	// Split content into lines
	lines := strings.Split(content, "\n")

	var currentFont string = "Helvetica"
	var currentFontSize float64 = 12
	yPos := 50.0

	for i, line := range lines {
		// Skip empty lines
		if strings.TrimSpace(line) == "" {
			continue
		}

		// Look for text commands
		if strings.Contains(line, "BT") && strings.Contains(line, "ET") {
			// Extract text between parentheses
			text := extractTextBetween(line, "(", ")")
			if text != "" {
				// Try to extract position
				x, y := extractPosition(line)

				// Look for font commands
				font := extractFont(line)
				if font != "" {
					currentFont = font
				}

				// Look for font size
				fontSize := extractFontSize(line)
				if fontSize > 0 {
					currentFontSize = fontSize
				}

				element := PDFElement{
					ID:       fmt.Sprintf("text_%d", i+1),
					Type:     "text",
					Text:     text,
					Font:     currentFont,
					FontSize: currentFontSize,
					X:        x,
					Y:        y,
					Width:    float64(len(text)) * (currentFontSize * 0.6), // Rough estimation
					Height:   currentFontSize * 1.2,
					PageNum:  pageNum,
				}

				elements = append(elements, element)
				yPos += element.Height * 1.2
			}
		}

		// Look for checkbox-like elements
		if strings.Contains(line, "re") && strings.Contains(line, "S") {
			// This might be a rectangle that could be a checkbox
			// In real implementation, you'd need more sophisticated detection
			if isLikelyCheckbox(line) {
				x, y := extractPosition(line)
				width, height := extractDimensions(line)

				if width > 0 && height > 0 && width < 20 && height < 20 &&
					width == height { // Likely a square checkbox
					element := PDFElement{
						ID:      fmt.Sprintf("checkbox_%d", i+1),
						Type:    "checkbox",
						X:       x,
						Y:       y,
						Width:   width,
						Height:  height,
						PageNum: pageNum,
						Checked: false, // Default unchecked
					}
					elements = append(elements, element)
				}
			}
		}
	}

	return elements
}

// extractTextBetween extracts text between specified delimiters
func extractTextBetween(text, start, end string) string {
	startIdx := strings.Index(text, start)
	if startIdx == -1 {
		return ""
	}

	startIdx += len(start)
	endIdx := strings.Index(text[startIdx:], end)
	if endIdx == -1 {
		return ""
	}

	return text[startIdx : startIdx+endIdx]
}

// extractPosition tries to extract X and Y coordinates from content
func extractPosition(line string) (float64, float64) {
	// This is a simplified approach - in a real implementation,
	// you would need more sophisticated parsing of the PDF content stream

	// Look for common positioning operators like "Td" or "Tm"
	for _, op := range []string{"Td", "Tm", "cm"} {
		idx := strings.Index(line, op)
		if idx > 0 {
			// Try to extract numbers before the operator
			parts := strings.Fields(line[:idx])
			if len(parts) >= 2 {
				x, errX := strconv.ParseFloat(parts[len(parts)-2], 64)
				y, errY := strconv.ParseFloat(parts[len(parts)-1], 64)
				if errX == nil && errY == nil {
					return x, y
				}
			}
		}
	}

	// Default positions if extraction fails
	return 100, 100
}

// extractFont tries to extract font name from content
func extractFont(line string) string {
	// Look for font selection operator
	idx := strings.Index(line, "Tf")
	if idx > 0 {
		// Try to extract font name before the operator
		parts := strings.Fields(line[:idx])
		if len(parts) >= 1 {
			fontName := parts[len(parts)-2]
			// Remove leading slash if present
			return strings.TrimPrefix(fontName, "/")
		}
	}

	return ""
}

// extractFontSize tries to extract font size from content
func extractFontSize(line string) float64 {
	// Look for font selection operator
	idx := strings.Index(line, "Tf")
	if idx > 0 {
		// Try to extract font size before the operator
		parts := strings.Fields(line[:idx])
		if len(parts) >= 1 {
			size, err := strconv.ParseFloat(parts[len(parts)-1], 64)
			if err == nil {
				return size
			}
		}
	}

	return 0
}

// extractDimensions tries to extract width and height from a rectangle
func extractDimensions(line string) (float64, float64) {
	// Look for rectangle operator
	idx := strings.Index(line, "re")
	if idx > 0 {
		// Try to extract dimensions before the operator
		parts := strings.Fields(line[:idx])
		if len(parts) >= 2 {
			width, errW := strconv.ParseFloat(parts[len(parts)-2], 64)
			height, errH := strconv.ParseFloat(parts[len(parts)-1], 64)
			if errW == nil && errH == nil {
				return width, height
			}
		}
	}

	return 0, 0
}

// isLikelyCheckbox determines if a line is likely describing a checkbox
func isLikelyCheckbox(line string) bool {
	// This is a simplified approach - in a real implementation,
	// you would use more sophisticated heuristics

	// Check if it's a small rectangle (potential checkbox)
	if strings.Contains(line, "re") && strings.Contains(line, "S") {
		parts := strings.Fields(strings.TrimSpace(line))
		if len(parts) >= 4 {
			width, errW := strconv.ParseFloat(parts[len(parts)-3], 64)
			height, errH := strconv.ParseFloat(parts[len(parts)-2], 64)
			if errW == nil && errH == nil {
				// If it's a small square, it might be a checkbox
				return width > 0 && width < 20 && height > 0 && height < 20 &&
					math.Abs(width-height) < 1 // Square-ish
			}
		}
	}

	return false
}

// createEditedPDF generates a new PDF from the edited content
func (h *PDFEditHandler) createEditedPDF(content PDFContent, inputPath, outputPath, editDir string) error {
	// Create a temporary JSON file for the PDF creation
	jsonPath := filepath.Join(editDir, "pdf.json")

	// Convert our content to the format expected by pdfcpu create
	createJSON := generatePDFCreateJSON(content)

	// Write JSON to file
	jsonData, err := json.MarshalIndent(createJSON, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal JSON: %w", err)
	}

	err = ioutil.WriteFile(jsonPath, jsonData, 0644)
	if err != nil {
		return fmt.Errorf("failed to write JSON file: %w", err)
	}

	// Create the PDF
	cmd := exec.Command("pdfcpu", "create", jsonPath, outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to create PDF: %w - %s", err, string(output))
	}

	return nil
}

// generatePDFCreateJSON converts our content structure to pdfcpu create JSON format
func generatePDFCreateJSON(content PDFContent) map[string]interface{} {
	// Create PDF structure according to pdfcpu create format
	// See: https://pdfcpu.io/generate/create/

	pdfJSON := map[string]interface{}{
		"creator": "MegaPDF Editor",
		"header": map[string]interface{}{
			"center": map[string]interface{}{
				"fontSize": 12,
			},
		},
		"pages": []map[string]interface{}{},
	}

	// Add pages
	for _, page := range content.Pages {
		pageJSON := map[string]interface{}{
			"content": []map[string]interface{}{},
		}

		// Add text elements for this page
		for _, elem := range content.Elements {
			if elem.PageNum == page.Number {
				if elem.Type == "text" {
					textElem := map[string]interface{}{
						"text": map[string]interface{}{
							"value":     elem.Text,
							"fontName":  elem.Font,
							"fontSize":  elem.FontSize,
							"position":  []float64{elem.X, elem.Y},
							"rendering": "fill",
						},
					}
					pageJSON["content"] = append(pageJSON["content"].([]map[string]interface{}), textElem)
				} else if elem.Type == "checkbox" {
					// Handle checkbox
					boxElem := map[string]interface{}{
						"box": map[string]interface{}{
							"position":  []float64{elem.X, elem.Y},
							"width":     elem.Width,
							"height":    elem.Height,
							"border":    true,
							"fillColor": "white",
						},
					}
					pageJSON["content"] = append(pageJSON["content"].([]map[string]interface{}), boxElem)

					// If checked, add a check mark
					if elem.Checked {
						checkElem := map[string]interface{}{
							"text": map[string]interface{}{
								"value":     "✓",
								"fontName":  "Helvetica",
								"fontSize":  elem.Height * 0.8,
								"position":  []float64{elem.X + elem.Width*0.25, elem.Y + elem.Height*0.75},
								"rendering": "fill",
							},
						}
						pageJSON["content"] = append(pageJSON["content"].([]map[string]interface{}), checkElem)
					}
				}
			}
		}

		// Add images for this page
		for _, img := range content.Images {
			if img.PageNum == page.Number {
				imgElem := map[string]interface{}{
					"image": map[string]interface{}{
						"path":     img.Path,
						"position": []float64{img.X, img.Y},
						"width":    img.Width,
						"height":   img.Height,
					},
				}
				pageJSON["content"] = append(pageJSON["content"].([]map[string]interface{}), imgElem)
			}
		}

		pdfJSON["pages"] = append(pdfJSON["pages"].([]map[string]interface{}), pageJSON)
	}

	return pdfJSON
}
