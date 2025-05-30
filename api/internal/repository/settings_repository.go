// internal/repository/settings_repository.go
package repository

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SettingsRepository handles database operations for settings
type SettingsRepository struct{}

// NewSettingsRepository creates a new SettingsRepository
func NewSettingsRepository() *SettingsRepository {
	return &SettingsRepository{}
}

// GetSettingsByCategory retrieves all settings in a category
func (r *SettingsRepository) GetSettingsByCategory(category string) (map[string]interface{}, error) {
	var settings []models.Setting
	// Note: using backticks around "key" since it's a reserved keyword
	result := db.DB.Where("category = ?", category).Find(&settings)
	if result.Error != nil {
		return nil, result.Error
	}

	// Combine all settings into a map
	settingsMap := make(map[string]interface{})
	for _, setting := range settings {
		var value interface{}
		if err := json.Unmarshal([]byte(setting.Value), &value); err != nil {
			continue // Skip if value can't be parsed
		}
		settingsMap[setting.Key] = value
	}

	return settingsMap, nil
}

// GetSetting retrieves a single setting by category and key
func (r *SettingsRepository) GetSetting(category, key string) (interface{}, error) {
	var setting models.Setting
	// Note: using backticks around "key" since it's a reserved keyword
	result := db.DB.Where("category = ? AND `key` = ?", category, key).First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil // Setting not found
	} else if result.Error != nil {
		return nil, result.Error
	}

	var value interface{}
	if err := json.Unmarshal([]byte(setting.Value), &value); err != nil {
		return nil, err
	}

	return value, nil
}

// SaveSetting saves a setting with category and key
func (r *SettingsRepository) SaveSetting(category, key string, value interface{}, description string) error {
	// Marshal the value to JSON
	valueJSON, err := json.Marshal(value)
	if err != nil {
		return err
	}

	// Check if record exists
	var setting models.Setting
	// Note: using backticks around "key" since it's a reserved keyword
	result := db.DB.Where("category = ? AND `key` = ?", category, key).First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new record
		setting = models.Setting{
			ID:          uuid.New().String(),
			Category:    category,
			Key:         key,
			Value:       string(valueJSON),
			Description: description,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		return db.DB.Create(&setting).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record
	setting.Value = string(valueJSON)
	setting.UpdatedAt = time.Now()
	if description != "" {
		setting.Description = description
	}
	return db.DB.Save(&setting).Error
}

// SaveSettings saves multiple settings for a category
func (r *SettingsRepository) SaveSettings(category string, settings map[string]interface{}, description string) error {
	// Use a transaction for saving multiple settings
	return db.DB.Transaction(func(tx *gorm.DB) error {
		for key, value := range settings {
			valueJSON, err := json.Marshal(value)
			if err != nil {
				return err
			}

			var setting models.Setting
			// Note: using backticks around "key" since it's a reserved keyword
			result := tx.Where("category = ? AND `key` = ?", category, key).First(&setting)

			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Create new setting
				setting = models.Setting{
					ID:          uuid.New().String(),
					Category:    category,
					Key:         key,
					Value:       string(valueJSON),
					Description: description,
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
				}
				if err := tx.Create(&setting).Error; err != nil {
					return err
				}
			} else if result.Error != nil {
				return result.Error
			} else {
				// Update existing setting
				setting.Value = string(valueJSON)
				setting.UpdatedAt = time.Now()
				if description != "" {
					setting.Description = description
				}
				if err := tx.Save(&setting).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

// InitializeDefaultSettings creates default settings if they don't exist
func (r *SettingsRepository) InitializeDefaultSettings() error {
	// Get default settings
	defaultSettings := models.DefaultSettings()

	// Use a transaction
	return db.DB.Transaction(func(tx *gorm.DB) error {
		// For each category
		for category, settings := range defaultSettings {
			// Check if category has any settings
			var count int64
			if err := tx.Model(&models.Setting{}).Where("category = ?", category).Count(&count).Error; err != nil {
				return err
			}

			// If no settings in this category, create defaults
			if count == 0 {
				for key, value := range settings {
					valueJSON, err := json.Marshal(value)
					if err != nil {
						return err
					}

					// Create setting
					setting := models.Setting{
						ID:          uuid.New().String(),
						Category:    category,
						Key:         key,
						Value:       string(valueJSON),
						Description: "Default setting",
						CreatedAt:   time.Now(),
						UpdatedAt:   time.Now(),
					}

					if err := tx.Create(&setting).Error; err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

// GetAllSettings returns settings from all categories
func (r *SettingsRepository) GetAllSettings() (map[string]map[string]interface{}, error) {
	var settings []models.Setting
	if err := db.DB.Find(&settings).Error; err != nil {
		return nil, err
	}

	// Group settings by category
	result := make(map[string]map[string]interface{})
	for _, setting := range settings {
		if result[setting.Category] == nil {
			result[setting.Category] = make(map[string]interface{})
		}

		var value interface{}
		if err := json.Unmarshal([]byte(setting.Value), &value); err != nil {
			continue // Skip if value can't be parsed
		}

		result[setting.Category][setting.Key] = value
	}

	return result, nil
}
