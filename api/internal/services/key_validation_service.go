// internal/services/key_validation_service.go
package services

import (
	"errors"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"gorm.io/gorm"
)

// API operation constants - now imported from constants package
var APIOperations = constants.APIOperations

type KeyValidationService struct {
	db *gorm.DB
}

func NewKeyValidationService(db *gorm.DB) *KeyValidationService {
	return &KeyValidationService{db: db}
}

type ValidationResult struct {
	Valid  bool
	UserID string
	// Permissions field can be removed or left empty
	FreeOperationsRemaining int
	Balance                 float64
	FreeOperationsReset     time.Time
	Error                   string
}

func (s *KeyValidationService) ValidateKey(apiKey string, operation string) (*ValidationResult, error) {
	if apiKey == "" {
		return &ValidationResult{
			Valid: false,
			Error: "API key is required",
		}, nil
	}

	// Look up the key
	var keyRecord models.ApiKey
	result := s.db.Preload("User").Where("key = ?", apiKey).First(&keyRecord)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return &ValidationResult{
				Valid: false,
				Error: "Invalid API key",
			}, nil
		}
		return nil, result.Error
	}

	// Check expiration
	if keyRecord.ExpiresAt != nil && keyRecord.ExpiresAt.Before(time.Now()) {
		return &ValidationResult{
			Valid: false,
			Error: "API key has expired",
		}, nil
	}

	// No need to check permissions - all operations are allowed

	// Update last used timestamp
	now := time.Now()
	s.db.Model(&keyRecord).Update("last_used", now)

	// Check free operations reset date
	var freeOpsUsed int = 0
	var freeOpsReset time.Time

	if keyRecord.User.FreeOperationsReset.Before(now) {
		// Reset will happen on actual operation
		freeOpsUsed = 0

		// Next reset date is first day of next month
		nextMonth := now.AddDate(0, 1, 0)
		freeOpsReset = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)
	} else {
		freeOpsUsed = keyRecord.User.FreeOperationsUsed
		freeOpsReset = keyRecord.User.FreeOperationsReset
	}

	// Calculate remaining free operations
	freeOpsRemaining := constants.FreeOperationsMonthly - freeOpsUsed
	if freeOpsRemaining < 0 {
		freeOpsRemaining = 0
	}

	return &ValidationResult{
		Valid:                   true,
		UserID:                  keyRecord.UserID,
		FreeOperationsRemaining: freeOpsRemaining,
		Balance:                 keyRecord.User.Balance,
		FreeOperationsReset:     freeOpsReset,
	}, nil
}
func (s *KeyValidationService) GetPricingSettings() (float64, int, error) {
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		return constants.OperationCost, constants.FreeOperationsMonthly, err
	}

	return pricing.OperationCost, pricing.FreeOperationsMonthly, nil
}

// GetOperationCost returns the cost for a specific operation
func (s *KeyValidationService) GetOperationCost(operation string) (float64, error) {
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		return constants.OperationCost, err
	}

	// Check if there's a custom price for this operation
	if price, ok := pricing.CustomPrices[operation]; ok {
		return price, nil
	}

	// Otherwise return the global operation cost
	return pricing.OperationCost, nil
}
