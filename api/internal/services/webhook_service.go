package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WebhookService struct {
	DB *gorm.DB
}

func NewWebhookService(db *gorm.DB) *WebhookService {
	return &WebhookService{DB: db}
}

func (s *WebhookService) CreateWebhookEvent(event *models.PaymentWebhookEvent) error {
	event.ID = uuid.New().String()
	event.CreatedAt = time.Now()
	event.ProcessedAt = time.Now()
	return s.DB.Create(event).Error
}

func (s *WebhookService) GetWebhookEvent(id string) (*models.PaymentWebhookEvent, error) {
	var event models.PaymentWebhookEvent
	err := s.DB.Where("id = ?", id).First(&event).Error
	return &event, err
}

func (s *WebhookService) UpdateWebhookEvent(id string, update *models.PaymentWebhookEvent) error {
	return s.DB.Model(&models.PaymentWebhookEvent{}).Where("id = ?", id).Updates(update).Error
}

func (s *WebhookService) DeleteWebhookEvent(id string) error {
	return s.DB.Delete(&models.PaymentWebhookEvent{}, "id = ?", id).Error
}
