// internal/repository/pricing_repository.go
package repository

import (
	"encoding/json"
	"errors"
	"fmt"

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
	// Debug logging
	fmt.Println("Fetching pricing settings from database")

	var setting models.PricingSetting
	// Fix: Add backticks around `key` since it's a reserved SQL keyword
	result := db.DB.Where("`key` = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Debug logging
		fmt.Println("No pricing settings found in database, using defaults")

		// Return default settings if not found
		return &models.CustomPricing{
			OperationCost:         constants.OperationCost,
			FreeOperationsMonthly: constants.FreeOperationsMonthly,
			CustomPrices:          make(map[string]float64),
		}, nil
	} else if result.Error != nil {
		// Debug logging
		fmt.Printf("Error fetching pricing settings: %v\n", result.Error)
		return nil, result.Error
	}

	// Unmarshal the settings
	var pricing models.CustomPricing
	if err := json.Unmarshal([]byte(setting.Value), &pricing); err != nil {
		// Debug logging
		fmt.Printf("Error unmarshaling pricing settings: %v\n", err)
		return nil, err
	}

	// Debug logging
	fmt.Printf("Successfully fetched pricing settings: global=%.3f, free=%d, custom=%v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	return &pricing, nil
}

// SavePricingSettings saves pricing settings to the database
func (r *PricingRepository) SavePricingSettings(pricing *models.CustomPricing) error {
	// Debug logging
	fmt.Printf("Saving pricing settings: global=%.3f, free=%d, custom=%v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	// Marshal the settings to JSON
	pricingJSON, err := json.Marshal(pricing)
	if err != nil {
		// Debug logging
		fmt.Printf("Error marshaling pricing settings: %v\n", err)
		return err
	}

	// Check if record exists
	var setting models.PricingSetting
	// Fix: Add backticks around `key` since it's a reserved SQL keyword
	result := db.DB.Where("`key` = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Debug logging
		fmt.Println("Creating new pricing settings record")

		// Create new record
		setting = models.PricingSetting{
			ID:          uuid.New().String(),
			Key:         "pricing_settings",
			Value:       string(pricingJSON),
			Description: "Global pricing settings for operations",
		}
		err := db.DB.Create(&setting).Error
		if err != nil {
			// Debug logging
			fmt.Printf("Error creating pricing settings: %v\n", err)
		} else {
			// Debug logging
			fmt.Println("Successfully created pricing settings")
		}
		return err
	} else if result.Error != nil {
		// Debug logging
		fmt.Printf("Error checking for existing pricing settings: %v\n", result.Error)
		return result.Error
	}

	// Debug logging
	fmt.Printf("Updating existing pricing settings with ID %s\n", setting.ID)

	// Update existing record
	err = db.DB.Model(&setting).Update("value", string(pricingJSON)).Error
	if err != nil {
		// Debug logging
		fmt.Printf("Error updating pricing settings: %v\n", err)
	} else {
		// Debug logging
		fmt.Println("Successfully updated pricing settings")
	}
	return err
}
