package auth

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
)

// VerifyEmail verifies a user's email using a token
func (s *Service) VerifyEmail(ctx context.Context, token string) error {
	// Find user with this token
	var user models.User
	if err := s.db.Where("verification_token = ?", token).First(&user).Error; err != nil {
		return errors.New("invalid verification token")
	}

	// Update user
	now := time.Now()
	updates := map[string]interface{}{
		"is_email_verified":  true,
		"verification_token": nil,
		"email_verified":     now,
	}

	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}

// ResendVerificationEmail generates a new verification token and sends email
func (s *Service) ResendVerificationEmail(ctx context.Context, userID string) (string, error) {
	// Find user
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return "", err
	}

	// Check if already verified
	if user.IsEmailVerified {
		return "", errors.New("email is already verified")
	}

	// Generate new token
	token := uuid.New().String()

	// Update user
	if err := s.db.Model(&user).Update("verification_token", token).Error; err != nil {
		return "", err
	}

	// In a real implementation, you would send an email here

	return token, nil
}
