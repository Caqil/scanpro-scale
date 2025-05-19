// internal/repository/user_repository.go
package repository

import (
	"errors"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/gorm"
)

// UserRepository handles database operations for users
type UserRepository struct{}

// NewUserRepository creates a new UserRepository
func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id string) (*models.User, error) {
	var user models.User
	if err := db.DB.First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := db.DB.First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	if user.ID == "" {
		user.ID = models.GenerateID()
	}
	return db.DB.Create(user).Error
}

// Update updates a user
func (r *UserRepository) Update(id string, updates map[string]interface{}) error {
	return db.DB.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(id string) error {
	return db.DB.Delete(&models.User{}, "id = ?", id).Error
}

// GetUsageStats retrieves usage statistics for a user
func (r *UserRepository) GetUsageStats(userID string, since time.Time) ([]models.UsageStats, error) {
	var stats []models.UsageStats
	if err := db.DB.Where("user_id = ? AND date >= ?", userID, since).Find(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}

// GetApiKeys retrieves API keys for a user
func (r *UserRepository) GetApiKeys(userID string) ([]models.ApiKey, error) {
	var keys []models.ApiKey
	if err := db.DB.Where("user_id = ?", userID).Find(&keys).Error; err != nil {
		return nil, err
	}
	return keys, nil
}

// GetTransactions retrieves transactions for a user
func (r *UserRepository) GetTransactions(userID string, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	query := db.DB.Where("user_id = ?", userID).Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

// HasPaidTransactions checks if a user has any paid transactions
func (r *UserRepository) HasPaidTransactions(userID string) (bool, error) {
	var count int64
	err := db.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND amount > 0 AND status = ?", userID, "completed").
		Count(&count).Error

	return count > 0, err
}

// GetTotalUsers returns the total number of users
func (r *UserRepository) GetTotalUsers() (int64, error) {
	var count int64
	err := db.DB.Model(&models.User{}).Count(&count).Error
	return count, err
}

// GetActiveUsers returns the number of active users (with recent sessions or API usage)
func (r *UserRepository) GetActiveUsers(since time.Time) (int64, error) {
	var count int64
	err := db.DB.Model(&models.User{}).
		Joins("LEFT JOIN sessions ON users.id = sessions.user_id").
		Joins("LEFT JOIN api_keys ON users.id = api_keys.user_id").
		Where("sessions.expires > ? OR api_keys.last_used > ?", since, since).
		Distinct("users.id").
		Count(&count).Error

	return count, err
}

// GetNewUsers returns the number of new users since a specific date
func (r *UserRepository) GetNewUsers(since time.Time) (int64, error) {
	var count int64
	err := db.DB.Model(&models.User{}).
		Where("created_at >= ?", since).
		Count(&count).Error

	return count, err
}
