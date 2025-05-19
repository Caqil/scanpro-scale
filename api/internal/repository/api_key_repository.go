// internal/repository/api_key_repository.go
package repository

import (
	"errors"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/gorm"
)

// APIKeyRepository handles database operations for API keys
type APIKeyRepository struct{}

// NewAPIKeyRepository creates a new APIKeyRepository
func NewAPIKeyRepository() *APIKeyRepository {
	return &APIKeyRepository{}
}

// GetByID retrieves an API key by ID
func (r *APIKeyRepository) GetByID(id string) (*models.ApiKey, error) {
	var key models.ApiKey
	if err := db.DB.First(&key, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Key not found
		}
		return nil, err
	}
	return &key, nil
}

// GetByKey retrieves an API key by the key string
func (r *APIKeyRepository) GetByKey(key string) (*models.ApiKey, error) {
	var apiKey models.ApiKey
	if err := db.DB.First(&apiKey, "key = ?", key).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Key not found
		}
		return nil, err
	}
	return &apiKey, nil
}

// GetByKeyWithUser retrieves an API key with its user by the key string
func (r *APIKeyRepository) GetByKeyWithUser(key string) (*models.ApiKey, *models.User, error) {
	var apiKey models.ApiKey
	if err := db.DB.Preload("User").First(&apiKey, "key = ?", key).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, nil // Key not found
		}
		return nil, nil, err
	}
	return &apiKey, &apiKey.User, nil
}

// GetForUser retrieves all API keys for a user
func (r *APIKeyRepository) GetForUser(userID string) ([]models.ApiKey, error) {
	var keys []models.ApiKey
	if err := db.DB.Where("user_id = ?", userID).Find(&keys).Error; err != nil {
		return nil, err
	}
	return keys, nil
}

// Create creates a new API key
func (r *APIKeyRepository) Create(key *models.ApiKey) error {
	if key.ID == "" {
		key.ID = models.GenerateID()
	}
	return db.DB.Create(key).Error
}

// Update updates an API key
func (r *APIKeyRepository) Update(id string, updates map[string]interface{}) error {
	return db.DB.Model(&models.ApiKey{}).Where("id = ?", id).Updates(updates).Error
}

// Delete deletes an API key
func (r *APIKeyRepository) Delete(id string) error {
	return db.DB.Delete(&models.ApiKey{}, "id = ?", id).Error
}

// UpdateLastUsed updates the last used timestamp for an API key
func (r *APIKeyRepository) UpdateLastUsed(id string) error {
	return db.DB.Model(&models.ApiKey{}).Where("id = ?", id).Update("last_used", time.Now()).Error
}

// CountForUser counts the number of API keys for a user
func (r *APIKeyRepository) CountForUser(userID string) (int64, error) {
	var count int64
	err := db.DB.Model(&models.ApiKey{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
