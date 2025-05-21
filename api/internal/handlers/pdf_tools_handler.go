// internal/handlers/pdf_tools_handler.go
package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/gin-gonic/gin"
)

// PDFToolsHandler handles requests for PDF tool settings
type PDFToolsHandler struct {
	repo *repository.PDFToolsRepository
}

// NewPDFToolsHandler creates a new PDFToolsHandler
func NewPDFToolsHandler() *PDFToolsHandler {
	return &PDFToolsHandler{
		repo: repository.NewPDFToolsRepository(),
	}
}

// GetPDFTools returns all PDF tool settings
func (h *PDFToolsHandler) GetPDFTools(c *gin.Context) {
	tools, err := h.repo.GetAllTools()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve PDF tool settings: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"tools":   tools,
	})
}

// UpdateToolStatus updates the enabled status of a specific tool
func (h *PDFToolsHandler) UpdateToolStatus(c *gin.Context) {
	toolID := c.Param("id")
	if toolID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Tool ID is required",
		})
		return
	}

	// Enable debug logging
	fmt.Printf("Updating tool ID: %s\n", toolID)

	// Read and log the raw request body for debugging
	body, _ := io.ReadAll(c.Request.Body)
	fmt.Printf("Request body: %s\n", string(body))
	// Reset the body so ShouldBindJSON still works
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	var req struct {
		enabled bool `json:"enabled" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("JSON binding error for tool %s: %v\n", toolID, err)
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Try to update with the exact ID first
	err := h.repo.UpdateToolStatus(toolID, req.enabled)
	if err != nil {
		// If the exact ID fails, try with common variations
		if strings.HasSuffix(toolID, "-pdf") {
			// Try without the "-pdf" suffix
			baseToolID := strings.TrimSuffix(toolID, "-pdf")
			err = h.repo.UpdateToolStatus(baseToolID, req.enabled)
		} else {
			// Try with "-pdf" suffix
			err = h.repo.UpdateToolStatus(toolID+"-pdf", req.enabled)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to update tool status: " + err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Tool status updated successfully",
	})
}

// EnableAllTools enables all PDF tools
func (h *PDFToolsHandler) EnableAllTools(c *gin.Context) {
	if err := h.repo.EnableAllTools(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to enable all tools: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All tools enabled successfully",
	})
}

// DisableAllTools disables all PDF tools
func (h *PDFToolsHandler) DisableAllTools(c *gin.Context) {
	if err := h.repo.DisableAllTools(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to disable all tools: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "All tools disabled successfully",
	})
}

// GetToolsByCategory returns tools grouped by their category
func (h *PDFToolsHandler) GetToolsByCategory(c *gin.Context) {
	toolsByCategory, err := h.repo.GetToolsByCategory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve PDF tools by category: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"categories": toolsByCategory,
	})
}
