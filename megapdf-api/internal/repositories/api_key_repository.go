// internal/repositories/api_key_repository.go
package repositories

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// APIKeyRepository handles database operations for API keys
type APIKeyRepository struct {
	db *gorm.DB
}

// NewAPIKeyRepository creates a new API key repository
func NewAPIKeyRepository(db *gorm.DB) *APIKeyRepository {
	return &APIKeyRepository{
		db: db,
	}
}

// GetByID gets an API key by ID
func (r *APIKeyRepository) GetByID(ctx context.Context, id string) (*models.APIKey, error) {
	var apiKey models.APIKey
	result := r.db.First(&apiKey, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("API key not found")
		}
		return nil, result.Error
	}
	return &apiKey, nil
}

// GetByKey gets an API key by its actual key value
func (r *APIKeyRepository) GetByKey(ctx context.Context, key string) (*models.APIKey, error) {
	var apiKey models.APIKey
	result := r.db.First(&apiKey, "key = ?", key)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("API key not found")
		}
		return nil, result.Error
	}
	return &apiKey, nil
}

// Create creates a new API key
func (r *APIKeyRepository) Create(ctx context.Context, apiKey *models.APIKey) error {
	if apiKey.ID == "" {
		apiKey.ID = uuid.New().String()
	}
	return r.db.Create(apiKey).Error
}

// Update updates an API key
func (r *APIKeyRepository) Update(ctx context.Context, apiKey *models.APIKey) error {
	return r.db.Save(apiKey).Error
}

// Delete deletes an API key
func (r *APIKeyRepository) Delete(ctx context.Context, id string) error {
	return r.db.Delete(&models.APIKey{}, "id = ?", id).Error
}

// GetByUserID gets all API keys for a user
func (r *APIKeyRepository) GetByUserID(ctx context.Context, userID string) ([]models.APIKey, error) {
	var apiKeys []models.APIKey
	result := r.db.Where("user_id = ?", userID).Find(&apiKeys)
	if result.Error != nil {
		return nil, result.Error
	}
	return apiKeys, nil
}

// UpdateLastUsed updates the last used timestamp for an API key
func (r *APIKeyRepository) UpdateLastUsed(ctx context.Context, id string) error {
	now := time.Now()
	return r.db.Model(&models.APIKey{}).Where("id = ?", id).Update("last_used", now).Error
}

// CountByUserID counts the number of API keys for a user
func (r *APIKeyRepository) CountByUserID(ctx context.Context, userID string) (int64, error) {
	var count int64
	result := r.db.Model(&models.APIKey{}).Where("user_id = ?", userID).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}

// GetWithPermission gets all keys with a specific permission
func (r *APIKeyRepository) GetWithPermission(ctx context.Context, permission string) ([]models.APIKey, error) {
	var apiKeys []models.APIKey
	
	// This is tricky with JSON arrays in the database
	// We need to use a JSONB query to find keys with the given permission
	// This works with PostgreSQL
	result := r.db.Where("permissions @> ?", []string{permission}).
		Or("permissions @> ?", []string{"*"}).
		Find(&apiKeys)
		
	if result.Error != nil {
		return nil, result.Error
	}
	return apiKeys, nil
}

// DeleteByUserID deletes all API keys for a user
func (r *APIKeyRepository) DeleteByUserID(ctx context.Context, userID string) error {
	return r.db.Delete(&models.APIKey{}, "user_id = ?", userID).Error
}