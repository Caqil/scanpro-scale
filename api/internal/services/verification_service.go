package services

import (
	"github.com/Caqil/megapdf-api/internal/models"
	"gorm.io/gorm"
)

type VerificationService struct {
	DB *gorm.DB
}

func NewVerificationService(db *gorm.DB) *VerificationService {
	return &VerificationService{DB: db}
}

func (s *VerificationService) CreateVerificationToken(token *models.VerificationToken) error {
	return s.DB.Create(token).Error
}

func (s *VerificationService) GetVerificationToken(identifier string) (*models.VerificationToken, error) {
	var token models.VerificationToken
	err := s.DB.Where("identifier = ?", identifier).First(&token).Error
	return &token, err
}

func (s *VerificationService) DeleteVerificationToken(identifier string) error {
	return s.DB.Delete(&models.VerificationToken{}, "identifier = ?", identifier).Error
}
