package services

import (
	"errors"
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"gorm.io/gorm"
)

const (
	OperationCost         = 0.005
	FreeOperationsMonthly = 500
)

// API operation constants
var APIOperations = []string{
	"convert",
	"compress",
	"merge",
	"split",
	"protect",
	"unlock",
	"watermark",
	"sign",
	"rotate",
	"ocr",
	"repair",
	"edit",
	"annotate",
	"extract",
	"redact",
	"organize",
	"chat",
	"remove",
}

type KeyValidationService struct {
	db *gorm.DB
}

type ValidationResult struct {
	Valid                   bool
	UserID                  string
	Permissions             []string
	FreeOperationsRemaining int
	Balance                 float64
	FreeOperationsReset     time.Time
	Error                   string
}

func NewKeyValidationService(db *gorm.DB) *KeyValidationService {
	return &KeyValidationService{db: db}
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

	// Check permissions
	hasPermission := false
	for _, perm := range keyRecord.Permissions {
		if perm == operation || perm == "*" {
			hasPermission = true
			break
		}
	}

	if !hasPermission && operation != "" {
		return &ValidationResult{
			Valid: false,
			Error: "This API key does not have permission to perform the requested operation",
		}, nil
	}

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
	freeOpsRemaining := FreeOperationsMonthly - freeOpsUsed
	if freeOpsRemaining < 0 {
		freeOpsRemaining = 0
	}

	return &ValidationResult{
		Valid:                   true,
		UserID:                  keyRecord.UserID,
		Permissions:             keyRecord.Permissions,
		FreeOperationsRemaining: freeOpsRemaining,
		Balance:                 keyRecord.User.Balance,
		FreeOperationsReset:     freeOpsReset,
	}, nil
}