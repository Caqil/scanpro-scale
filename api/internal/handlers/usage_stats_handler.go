package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// UsageStatsHandler handles usage stats-related HTTP requests
type UsageStatsHandler struct {
	Service *services.UsageStatsService
}

func NewUsageStatsHandler(service *services.UsageStatsService) *UsageStatsHandler {
	return &UsageStatsHandler{Service: service}
}

// CreateUsageStats creates new usage stats
// @Summary Create new usage stats
// @Description Creates new usage stats with the provided details
// @Tags usage-stats
// @Accept json
// @Produce json
// @Param usageStats body models.UsageStats true "UsageStats data"
// @Success 201 {object} models.UsageStats
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /usage-stats [post]
func (h *UsageStatsHandler) CreateUsageStats(c *gin.Context) {
	var usageStats models.UsageStats
	if err := c.ShouldBindJSON(&usageStats); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreateUsageStats(&usageStats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, usageStats)
}

// GetUsageStats retrieves usage stats by ID
// @Summary Get usage stats
// @Description Retrieves usage stats by its ID
// @Tags usage-stats
// @Accept json
// @Produce json
// @Param id path string true "UsageStats ID"
// @Success 200 {object} models.UsageStats
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /usage-stats/{id} [get]
func (h *UsageStatsHandler) GetUsageStats(c *gin.Context) {
	id := c.Param("id")
	usageStats, err := h.Service.GetUsageStats(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "UsageStats not found"})
		return
	}
	c.JSON(http.StatusOK, usageStats)
}

// UpdateUsageStats updates usage stats by ID
// @Summary Update usage stats
// @Description Updates usage stats with the provided details
// @Tags usage-stats
// @Accept json
// @Produce json
// @Param id path string true "UsageStats ID"
// @Param usageStats body models.UsageStats true "UsageStats data"
// @Success 200 {object} models.UsageStats
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /usage-stats/{id} [put]
func (h *UsageStatsHandler) UpdateUsageStats(c *gin.Context) {
	id := c.Param("id")
	var usageStats models.UsageStats
	if err := c.ShouldBindJSON(&usageStats); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.UpdateUsageStats(id, &usageStats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, usageStats)
}

// DeleteUsageStats deletes usage stats by ID
// @Summary Delete usage stats
// @Description Deletes usage stats by its ID
// @Tags usage-stats
// @Accept json
// @Produce json
// @Param id path string true "UsageStats ID"
// @Success 204
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /usage-stats/{id} [delete]
func (h *UsageStatsHandler) DeleteUsageStats(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteUsageStats(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
