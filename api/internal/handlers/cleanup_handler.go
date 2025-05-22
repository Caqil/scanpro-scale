// internal/handlers/cleanup_handler.go
package handlers

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/gin-gonic/gin"
)

// CleanupHandler handles the cleanup of temporary PDF files
type CleanupHandler struct {
	config *config.Config
}

// NewCleanupHandler creates a new cleanup handler
func NewCleanupHandler(cfg *config.Config) *CleanupHandler {
	return &CleanupHandler{
		config: cfg,
	}
}

// CleanupStats contains statistics from a cleanup operation
type CleanupStats struct {
	FilesDeleted   int      `json:"filesDeleted"`
	BytesRecovered int64    `json:"bytesRecovered"`
	DeletedFiles   []string `json:"deletedFiles,omitempty"`
	Errors         []string `json:"errors,omitempty"`
	ElapsedTime    string   `json:"elapsedTime"`
	CleanedDirs    []string `json:"cleanedDirs"`
}

// Cleanup handles the API request to clean up old PDF files
func (h *CleanupHandler) Cleanup(c *gin.Context) {
	startTime := time.Now()

	// Parse parameters
	maxAgeStr := c.DefaultQuery("maxAge", "60") // Default to 60 minutes
	maxAge, err := strconv.Atoi(maxAgeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid maxAge parameter, must be an integer",
		})
		return
	}

	// Determine threshold time
	threshold := time.Now().Add(-time.Duration(maxAge) * time.Minute)
	verbose := c.DefaultQuery("verbose", "false") == "true"

	// Perform cleanup
	stats, err := h.cleanupFiles(threshold, verbose)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to perform cleanup",
			"details": err.Error(),
		})
		return
	}

	stats.ElapsedTime = time.Since(startTime).String()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Cleanup completed successfully. Removed %d files, recovered %d bytes",
			stats.FilesDeleted, stats.BytesRecovered),
		"stats": stats,
	})
}

// cleanupFiles removes files older than the threshold time
func (h *CleanupHandler) cleanupFiles(threshold time.Time, verbose bool) (*CleanupStats, error) {
	stats := &CleanupStats{
		FilesDeleted:   0,
		BytesRecovered: 0,
		DeletedFiles:   []string{},
		Errors:         []string{},
		CleanedDirs:    []string{},
	}

	// Directories to clean
	directories := []string{
		h.config.UploadDir,
		h.config.TempDir,
	}

	// Add public directory PDF folders
	publicDirs := []string{
		filepath.Join(h.config.PublicDir, "downloads"),
		filepath.Join(h.config.PublicDir, "processed"),
		filepath.Join(h.config.PublicDir, "watermarked"),
		filepath.Join(h.config.PublicDir, "compressed"),
		filepath.Join(h.config.PublicDir, "conversions"),
		filepath.Join(h.config.PublicDir, "merged"),
		filepath.Join(h.config.PublicDir, "splits"),
	}

	// Append public directories to the list if they exist
	for _, dir := range publicDirs {
		if _, err := os.Stat(dir); !os.IsNotExist(err) {
			directories = append(directories, dir)
		}
	}

	// Also check the public directory itself for PDF files
	if _, err := os.Stat(h.config.PublicDir); !os.IsNotExist(err) {
		directories = append(directories, h.config.PublicDir)
	}

	fmt.Printf("Starting cleanup of directories: %v\n", directories)
	stats.CleanedDirs = directories

	// Clean each directory
	for _, dir := range directories {
		fmt.Printf("Cleaning directory: %s\n", dir)
		err := filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				stats.Errors = append(stats.Errors, fmt.Sprintf("Error accessing %s: %v", path, err))
				return nil // Continue despite errors
			}

			// Skip directories
			if d.IsDir() {
				return nil
			}

			// Get file info
			info, err := d.Info()
			if err != nil {
				stats.Errors = append(stats.Errors, fmt.Sprintf("Error getting file info for %s: %v", path, err))
				return nil
			}

			// Check if file is a PDF or temporary file
			if !isPDFOrTempFile(info.Name()) {
				return nil
			}

			// Check if file is older than threshold
			if info.ModTime().Before(threshold) {
				fileSize := info.Size()

				// Delete file
				if err := os.Remove(path); err != nil {
					stats.Errors = append(stats.Errors, fmt.Sprintf("Error deleting %s: %v", path, err))
					return nil
				}

				stats.FilesDeleted++
				stats.BytesRecovered += fileSize

				if verbose {
					stats.DeletedFiles = append(stats.DeletedFiles, path)
				}

				fmt.Printf("Deleted file: %s (Last modified: %s, Size: %d bytes)\n",
					path, info.ModTime().Format(time.RFC3339), fileSize)
			}

			return nil
		})

		if err != nil {
			return stats, fmt.Errorf("error walking directory %s: %w", dir, err)
		}
	}

	return stats, nil
}

// isPDFOrTempFile checks if a file is a PDF or temporary file
func isPDFOrTempFile(filename string) bool {
	// Check file extension
	ext := filepath.Ext(filename)
	if ext == ".pdf" {
		return true
	}

	// Check for temp file patterns
	tempPatterns := []string{
		".tmp", ".temp", ".part",
		"watermark", "compressed", "merged", "splits",
		"rotated", "protected", "signed", "unlocked", "ocr", "pagenumbers", "rotations", "watermarked", "conversions",
	}

	for _, pattern := range tempPatterns {
		if filepath.Ext(filename) == pattern ||
			filepath.Base(filename) == pattern ||
			containsSubstring(filename, pattern) {
			return true
		}
	}

	return false
}

// containsSubstring checks if a string contains a substring
func containsSubstring(s, substr string) bool {
	return len(s) >= len(substr) && s[len(s)-len(substr):] == substr
}
