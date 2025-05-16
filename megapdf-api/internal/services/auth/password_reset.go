package auth

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// RequestPasswordReset initiates a password reset
func (s *Service) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	// Check if user exists
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		// Don't reveal if user exists for security
		return "", nil
	}

	// Generate token
	token := uuid.New().String()

	// Set expiration (1 hour from now)
	expires := time.Now().Add(1 * time.Hour)

	// Delete any existing tokens for this email
	if err := s.db.Where("email = ?", email).Delete(&models.PasswordResetToken{}).Error; err != nil {
		return "", err
	}

	// Create new token
	resetToken := models.PasswordResetToken{
		ID:        uuid.New().String(),
		Email:     email,
		Token:     token,
		Expires:   expires,
		CreatedAt: time.Now(),
	}

	if err := s.db.Create(&resetToken).Error; err != nil {
		return "", err
	}

	// In a real implementation, you would send an email here

	return token, nil
}

// ValidateResetToken validates a password reset token
func (s *Service) ValidateResetToken(ctx context.Context, token string) (bool, string, error) {
	var resetToken models.PasswordResetToken
	if err := s.db.Where("token = ?", token).First(&resetToken).Error; err != nil {
		return false, "", err
	}

	// Check if token is expired
	if resetToken.Expires.Before(time.Now()) {
		return false, "", errors.New("token has expired")
	}

	return true, resetToken.Email, nil
}

// ResetPassword resets a user's password using a token
func (s *Service) ResetPassword(ctx context.Context, token, newPassword string) error {
	// Validate token
	valid, email, err := s.ValidateResetToken(ctx, token)
	if err != nil {
		return err
	}
	if !valid {
		return errors.New("invalid token")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update user password
	if err := s.db.Model(&models.User{}).Where("email = ?", email).Update("password", string(hashedPassword)).Error; err != nil {
		return err
	}

	// Delete token
	if err := s.db.Where("token = ?", token).Delete(&models.PasswordResetToken{}).Error; err != nil {
		return err
	}

	return nil
}
