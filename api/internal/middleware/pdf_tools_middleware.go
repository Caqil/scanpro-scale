// internal/middleware/pdf_tools_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

// PDFToolAvailabilityMiddleware checks if the requested PDF tool is enabled
func PDFToolAvailabilityMiddleware() gin.HandlerFunc {
	toolsService := services.NewPDFToolsService()

	return func(c *gin.Context) {
		// Extract the tool name from the path
		path := c.Request.URL.Path
		pathParts := strings.Split(path, "/")

		// The path format should be /api/pdf/{tool}
		if len(pathParts) < 4 || pathParts[1] != "api" || pathParts[2] != "pdf" {
			c.Next()
			return
		}

		toolID := pathParts[3]

		// Check if the tool is enabled
		enabled, err := toolsService.CheckToolAvailability(toolID)
		if err != nil {
			// Log the error but continue
			// This ensures that if the tools settings are missing, the application still works
			c.Set("toolEnabled", true)
			c.Next()
			return
		}

		if !enabled {
			c.JSON(http.StatusForbidden, gin.H{
				"error":        toolsService.GetDisabledMessage(toolID),
				"toolDisabled": true,
			})
			c.Abort()
			return
		}

		// Tool is enabled, continue
		c.Set("toolEnabled", true)
		c.Next()
	}
}
