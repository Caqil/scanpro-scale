// internal/handlers/pdf_text_editor_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PDFTextEditorHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

type TextBlock struct {
	Text   string  `json:"text"`
	X0     float64 `json:"x0"`
	Y0     float64 `json:"y0"`
	X1     float64 `json:"x1"`
	Y1     float64 `json:"y1"`
	Font   string  `json:"font"`
	Size   float64 `json:"size"`
	Color  int     `json:"color"`
	Flags  int     `json:"flags,omitempty"`
	Width  float64 `json:"width,omitempty"`
	Height float64 `json:"height,omitempty"`
}

type PDFPage struct {
	PageNumber int         `json:"page_number"`
	Width      float64     `json:"width"`
	Height     float64     `json:"height"`
	Texts      []TextBlock `json:"texts"`
}

type PDFTextData struct {
	Pages    []PDFPage `json:"pages"`
	Metadata struct {
		TotalPages       int    `json:"total_pages"`
		TotalTextBlocks  int    `json:"total_text_blocks"`
		ExtractionMethod string `json:"extraction_method"`
	} `json:"metadata"`
}

func NewPDFTextEditorHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFTextEditorHandler {
	return &PDFTextEditorHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// ExtractTextToPDF extracts text from PDF using Python
func (h *PDFTextEditorHandler) ExtractTextToPDF(c *gin.Context) {
	// Get user ID and process billing
	userID, exists := c.Get("userId")
	if exists && userID != nil {
		result, err := h.balanceService.ProcessOperation(userID.(string), "ExtractText")
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
					"operationCost":           constants.OperationCost,
				},
			})
			return
		}
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
	if strings.ToLower(filepath.Ext(file.Filename)) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Create unique session ID
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, sessionID+"-input.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Extract text using Python script
	extractedData, err := h.extractTextWithPython(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to extract text: " + err.Error(),
		})
		return
	}

	// Check if we actually extracted any text
	totalTextBlocks := 0
	for _, page := range extractedData.Pages {
		totalTextBlocks += len(page.Texts)
	}

	if totalTextBlocks == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No text found in the PDF. The PDF may contain only images or be password protected.",
		})
		return
	}

	// Save extracted data to session
	sessionDir := filepath.Join(h.config.PublicDir, "editor-sessions")
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create session directory: " + err.Error(),
		})
		return
	}

	sessionFile := filepath.Join(sessionDir, sessionID+".json")
	jsonData, err := json.Marshal(extractedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to serialize extracted data: " + err.Error(),
		})
		return
	}

	if err := os.WriteFile(sessionFile, jsonData, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save session data: " + err.Error(),
		})
		return
	}

	// Update metadata
	extractedData.Metadata.TotalPages = len(extractedData.Pages)
	extractedData.Metadata.TotalTextBlocks = totalTextBlocks
	extractedData.Metadata.ExtractionMethod = "PyMuPDF"

	// Return response
	response := gin.H{
		"success":       true,
		"message":       fmt.Sprintf("Text extracted successfully from %d pages with %d text blocks", len(extractedData.Pages), totalTextBlocks),
		"extractedData": extractedData,
		"sessionId":     sessionID,
		"originalName":  file.Filename,
	}

	// Add billing info if available
	if exists && userID != nil {
		result, _ := h.balanceService.ProcessOperation(userID.(string), "ExtractText")
		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.OperationCost,
		}
	}

	c.JSON(http.StatusOK, response)
}

// SaveEditedPDF creates a new PDF from edited text data
func (h *PDFTextEditorHandler) SaveEditedPDF(c *gin.Context) {
	// Get user ID and process billing
	userID, exists := c.Get("userId")
	if exists && userID != nil {
		result, err := h.balanceService.ProcessOperation(userID.(string), "SaveEditedText")
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
					"operationCost":           constants.OperationCost,
				},
			})
			return
		}
	}

	// Get parameters
	sessionID := c.PostForm("sessionId")
	editedDataStr := c.PostForm("editedData")

	if sessionID == "" || editedDataStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing sessionId or editedData",
		})
		return
	}

	// Parse edited data
	var editedData PDFTextData
	if err := json.Unmarshal([]byte(editedDataStr), &editedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid edited data format: " + err.Error(),
		})
		return
	}

	// Generate output PDF
	outputPath := filepath.Join(h.config.PublicDir, "edited", sessionID+"-edited.pdf")
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create output directory: " + err.Error(),
		})
		return
	}

	// Create PDF from edited data using Python script
	if err := h.createPDFFromData(editedData, outputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create PDF: " + err.Error(),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=edited&filename=%s-edited.pdf", sessionID)

	// Return response
	response := gin.H{
		"success":  true,
		"message":  "PDF saved successfully",
		"fileUrl":  fileURL,
		"filename": fmt.Sprintf("%s-edited.pdf", sessionID),
	}

	// Add billing info if available
	if exists && userID != nil {
		result, _ := h.balanceService.ProcessOperation(userID.(string), "SaveEditedText")
		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.OperationCost,
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetEditSession retrieves session data
func (h *PDFTextEditorHandler) GetEditSession(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing sessionId parameter",
		})
		return
	}

	sessionFile := filepath.Join(h.config.PublicDir, "editor-sessions", sessionID+".json")
	if _, err := os.Stat(sessionFile); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Session not found",
		})
		return
	}

	data, err := os.ReadFile(sessionFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read session data: " + err.Error(),
		})
		return
	}

	var extractedData PDFTextData
	if err := json.Unmarshal(data, &extractedData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse session data: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"extractedData": extractedData,
		"sessionId":     sessionID,
	})
}

