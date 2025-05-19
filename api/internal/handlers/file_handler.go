// internal/handlers/file_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	config *config.Config
}

func NewFileHandler(cfg *config.Config) *FileHandler {
	return &FileHandler{config: cfg}
}

// ServeFile godoc
// @Summary Serve a processed file
// @Description Serves a file from the public directory for download
// @Tags file
// @Accept json
// @Produce octet-stream
// @Param folder query string true "Folder name where the file is stored"
// @Param filename query string true "Name of the file to serve"
// @Success 200 {file} binary "The requested file"
// @Failure 400 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/file [get]
func (h *FileHandler) ServeFile(c *gin.Context) {
	// Get query parameters
	folder := c.Query("folder")
	filename := c.Query("filename")

	// Validate parameters
	if folder == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required parameters: folder and filename",
		})
		return
	}

	// List of allowed folders
	allowedFolders := []string{
		"conversions",
		"compressions",
		"merges",
		"splits",
		"rotations",
		"watermarked",
		"watermarks",
		"protected",
		"unlocked",
		"signatures",
		"ocr",
		"edited",
		"processed",
		"unwatermarked",
		"redacted",
		"repaired",
		"pagenumbers",
	}

	// Handle subfolder paths (like "splits/abc123")
	folderParts := strings.Split(folder, "/")
	baseFolder := folderParts[0]

	// Check if base folder is allowed
	folderAllowed := false
	for _, allowedFolder := range allowedFolders {
		if baseFolder == allowedFolder {
			folderAllowed = true
			break
		}
	}

	if !folderAllowed {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid folder specified",
		})
		return
	}

	// Sanitize filename to prevent directory traversal
	sanitizedFilename := filepath.Base(filename)
	if sanitizedFilename != filename {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid filename",
		})
		return
	}

	// Full path to the file
	filePath := filepath.Join(h.config.PublicDir, folder, sanitizedFilename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "File not found: " + filePath,
		})
		return
	}

	// Get file extension for content type
	ext := filepath.Ext(filename)
	contentType := getContentType(ext)

	// Set headers for file download
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, sanitizedFilename))
	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	// Serve the file
	c.File(filePath)
}

// Helper function to get content type from file extension
func getContentType(ext string) string {
	if ext == "" {
		return "application/octet-stream"
	}

	// Remove the leading dot
	ext = strings.ToLower(ext)
	if ext[0] == '.' {
		ext = ext[1:]
	}

	switch ext {
	case "pdf":
		return "application/pdf"
	case "jpg", "jpeg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "gif":
		return "image/gif"
	case "txt":
		return "text/plain"
	case "html", "htm":
		return "text/html"
	case "docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case "xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case "pptx":
		return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	case "csv":
		return "text/csv"
	case "rtf":
		return "application/rtf"
	default:
		return "application/octet-stream"
	}
}
