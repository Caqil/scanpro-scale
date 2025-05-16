// internal/repositories/user_repository.go
package repositories

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"gorm.io/gorm"
)

// UserRepository provides database operations for users
type UserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// GetByID gets a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetByEmail gets a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, "email = ?", email)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	return r.db.Create(user).Error
}

// Update updates a user
func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	return r.db.Save(user).Error
}

// UpdateFields updates specific fields of a user
func (r *UserRepository) UpdateFields(ctx context.Context, id string, updates map[string]interface{}) error {
	return r.db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	return r.db.Delete(&models.User{}, "id = ?", id).Error
}

// List lists users with pagination and filtering
func (r *UserRepository) List(ctx context.Context, offset, limit int, search string) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{})

	// Apply search if provided
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get users with pagination
	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetByVerificationToken gets a user by verification token
func (r *UserRepository) GetByVerificationToken(ctx context.Context, token string) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, "verification_token = ?", token)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid verification token")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetWithAPIKeys gets a user with their API keys
func (r *UserRepository) GetWithAPIKeys(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	result := r.db.Preload("APIKeys").First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetWithTransactions gets a user with their transactions
func (r *UserRepository) GetWithTransactions(ctx context.Context, id string) (*models.User, error) {
	var user models.User
	result := r.db.Preload("Transactions", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC").Limit(10)
	}).First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
}

// GetWithUsageStats gets a user with their usage statistics
func (r *UserRepository) GetWithUsageStats(ctx context.Context, id string) (*models.User, []models.UsageStat, error) {
	var user models.User
	var usageStats []models.UsageStat

	// Get user
	result := r.db.First(&user, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil, errors.New("user not found")
		}
		return nil, nil, result.Error
	}

	// Get usage stats for current month
	firstDayOfMonth := time.Now().UTC().AddDate(0, 0, -time.Now().UTC().Day()+1)
	firstDayOfMonth = time.Date(firstDayOfMonth.Year(), firstDayOfMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

	result = r.db.Where("user_id = ? AND date >= ?", id, firstDayOfMonth).Find(&usageStats)
	if result.Error != nil {
		return &user, nil, result.Error
	}

	return &user, usageStats, nil
}

// GetAdminUsers gets all admin users
func (r *UserRepository) GetAdminUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	result := r.db.Where("role = ?", "admin").Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}