// internal/api/handlers/file.go
package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

// AllowedFolders defines the directories that can be accessed via the file API
var AllowedFolders = map[string]string{
	"conversions":  "public/conversions",
	"compressions": "public/compressions",
	"merges":       "public/merges",
	"splits":       "public/splits",
	"rotations":    "public/rotations",
	"watermarks":   "public/watermarks",
	"watermarked":  "public/watermarked",
	"protected":    "public/protected",
	"unlocked":     "public/unlocked",
	"signatures":   "public/signatures",
	"ocr":          "public/ocr",
	"edited":       "public/edited",
	"processed":    "public/processed",
	"pagenumbers":  "public/pagenumbers",
}

// ContentTypes maps file extensions to MIME types
var ContentTypes = map[string]string{
	".pdf":  "application/pdf",
	".txt":  "text/plain",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	".png":  "image/png",
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".html": "text/html",
	".rtf":  "application/rtf",
}

// FileHandler handles file download requests
func FileHandler(c *gin.Context) {
	// Get query parameters
	folder := c.Query("folder")
	filename := c.Query("filename")

	// Validate parameters
	if folder == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required parameters (folder and filename)",
		})
		return
	}

	// Check if folder is allowed
	folderPath, allowed := AllowedFolders[folder]
	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid folder specified",
		})
		return
	}

	// Sanitize filename to prevent path traversal
	sanitizedFilename := filepath.Base(filename)
	if sanitizedFilename != filename {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid filename",
		})
		return
	}

	// Build file path
	filePath := filepath.Join(folderPath, sanitizedFilename)

	// Check if file exists
	fileInfo, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "File not found",
		})
		return
	} else if err != nil {
		log.Error().Err(err).Str("path", filePath).Msg("Error accessing file")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to access file",
		})
		return
	}

	// Get file size
	fileSize := fileInfo.Size()

	// Determine content type based on file extension
	ext := strings.ToLower(filepath.Ext(filename))
	contentType, found := ContentTypes[ext]
	if !found {
		contentType = "application/octet-stream" // Default content type
	}

	// Set response headers
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", sanitizedFilename))
	c.Header("Content-Type", contentType)
	c.Header("Content-Length", fmt.Sprintf("%d", fileSize))
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	// Serve file
	c.File(filePath)
}
