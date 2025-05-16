package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PasswordResetService struct {
	DB *gorm.DB
}

func NewPasswordResetService(db *gorm.DB) *PasswordResetService {
	return &PasswordResetService{DB: db}
}

func (s *PasswordResetService) CreatePasswordResetToken(token *models.PasswordResetToken) error {
	token.ID = uuid.New().String()
	token.CreatedAt = time.Now()
	return s.DB.Create(token).Error
}

func (s *PasswordResetService) GetPasswordResetToken(id string) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken
	err := s.DB.Where("id = ?", id).First(&token).Error
	return &token, err
}

func (s *PasswordResetService) DeletePasswordResetToken(id string) error {
	return s.DB.Delete(&models.PasswordResetToken{}, "id = ?", id).Error
}
