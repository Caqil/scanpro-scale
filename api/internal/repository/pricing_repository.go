// internal/repository/pricing_repository.go
package repository

import (
	"encoding/json"
	"errors"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PricingRepository handles database operations for pricing settings
type PricingRepository struct{}

// NewPricingRepository creates a new PricingRepository
func NewPricingRepository() *PricingRepository {
	return &PricingRepository{}
}

// GetPricingSettings retrieves all pricing settings
func (r *PricingRepository) GetPricingSettings() (*models.CustomPricing, error) {
	var setting models.PricingSetting
	result := db.DB.Where("key = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Return default settings if not found
		return &models.CustomPricing{
			OperationCost:         constants.OperationCost,
			FreeOperationsMonthly: constants.FreeOperationsMonthly,
			CustomPrices:          make(map[string]float64),
		}, nil
	} else if result.Error != nil {
		return nil, result.Error
	}

	// Unmarshal the settings
	var pricing models.CustomPricing
	if err := json.Unmarshal([]byte(setting.Value), &pricing); err != nil {
		return nil, err
	}

	return &pricing, nil
}

// SavePricingSettings saves pricing settings to the database
func (r *PricingRepository) SavePricingSettings(pricing *models.CustomPricing) error {
	// Marshal the settings to JSON
	pricingJSON, err := json.Marshal(pricing)
	if err != nil {
		return err
	}

	// Check if record exists
	var setting models.PricingSetting
	result := db.DB.Where("key = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new record
		setting = models.PricingSetting{
			ID:          uuid.New().String(),
			Key:         "pricing_settings",
			Value:       string(pricingJSON),
			Description: "Global pricing settings for operations",
		}
		return db.DB.Create(&setting).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record
	return db.DB.Model(&setting).Update("value", string(pricingJSON)).Error
}
