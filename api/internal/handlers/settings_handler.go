// internal/handlers/settings_handler.go
package handlers

import (
	"net/http"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

// SettingsHandler handles settings-related API endpoints
type SettingsHandler struct {
	settingsRepo  *repository.SettingsRepository
	configService *services.ConfigService
}

// NewSettingsHandler creates a new SettingsHandler
func NewSettingsHandler() *SettingsHandler {
	return &SettingsHandler{
		settingsRepo:  repository.NewSettingsRepository(),
		configService: services.NewConfigService(),
	}
}

// GetSettings returns settings for a specific category
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Category is required",
		})
		return
	}

	settings, err := h.settingsRepo.GetSettingsByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve settings: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"category": category,
		"settings": settings,
	})
}

// UpdateSettings updates settings for a specific category
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Category is required",
		})
		return
	}

	var req struct {
		Settings    map[string]interface{} `json:"settings" binding:"required"`
		Description string                 `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Use the config service to update settings
	if err := h.configService.UpdateSettings(category, req.Settings, req.Description); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save settings: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Settings updated successfully",
		"category": category,
	})
}

// GetAllSettings returns all settings grouped by category
func (h *SettingsHandler) GetAllSettings(c *gin.Context) {
	allSettings, err := h.settingsRepo.GetAllSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve settings: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"settings": allSettings,
	})
}

// ApplySettings applies the current settings immediately
func (h *SettingsHandler) ApplySettings(c *gin.Context) {
	// Reload configuration
	config, err := h.configService.RefreshConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to refresh configuration: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Settings applied successfully",
		"config": gin.H{
			"siteName": config.SiteName,
			"debug":    config.Debug,
			"port":     config.Port,
		},
	})
}

// ExportSettings exports all settings
func (h *SettingsHandler) ExportSettings(c *gin.Context) {
	allSettings, err := h.settingsRepo.GetAllSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to export settings: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"settings": allSettings,
	})
}

// ImportSettings imports settings
func (h *SettingsHandler) ImportSettings(c *gin.Context) {
	var req struct {
		Settings map[string]map[string]interface{} `json:"settings" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Import each category
	for category, settings := range req.Settings {
		if err := h.settingsRepo.SaveSettings(category, settings, "Imported settings"); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to import settings: " + err.Error(),
			})
			return
		}
	}

	// Refresh configuration
	_, err := h.configService.RefreshConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to refresh configuration: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Settings imported successfully",
	})
}
