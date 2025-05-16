package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionService struct {
	DB *gorm.DB
}

func NewTransactionService(db *gorm.DB) *TransactionService {
	return &TransactionService{DB: db}
}

func (s *TransactionService) CreateTransaction(transaction *models.Transaction) error {
	transaction.ID = uuid.New().String()
	transaction.CreatedAt = time.Now()
	return s.DB.Create(transaction).Error
}

func (s *TransactionService) GetTransaction(id string) (*models.Transaction, error) {
	var transaction models.Transaction
	err := s.DB.Where("id = ?", id).First(&transaction).Error
	return &transaction, err
}

func (s *TransactionService) UpdateTransaction(id string, update *models.Transaction) error {
	return s.DB.Model(&models.Transaction{}).Where("id = ?", id).Updates(update).Error
}

func (s *TransactionService) DeleteTransaction(id string) error {
	return s.DB.Delete(&models.Transaction{}, "id = ?", id).Error
}
