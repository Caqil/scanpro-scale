// internal/handlers/utils/file.go
package utils

import (
	"fmt"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"time"

	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
)

// FileHandler handles file operations
type FileHandler struct {
	storage storage.StorageManager
}

// NewFileHandler creates a new file handler
func NewFileHandler(storage storage.StorageManager) *FileHandler {
	return &FileHandler{
		storage: storage,
	}
}

// GetFile serves a file from the specified folder
func (h *FileHandler) GetFile(c *gin.Context) {
	// Get folder and filename from query parameters
	folder := c.Query("folder")
	filename := c.Query("filename")

	// Validate parameters
	if folder == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required parameters",
			"success": false,
		})
		return
	}

	// Validate folder name
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

	validFolder := false
	for _, f := range allowedFolders {
		if folder == f {
			validFolder = true
			break
		}
	}

	if !validFolder {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid folder specified",
			"success": false,
		})
		return
	}

	// Sanitize filename to prevent directory traversal
	sanitizedFilename := path.Base(filename)
	if sanitizedFilename != filename {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid filename",
			"success": false,
		})
		return
	}

	// Get the file path
	filePath := filepath.Join(h.storage.GetProcessedDir(folder), sanitizedFilename)

	// Check if file exists
	if !h.storage.FileExists(filePath) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "File not found",
			"success": false,
		})
		return
	}

	// Get file extension for content type
	extension := strings.ToLower(filepath.Ext(sanitizedFilename))
	if extension == "" {
		extension = ".pdf" // Default to PDF if no extension
	} else {
		extension = extension[1:] // Remove the leading dot
	}

	// Get content type
	contentType := h.getContentType(extension)

	// Determine download behavior
	disposition := "attachment"
	if contentType == "application/pdf" && c.Query("view") == "true" {
		disposition = "inline"
	}

	// Serve the file
	c.Header("Content-Disposition", fmt.Sprintf("%s; filename=%q", disposition, sanitizedFilename))
	c.Header("Cache-Control", "no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	c.File(filePath)
}

// UploadFile handles a file upload and stores it
func (h *FileHandler) UploadFile(c *gin.Context) {
	// Get user ID from context if authenticated
	userID, _ := c.Get("userID")

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No file uploaded",
			"success": false,
		})
		return
	}

	// Check file size limit (10MB)
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "File size exceeds limit (10MB)",
			"success": false,
		})
		return
	}

	// Generate a unique filename
	filename := generateUniqueFilename(file.Filename, userID)

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to open uploaded file",
			"success": false,
		})
		return
	}
	defer src.Close()

	// Get upload directory
	uploadDir := h.storage.GetUploadDir()

	// Save the file
	filePath := filepath.Join(uploadDir, filename)
	if err := h.storage.SaveFile(src, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save file",
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"filename": filename,
		"filepath": filePath,
		"size":     file.Size,
	})
}

// DeleteFile deletes a file from the specified folder
func (h *FileHandler) DeleteFile(c *gin.Context) {
	// Get folder and filename from query parameters
	folder := c.Query("folder")
	filename := c.Query("filename")

	// Validate parameters
	if folder == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required parameters",
			"success": false,
		})
		return
	}

	// Sanitize filename to prevent directory traversal
	sanitizedFilename := path.Base(filename)
	if sanitizedFilename != filename {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid filename",
			"success": false,
		})
		return
	}

	// Get the file path
	filePath := filepath.Join(h.storage.GetProcessedDir(folder), sanitizedFilename)

	// Check if file exists
	if !h.storage.FileExists(filePath) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "File not found",
			"success": false,
		})
		return
	}

	// Delete the file
	if err := h.storage.DeleteFile(filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to delete file",
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File deleted successfully",
	})
}

// getContentType returns the MIME type for a file extension
func (h *FileHandler) getContentType(extension string) string {
	contentTypes := map[string]string{
		"pdf":  "application/pdf",
		"png":  "image/png",
		"jpg":  "image/jpeg",
		"jpeg": "image/jpeg",
		"gif":  "image/gif",
		"tiff": "image/tiff",
		"tif":  "image/tiff",
		"svg":  "image/svg+xml",
		"txt":  "text/plain",
		"html": "text/html",
		"csv":  "text/csv",
		"doc":  "application/msword",
		"docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"xls":  "application/vnd.ms-excel",
		"xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"ppt":  "application/vnd.ms-powerpoint",
		"pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"json": "application/json",
		"xml":  "application/xml",
	}

	if contentType, ok := contentTypes[extension]; ok {
		return contentType
	}

	// Default to octet-stream for unknown types
	return "application/octet-stream"
}

// generateUniqueFilename generates a unique filename
func generateUniqueFilename(originalFilename string, userID interface{}) string {
	// Get file extension
	extension := filepath.Ext(originalFilename)

	// Generate unique ID
	uniqueID := generateUUID()

	// Add user ID prefix if available
	prefix := ""
	if userID != nil {
		// Take first 8 characters of user ID
		userIDStr := fmt.Sprintf("%v", userID)
		if len(userIDStr) >= 8 {
			prefix = userIDStr[:8] + "_"
		}
	}

	// Create filename with prefix, unique ID, and original extension
	return fmt.Sprintf("%s%s%s", prefix, uniqueID, extension)
}

// generateUUID generates a unique identifier
func generateUUID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
