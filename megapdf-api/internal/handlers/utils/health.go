// internal/handlers/utils/health.go
package utils

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthHandler provides health check endpoints
type HealthHandler struct {
	db     *gorm.DB
	uptime time.Time
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{
		db:     db,
		uptime: time.Now(),
	}
}

// HealthCheck provides a basic health check endpoint
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "MegaPDF API",
		"version": "1.0.0",
		"uptime":  time.Since(h.uptime).String(),
	})
}

// DetailedHealthCheck provides a more detailed health check
func (h *HealthHandler) DetailedHealthCheck(c *gin.Context) {
	// Check database connection
	sqlDB, err := h.db.DB()
	dbStatus := "ok"
	dbError := ""
	
	if err != nil {
		dbStatus = "error"
		dbError = "Failed to get database connection"
	} else if err := sqlDB.Ping(); err != nil {
		dbStatus = "error"
		dbError = "Failed to ping database"
	}

	// Check disk space
	// In a real implementation, you would check disk space
	// This is a simplified version
	diskStatus := "ok"
	
	// Get system information
	// In a real implementation, you would get CPU and memory usage
	// This is a simplified version
	
	// Return health status
	c.JSON(http.StatusOK, gin.H{
		"status":  dbStatus == "ok" && diskStatus == "ok" ? "ok" : "degraded",
		"service": "MegaPDF API",
		"version": "1.0.0",
		"uptime":  time.Since(h.uptime).String(),
		"details": gin.H{
			"database": gin.H{
				"status": dbStatus,
				"error":  dbError,
			},
			"storage": gin.H{
				"status": diskStatus,
			},
		},
	})
}