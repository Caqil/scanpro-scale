package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AccountService struct {
	DB *gorm.DB
}

func NewAccountService(db *gorm.DB) *AccountService {
	return &AccountService{DB: db}
}

func (s *AccountService) CreateAccount(account *models.Account) error {
	account.ID = uuid.New().String()
	account.CreatedAt = time.Now()
	account.UpdatedAt = time.Now()
	return s.DB.Create(account).Error
}

func (s *AccountService) GetAccount(id string) (*models.Account, error) {
	var account models.Account
	err := s.DB.Where("id = ?", id).First(&account).Error
	return &account, err
}

func (s *AccountService) UpdateAccount(id string, update *models.Account) error {
	update.UpdatedAt = time.Now()
	return s.DB.Model(&models.Account{}).Where("id = ?", id).Updates(update).Error
}

func (s *AccountService) DeleteAccount(id string) error {
	return s.DB.Delete(&models.Account{}, "id = ?", id).Error
}
