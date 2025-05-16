// internal/repositories/password_reset_repository.go
package repositories

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PasswordResetRepository handles database operations for password reset tokens
type PasswordResetRepository struct {
	db *gorm.DB
}

// NewPasswordResetRepository creates a new password reset repository
func NewPasswordResetRepository(db *gorm.DB) *PasswordResetRepository {
	return &PasswordResetRepository{
		db: db,
	}
}

// GetByToken gets a password reset token by token value
func (r *PasswordResetRepository) GetByToken(ctx context.Context, token string) (*models.PasswordResetToken, error) {
	var resetToken models.PasswordResetToken
	result := r.db.Where("token = ?", token).First(&resetToken)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("token not found")
		}
		return nil, result.Error
	}
	return &resetToken, nil
}

// GetByEmail gets a password reset token by email
func (r *PasswordResetRepository) GetByEmail(ctx context.Context, email string) (*models.PasswordResetToken, error) {
	var resetToken models.PasswordResetToken
	result := r.db.Where("email = ?", email).First(&resetToken)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("no reset token for this email")
		}
		return nil, result.Error
	}
	return &resetToken, nil
}

// Create creates a new password reset token
func (r *PasswordResetRepository) Create(ctx context.Context, resetToken *models.PasswordResetToken) error {
	if resetToken.ID == "" {
		resetToken.ID = uuid.New().String()
	}
	if resetToken.CreatedAt.IsZero() {
		resetToken.CreatedAt = time.Now()
	}
	return r.db.Create(resetToken).Error
}

// Delete deletes a password reset token
func (r *PasswordResetRepository) Delete(ctx context.Context, id string) error {
	return r.db.Delete(&models.PasswordResetToken{}, "id = ?", id).Error
}

// DeleteByToken deletes a password reset token by token value
func (r *PasswordResetRepository) DeleteByToken(ctx context.Context, token string) error {
	return r.db.Where("token = ?", token).Delete(&models.PasswordResetToken{}).Error
}

// DeleteByEmail deletes all password reset tokens for an email
func (r *PasswordResetRepository) DeleteByEmail(ctx context.Context, email string) error {
	return r.db.Where("email = ?", email).Delete(&models.PasswordResetToken{}).Error
}

// CleanupExpired deletes all expired password reset tokens
func (r *PasswordResetRepository) CleanupExpired(ctx context.Context) error {
	now := time.Now()
	return r.db.Where("expires < ?", now).Delete(&models.PasswordResetToken{}).Error
}

// IsTokenValid checks if a token is valid (exists and not expired)
func (r *PasswordResetRepository) IsTokenValid(ctx context.Context, token string) (bool, string, error) {
	var resetToken models.PasswordResetToken
	result := r.db.Where("token = ?", token).First(&resetToken)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return false, "", nil
		}
		return false, "", result.Error
	}

	// Check if token is expired
	if resetToken.Expires.Before(time.Now()) {
		return false, "", nil
	}

	return true, resetToken.Email, nil
}