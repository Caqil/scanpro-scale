// internal/handlers/admin/cleanup.go
package admin

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"megapdf-api/pkg/storage"

	"github.com/gin-gonic/gin"
)

// CleanupHandler handles admin cleanup operations
type CleanupHandler struct {
	storage storage.StorageManager
}

// NewCleanupHandler creates a new cleanup handler
func NewCleanupHandler(storage storage.StorageManager) *CleanupHandler {
	return &CleanupHandler{
		storage: storage,
	}
}

// Register registers the routes for this handler
func (h *CleanupHandler) Register(router *gin.RouterGroup) {
	router.GET("/cleanup", h.RunCleanup)
}

// RunCleanup runs a cleanup operation
func (h *CleanupHandler) RunCleanup(c *gin.Context) {
	// Get max age from query string or use default
	maxAgeStr := c.DefaultQuery("maxAge", "60")
	maxAge, err := strconv.Atoi(maxAgeStr)
	if err != nil {
		maxAge = 60 // Default to 60 minutes
	}

	// Run cleanup
	processor := storage.NewCleanupProcessor(h.storage)
	result, err := processor.Run(time.Duration(maxAge) * time.Minute)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Cleanup completed. Removed %d files (%s)",
			result.TotalCleaned,
			formatBytes(result.TotalSize)),
		"details": result,
	})
}

// formatBytes formats bytes into human-readable format
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d Bytes", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}
