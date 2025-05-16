package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UsageStatsService struct {
	DB *gorm.DB
}

func NewUsageStatsService(db *gorm.DB) *UsageStatsService {
	return &UsageStatsService{DB: db}
}

func (s *UsageStatsService) CreateUsageStats(usageStats *models.UsageStats) error {
	usageStats.ID = uuid.New().String()
	usageStats.CreatedAt = time.Now()
	usageStats.UpdatedAt = time.Now()
	return s.DB.Create(usageStats).Error
}

func (s *UsageStatsService) GetUsageStats(id string) (*models.UsageStats, error) {
	var usageStats models.UsageStats
	err := s.DB.Where("id = ?", id).First(&usageStats).Error
	return &usageStats, err
}

func (s *UsageStatsService) UpdateUsageStats(id string, update *models.UsageStats) error {
	update.UpdatedAt = time.Now()
	return s.DB.Model(&models.UsageStats{}).Where("id = ?", id).Updates(update).Error
}

func (s *UsageStatsService) DeleteUsageStats(id string) error {
	return s.DB.Delete(&models.UsageStats{}, "id = ?", id).Error
}
