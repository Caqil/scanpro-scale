// internal/handlers/settings_handler.go
package handlers

import (
	"net/http"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/gin-gonic/gin"
)

// SettingsHandler handles settings-related API endpoints
type SettingsHandler struct {
	settingsRepo *repository.SettingsRepository
}

// NewSettingsHandler creates a new SettingsHandler
func NewSettingsHandler() *SettingsHandler {
	return &SettingsHandler{
		settingsRepo: repository.NewSettingsRepository(),
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

	// Save settings
	if err := h.settingsRepo.SaveSettings(category, req.Settings, req.Description); err != nil {
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
	categories := []string{"general", "api", "email", "security", "pricing"}
	allSettings := make(map[string]interface{})

	for _, category := range categories {
		settings, err := h.settingsRepo.GetSettingsByCategory(category)
		if err != nil {
			continue // Skip if category not found
		}
		allSettings[category] = settings
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"settings": allSettings,
	})
}
