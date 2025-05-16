package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApiKeyService struct {
	DB *gorm.DB
}

func NewApiKeyService(db *gorm.DB) *ApiKeyService {
	return &ApiKeyService{DB: db}
}

func (s *ApiKeyService) CreateApiKey(apiKey *models.ApiKey) error {
	apiKey.ID = uuid.New().String()
	apiKey.CreatedAt = time.Now()
	apiKey.UpdatedAt = time.Now()
	return s.DB.Create(apiKey).Error
}

func (s *ApiKeyService) GetApiKey(id string) (*models.ApiKey, error) {
	var apiKey models.ApiKey
	err := s.DB.Where("id = ?", id).First(&apiKey).Error
	return &apiKey, err
}

func (s *ApiKeyService) UpdateApiKey(id string, update *models.ApiKey) error {
	update.UpdatedAt = time.Now()
	return s.DB.Model(&models.ApiKey{}).Where("id = ?", id).Updates(update).Error
}

func (s *ApiKeyService) DeleteApiKey(id string) error {
	return s.DB.Delete(&models.ApiKey{}, "id = ?", id).Error
}
