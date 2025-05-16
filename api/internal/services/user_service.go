package services

import (
	"time"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{DB: db}
}

func (s *UserService) CreateUser(user *models.User) error {
	user.ID = uuid.New().String()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	return s.DB.Create(user).Error
}

func (s *UserService) GetUser(id string) (*models.User, error) {
	var user models.User
	err := s.DB.Where("id = ?", id).First(&user).Error
	return &user, err
}

func (s *UserService) UpdateUser(id string, update *models.User) error {
	update.UpdatedAt = time.Now()
	return s.DB.Model(&models.User{}).Where("id = ?", id).Updates(update).Error
}

func (s *UserService) DeleteUser(id string) error {
	return s.DB.Delete(&models.User{}, "id = ?", id).Error
}