// extractTextWithPython extracts text using PyMuPDF
func (h *PDFTextEditorHandler) extractTextWithPython(pdfPath string) (*PDFTextData, error) {
	pythonScript := `#!/usr/bin/env python3
import sys
import json

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF not installed"}))
    sys.exit(1)

def extract_text_with_positions(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        data = {"pages": []}

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_rect = page.rect
            page_data = {
                "page_number": page_num + 1,
                "width": float(page_rect.width),
                "height": float(page_rect.height),
                "texts": []
            }

            blocks = page.get_text("dict")
            for block in blocks.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text_content = span.get("text", "").strip()
                            if not text_content:
                                continue
                                
                            bbox = span.get("bbox", [0, 0, 0, 0])
                            font_info = span.get("font", "Helvetica")
                            font_size = span.get("size", 12)
                            color = span.get("color", 0)
                            flags = span.get("flags", 0)
                            
                            text_info = {
                                "text": text_content,
                                "x0": float(bbox[0]),
                                "y0": float(bbox[1]),
                                "x1": float(bbox[2]),
                                "y1": float(bbox[3]),
                                "font": font_info,
                                "size": float(font_size),
                                "color": int(color),
                                "flags": int(flags),
                                "width": float(bbox[2] - bbox[0]),
                                "height": float(bbox[3] - bbox[1])
                            }
                            
                            page_data["texts"].append(text_info)
            
            # Sort text blocks by position (top to bottom, left to right)
            page_data["texts"].sort(key=lambda x: (x["y0"], x["x0"]))
            data["pages"].append(page_data)

        doc.close()
        return data
        
    except Exception as e:
        return {"error": f"Failed to extract text: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: script.py <pdf_path>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = extract_text_with_positions(pdf_path)
    print(json.dumps(result))
`

	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "extract_text_"+uuid.New().String()+".py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0755); err != nil {
		return nil, fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	cmd := exec.Command("python3", scriptPath, pdfPath)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to execute Python script: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("failed to parse Python output: %w", err)
	}

	if errMsg, exists := result["error"]; exists {
		return nil, fmt.Errorf("Python script error: %v", errMsg)
	}

	var data PDFTextData
	if err := json.Unmarshal(output, &data); err != nil {
		return nil, fmt.Errorf("failed to convert Python output: %w", err)
	}

	return &data, nil
}

// createPDFFromData creates a PDF from text data using Python
func (h *PDFTextEditorHandler) createPDFFromData(data PDFTextData, outputPath string) error {
	pythonScript := `#!/usr/bin/env python3
import sys
import json

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.colors import Color
except ImportError:
    print("ReportLab not installed")
    sys.exit(1)

def create_pdf_from_json(data, output_path):
    try:
        c = canvas.Canvas(output_path)
        
        for page in data["pages"]:
            # Set page size
            page_width = page.get("width", 612)
            page_height = page.get("height", 792)
            c.setPageSize((page_width, page_height))
            
            for text_info in page["texts"]:
                try:
                    # Set font
                    font_name = text_info.get("font", "Helvetica")
                    font_size = text_info.get("size", 12)
                    
                    # Map font names to ReportLab fonts
                    if "Times" in font_name:
                        if "Bold" in font_name:
                            font_name = "Times-Bold"
                        elif "Italic" in font_name:
                            font_name = "Times-Italic"
                        else:
                            font_name = "Times-Roman"
                    elif "Courier" in font_name:
                        if "Bold" in font_name:
                            font_name = "Courier-Bold"
                        elif "Oblique" in font_name:
                            font_name = "Courier-Oblique"
                        else:
                            font_name = "Courier"
                    else:
                        if "Bold" in font_name:
                            font_name = "Helvetica-Bold"
                        elif "Oblique" in font_name or "Italic" in font_name:
                            font_name = "Helvetica-Oblique"
                        else:
                            font_name = "Helvetica"
                    
                    c.setFont(font_name, font_size)
                    
                    # Set color
                    color_int = text_info.get("color", 0)
                    if color_int == 0:
                        c.setFillColorRGB(0, 0, 0)  # Black
                    else:
                        r = ((color_int >> 16) & 255) / 255.0
                        g = ((color_int >> 8) & 255) / 255.0
                        b = (color_int & 255) / 255.0
                        c.setFillColorRGB(r, g, b)
                    
                    # Draw text
                    x = text_info.get("x0", 0)
                    y = page_height - text_info.get("y0", 0)  # Flip Y coordinate
                    text = text_info.get("text", "")
                    
                    c.drawString(x, y, text)
                    
                except Exception as e:
                    print(f"Error drawing text block: {e}")
                    continue
            
            c.showPage()
        
        c.save()
        print("PDF created successfully")
        
    except Exception as e:
        print(f"Error creating PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: script.py <json_data> <output_path>")
        sys.exit(1)
    
    json_data = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        data = json.loads(json_data)
        create_pdf_from_json(data, output_path)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
`

	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "create_pdf_"+uuid.New().String()+".py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0755); err != nil {
		return fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	cmd := exec.Command("python3", scriptPath, string(jsonData), outputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to execute PDF creation script: %w, output: %s", err, string(output))
	}

	return nil
}
