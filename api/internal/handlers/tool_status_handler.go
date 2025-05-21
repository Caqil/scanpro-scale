// internal/handlers/tool_status_handler.go
package handlers

import (
	"net/http"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/gin-gonic/gin"
)

// ToolStatusHandler handles requests for PDF tool status for the frontend
type ToolStatusHandler struct {
	repo *repository.PDFToolsRepository
}

// NewToolStatusHandler creates a new ToolStatusHandler
func NewToolStatusHandler() *ToolStatusHandler {
	return &ToolStatusHandler{
		repo: repository.NewPDFToolsRepository(),
	}
}

// GetToolStatus returns the status of all PDF tools for frontend use
func (h *ToolStatusHandler) GetToolStatus(c *gin.Context) {
	tools, err := h.repo.GetAllTools()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve tool status: " + err.Error(),
		})
		return
	}

	// Create a simplified response with just id and enabled status
	toolStatus := make([]map[string]interface{}, 0, len(tools))
	for _, tool := range tools {
		toolStatus = append(toolStatus, map[string]interface{}{
			"id":      tool.ID,
			"enabled": tool.Enabled,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"tools":   toolStatus,
	})
}
