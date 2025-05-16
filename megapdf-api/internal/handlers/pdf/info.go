// internal/handlers/pdf/info.go
package pdf

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"megapdf-api/internal/services/pdf"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// InfoHandler handles retrieving PDF metadata
type InfoHandler struct {
	pdfService *pdf.InfoService
	uploadDir  string
}

// NewInfoHandler creates a new info handler
func NewInfoHandler(pdfService *pdf.InfoService, uploadDir string) *InfoHandler {
	return &InfoHandler{
		pdfService: pdfService,
		uploadDir:  uploadDir,
	}
}

// Register registers the routes for this handler
func (h *InfoHandler) Register(router *gin.RouterGroup) {
	router.POST("/info", h.GetPDFInfo)
}

// GetPDFInfo handles retrieving information about a PDF
func (h *InfoHandler) GetPDFInfo(c *gin.Context) {
	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32 MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to parse form",
			"success": false,
		})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No PDF file provided",
			"success": false,
		})
		return
	}
	defer file.Close()

	// Verify it's a PDF
	if filepath.Ext(header.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Only PDF files can be processed",
			"success": false,
		})
		return
	}

	// Create a temporary file to save the uploaded PDF
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.uploadDir, fmt.Sprintf("%s-info.pdf", sessionID))
	
	// Save the uploaded file
	inputFile, err := os.Create(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	defer inputFile.Close()
	
	// Copy the uploaded file content
	if _, err := io.Copy(inputFile, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save uploaded file",
			"success": false,
		})
		return
	}
	
	// Close input file to ensure it's flushed to disk
	inputFile.Close()

	// Get PDF info
	info, err := h.pdfService.GetPDFInfo(c, inputPath)
	
	// Clean up temporary file
	os.Remove(inputPath)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   fmt.Sprintf("Failed to get PDF info: %v", err),
			"success": false,
		})
		return
	}

	// Return PDF information
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"fileName":       header.Filename,
		"fileSize":       info.FileSize,
		"pages":          info.Pages,
		"encrypted":      info.Encrypted,
		"signed":         info.Signed,
		"version":        info.Version,
		"title":          info.Title,
		"author":         info.Author,
		"subject":        info.Subject,
		"keywords":       info.Keywords,
		"creator":        info.Creator,
		"producer":       info.Producer,
		"creationDate":   info.CreationDate,
		"modificationDate": info.ModificationDate,
		"pageSize": gin.H{
			"width":  info.PageSize.Width,
			"height": info.PageSize.Height,
			"unit":   info.PageSize.Unit,
		},
		"permissions": gin.H{
			"allowPrinting":      info.Permissions.AllowPrinting,
			"allowModify":        info.Permissions.AllowModify,
			"allowCopy":          info.Permissions.AllowCopy,
			"allowAnnotate":      info.Permissions.AllowAnnotate,
			"allowForms":         info.Permissions.AllowForms,
			"allowExtract":       info.Permissions.AllowExtract,
			"allowAssemble":      info.Permissions.AllowAssemble,
			"allowHighResPrint":  info.Permissions.AllowHighResPrint,
		},
		"fonts":           info.Fonts,
		"hasAttachments":  info.HasAttachments,
		"hasAcroForms":    info.HasAcroForms,
		"hasJavaScript":   info.HasJavaScript,
		"hasEmbeddedFiles": info.HasEmbeddedFiles,
		"hasXFA":          info.HasXFA,
	})
}