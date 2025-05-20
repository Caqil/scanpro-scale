// internal/repository/settings_repository.go
package repository

import (
	"encoding/json"
	"errors"

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
		}
		return db.DB.Create(&setting).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record
	return db.DB.Model(&setting).Updates(map[string]interface{}{
		"value":       string(valueJSON),
		"description": description,
	}).Error
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
				}
				if err := tx.Create(&setting).Error; err != nil {
					return err
				}
			} else if result.Error != nil {
				return result.Error
			} else {
				// Update existing setting
				if err := tx.Model(&setting).Update("value", string(valueJSON)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}
