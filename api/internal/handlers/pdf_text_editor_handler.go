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
	Text  string  `json:"text"`
	X0    float64 `json:"x0"`
	Y0    float64 `json:"y0"`
	X1    float64 `json:"x1"`
	Y1    float64 `json:"y1"`
	Font  string  `json:"font"`
	Size  float64 `json:"size"`
	Color int     `json:"color"`
}

type PDFPage struct {
	PageNumber int         `json:"page_number"`
	Width      float64     `json:"width"`
	Height     float64     `json:"height"`
	Texts      []TextBlock `json:"texts"`
}

type PDFTextData struct {
	Pages []PDFPage `json:"pages"`
}

func NewPDFTextEditorHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFTextEditorHandler {
	return &PDFTextEditorHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// ExtractTextToPDF godoc
// @Summary Extract text from PDF to JSON format for editing
// @Description Extracts all text blocks with positions from a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to extract text from (max 50MB)"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,extractedData=object,sessionId=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/extract-text [post]
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

	// Return response
	response := gin.H{
		"success":       true,
		"message":       "Text extracted successfully",
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

// SaveEditedPDF godoc
// @Summary Save edited text data back to PDF
// @Description Creates a new PDF from edited text data
// @Tags pdf
// @Accept json
// @Produce json
// @Param sessionId formData string true "Session ID from text extraction"
// @Param editedData formData string true "JSON string of edited text data"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/save-edited-text [post]
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

// GetEditSession godoc
// @Summary Get existing edit session data
// @Description Retrieves previously extracted text data for editing
// @Tags pdf
// @Accept json
// @Produce json
// @Param sessionId query string true "Session ID"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,extractedData=object,sessionId=string}
// @Failure 400 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/edit-session [get]
func (h *PDFTextEditorHandler) GetEditSession(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing sessionId parameter",
		})
		return
	}

	// Load session data
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

// Helper function to extract text using Python script
func (h *PDFTextEditorHandler) extractTextWithPython(pdfPath string) (*PDFTextData, error) {
	// Create a temporary Python script
	pythonScript := `
import fitz  # PyMuPDF
import json
import sys

def extract_text_with_positions(pdf_path):
    doc = fitz.open(pdf_path)
    data = {"pages": []}

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_data = {
            "page_number": page_num + 1,
            "width": page.rect.width,
            "height": page.rect.height,
            "texts": []
        }

        for block in page.get_text("dict")["blocks"]:
            if block["type"] == 0:  # Text block
                for line in block["lines"]:
                    for span in line["spans"]:
                        text_info = {
                            "text": span["text"],
                            "x0": span["bbox"][0],
                            "y0": span["bbox"][1],
                            "x1": span["bbox"][2],
                            "y1": span["bbox"][3],
                            "font": span["font"],
                            "size": span["size"],
                            "color": span["color"]
                        }
                        page_data["texts"].append(text_info)
        data["pages"].append(page_data)

    doc.close()
    return data

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    extracted_data = extract_text_with_positions(pdf_path)
    print(json.dumps(extracted_data))
`

	// Write Python script to temp file
	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "extract_text.py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0644); err != nil {
		return nil, fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	// Execute Python script
	cmd := exec.Command("python3", scriptPath, pdfPath)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to execute extraction script: %w", err)
	}

	// Parse output
	var data PDFTextData
	if err := json.Unmarshal(output, &data); err != nil {
		return nil, fmt.Errorf("failed to parse extraction output: %w", err)
	}

	return &data, nil
}

// Helper function to create PDF from edited data using Python script
func (h *PDFTextEditorHandler) createPDFFromData(data PDFTextData, outputPath string) error {
	// Create a temporary Python script
	pythonScript := `
import json
import sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_pdf_from_json(data, output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    
    for page in data["pages"]:
        c.setPageSize((page["width"], page["height"]))
        
        for text_info in page["texts"]:
            try:
                c.setFont(text_info["font"], text_info["size"])
            except:
                c.setFont("Helvetica", text_info["size"])  # Fallback font
            
            # Convert color
            color_int = text_info["color"]
            r = ((color_int >> 16) & 255) / 255.0
            g = ((color_int >> 8) & 255) / 255.0
            b = (color_int & 255) / 255.0
            c.setFillColorRGB(r, g, b)
            
            # Draw text (adjust Y coordinate)
            c.drawString(text_info["x0"], page["height"] - text_info["y0"], text_info["text"])
        
        c.showPage()
    
    c.save()

if __name__ == "__main__":
    data_str = sys.argv[1]
    output_path = sys.argv[2]
    data = json.loads(data_str)
    create_pdf_from_json(data, output_path)
`

	// Write Python script to temp file
	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "create_pdf.py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0644); err != nil {
		return fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	// Convert data to JSON string
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	// Execute Python script
	cmd := exec.Command("python3", scriptPath, string(jsonData), outputPath)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to execute PDF creation script: %w", err)
	}

	return nil
}
