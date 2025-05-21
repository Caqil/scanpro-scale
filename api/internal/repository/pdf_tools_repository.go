// internal/repository/pdf_tools_repository.go
package repository

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/gorm"
)

// PDFToolsRepository handles database operations for PDF tool settings
type PDFToolsRepository struct{}

// NewPDFToolsRepository creates a new PDFToolsRepository
func NewPDFToolsRepository() *PDFToolsRepository {
	return &PDFToolsRepository{}
}

// GetAllTools retrieves all PDF tool settings
func (r *PDFToolsRepository) GetAllTools() ([]models.ToolStatus, error) {
	var settings models.PDFToolSettings
	result := db.DB.Where("`id` = ?", "pdf_tools_settings").First(&settings)

	// If no settings record exists, initialize with defaults
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return r.initializeDefaultTools()
	} else if result.Error != nil {
		return nil, result.Error
	}

	// Parse settings
	var config models.PDFToolsConfig
	if err := json.Unmarshal([]byte(settings.Settings), &config); err != nil {
		return nil, err
	}

	return config.Tools, nil
}

// UpdateToolStatus updates the enabled status of a specific tool
func (r *PDFToolsRepository) UpdateToolStatus(toolID string, enabled bool) error {
	// Get all tools first
	tools, err := r.GetAllTools()
	if err != nil {
		return err
	}

	// Update the specified tool
	toolFound := false
	for i, tool := range tools {
		if tool.ID == toolID {
			tools[i].Enabled = enabled
			toolFound = true
			break
		}
	}

	if !toolFound {
		return fmt.Errorf("tool with ID %s not found", toolID)
	}

	// Save the updated tools
	return r.saveTools(tools)
}

// EnableAllTools enables all PDF tools
func (r *PDFToolsRepository) EnableAllTools() error {
	tools, err := r.GetAllTools()
	if err != nil {
		return err
	}

	for i := range tools {
		tools[i].Enabled = true
	}

	return r.saveTools(tools)
}

// DisableAllTools disables all PDF tools
func (r *PDFToolsRepository) DisableAllTools() error {
	tools, err := r.GetAllTools()
	if err != nil {
		return err
	}

	for i := range tools {
		tools[i].Enabled = false
	}

	return r.saveTools(tools)
}

// IsToolEnabled checks if a specific tool is enabled
func (r *PDFToolsRepository) IsToolEnabled(toolID string) (bool, error) {
	tools, err := r.GetAllTools()
	if err != nil {
		return false, err
	}

	for _, tool := range tools {
		if tool.ID == toolID {
			return tool.Enabled, nil
		}
	}

	return false, fmt.Errorf("tool with ID %s not found", toolID)
}

// Internal helper methods

// initializeDefaultTools creates and returns the default tool settings
func (r *PDFToolsRepository) initializeDefaultTools() ([]models.ToolStatus, error) {
	defaultTools := models.GetDefaultTools()

	// Save these defaults to the database
	if err := r.saveTools(defaultTools); err != nil {
		return nil, err
	}

	return defaultTools, nil
}

// saveTools saves the tools configuration to the database
func (r *PDFToolsRepository) saveTools(tools []models.ToolStatus) error {
	// Create config
	config := models.PDFToolsConfig{
		Tools: tools,
	}

	// Convert to JSON
	configJSON, err := json.Marshal(config)
	if err != nil {
		return err
	}

	// Check if record exists
	var settings models.PDFToolSettings
	result := db.DB.Where("`id` = ?", "pdf_tools_settings").First(&settings)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new record
		settings = models.PDFToolSettings{
			ID:          "pdf_tools_settings",
			Settings:    string(configJSON),
			Description: "PDF tools configuration",
		}
		return db.DB.Create(&settings).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record
	return db.DB.Model(&settings).Update("settings", string(configJSON)).Error
}

// GetToolsByCategory returns tools grouped by their category
func (r *PDFToolsRepository) GetToolsByCategory() (map[string][]models.ToolStatus, error) {
	tools, err := r.GetAllTools()
	if err != nil {
		return nil, err
	}

	// Group tools by category
	toolsByCategory := make(map[string][]models.ToolStatus)
	for _, tool := range tools {
		toolsByCategory[tool.Category] = append(toolsByCategory[tool.Category], tool)
	}

	return toolsByCategory, nil
}
