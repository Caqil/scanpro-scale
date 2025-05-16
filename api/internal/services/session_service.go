package services

import (
	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SessionService struct {
	DB *gorm.DB
}

func NewSessionService(db *gorm.DB) *SessionService {
	return &SessionService{DB: db}
}

func (s *SessionService) CreateSession(session *models.Session) error {
	session.ID = uuid.New().String()
	return s.DB.Create(session).Error
}

func (s *SessionService) GetSession(id string) (*models.Session, error) {
	var session models.Session
	err := s.DB.Where("id = ?", id).First(&session).Error
	return &session, err
}

func (s *SessionService) UpdateSession(id string, update *models.Session) error {
	return s.DB.Model(&models.Session{}).Where("id = ?", id).Updates(update).Error
}

func (s *SessionService) DeleteSession(id string) error {
	return s.DB.Delete(&models.Session{}, "id = ?", id).Error
}
