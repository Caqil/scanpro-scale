// internal/services/api_key_service.go
package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApiKeyService struct {
	db *gorm.DB
}

func NewApiKeyService(db *gorm.DB) *ApiKeyService {
	return &ApiKeyService{db: db}
}

// CreateKey generates a new API key for a user
func (s *ApiKeyService) CreateKey(userID, name string, permissions []string) (*models.ApiKey, error) {
	// Validate permissions - if wildcard is included, just use that
	validPerms := []string{}
	hasWildcard := false

	for _, perm := range permissions {
		if perm == "*" {
			hasWildcard = true
			break
		}

		// Check if permission is valid
		isValid := false
		for _, validPerm := range APIOperations {
			if perm == validPerm {
				isValid = true
				break
			}
		}

		if isValid {
			validPerms = append(validPerms, perm)
		}
	}

	if hasWildcard {
		validPerms = []string{"*"}
	}

	// If no valid permissions, add default ones
	if len(validPerms) == 0 {
		validPerms = []string{"convert", "compress", "merge", "split"}
	}

	// Check if user has reached key limit
	var keyCount int64
	if err := s.db.Model(&models.ApiKey{}).Where("user_id = ?", userID).Count(&keyCount).Error; err != nil {
		return nil, err
	}

	// Get user to check if they are paid
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Determine key limit based on user type
	keyLimit := 1 // Default for free users
	if user.Balance > 0 {
		// If user has balance, they're considered paid
		keyLimit = 10
	}

	if keyCount >= int64(keyLimit) {
		return nil, errors.New("API key limit reached")
	}

	// Generate a new key
	key, err := generateApiKey()
	if err != nil {
		return nil, err
	}

	apiKey := models.ApiKey{
		ID:          uuid.New().String(),
		UserID:      userID,
		Name:        name,
		Key:         key,
		Permissions: validPerms,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.db.Create(&apiKey).Error; err != nil {
		return nil, err
	}

	return &apiKey, nil
}

// GetUserKeys returns all API keys for a user
func (s *ApiKeyService) GetUserKeys(userID string) ([]models.ApiKey, error) {
	var keys []models.ApiKey
	if err := s.db.Where("user_id = ?", userID).Find(&keys).Error; err != nil {
		return nil, err
	}
	return keys, nil
}

// RevokeKey deletes an API key
func (s *ApiKeyService) RevokeKey(id, userID string) error {
	// Check if key belongs to user
	var key models.ApiKey
	result := s.db.Where("id = ? AND user_id = ?", id, userID).First(&key)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("API key not found or does not belong to user")
	} else if result.Error != nil {
		return result.Error
	}

	// Delete the key
	return s.db.Delete(&key).Error
}

// generateApiKey creates a secure random API key
func generateApiKey() (string, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return "sk_" + hex.EncodeToString(bytes), nil
}