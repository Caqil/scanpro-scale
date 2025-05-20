// internal/services/auth_service.go
package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

type AuthResult struct {
	Success bool
	Token   string
	User    *models.User
	Error   string
}

// Register creates a new user account
func (s *AuthService) Register(name, email, password string) (*AuthResult, error) {
	// Check if user already exists
	var existingUser models.User
	result := s.db.Where("email = ?", email).First(&existingUser)
	if result.Error == nil {
		return &AuthResult{
			Success: false,
			Error:   "User with this email already exists",
		}, nil
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Generate verification token
	verificationToken := uuid.New().String()

	// Set reset date to start of next month
	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)
	resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)

	// Create user
	user := models.User{
		ID:                  uuid.New().String(),
		Name:                name,
		Email:               email,
		Password:            string(hashedPassword),
		VerificationToken:   &verificationToken,
		IsEmailVerified:     false,
		Balance:             0,
		FreeOperationsUsed:  0,
		FreeOperationsReset: resetDate,
		Role:                "user",
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, err
	}

	// Create a session record
	expiry := time.Now().Add(time.Hour * 24 * 7) // 7 days
	session := models.Session{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		SessionToken: token,
		Expires:      expiry,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save the session to database
	if err := s.db.Create(&session).Error; err != nil {
		fmt.Printf("Error creating session record: %v\n", err)
	}

	return &AuthResult{
		Success: true,
		Token:   token,
		User:    &user,
	}, nil
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(email, password string) (*AuthResult, error) {
	// Find user
	var user models.User
	result := s.db.Where("email = ?", email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return &AuthResult{
			Success: false,
			Error:   "Invalid email or password",
		}, nil
	} else if result.Error != nil {
		return nil, result.Error
	}

	// Check password
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return &AuthResult{
			Success: false,
			Error:   "Invalid email or password",
		}, nil
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, err
	}

	// Create a session record in the database
	expiry := time.Now().Add(time.Hour * 24 * 7) // 7 days
	session := models.Session{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		SessionToken: token,
		Expires:      expiry,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Save the session to database
	if err := s.db.Create(&session).Error; err != nil {
		// Log the error but don't fail the login
		fmt.Printf("Error creating session record: %v\n", err)
	}
	return &AuthResult{
		Success: true,
		Token:   token,
		User:    &user,
	}, nil
}

// RequestPasswordReset creates a password reset token
func (s *AuthService) RequestPasswordReset(email string) (*models.PasswordResetToken, error) {
	// Find user
	var user models.User
	result := s.db.Where("email = ?", email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Don't reveal if email exists or not
		return nil, nil
	} else if result.Error != nil {
		return nil, result.Error
	}

	// Generate reset token
	token := uuid.New().String()
	expires := time.Now().Add(time.Hour)

	// Delete any existing reset tokens for this user
	if err := s.db.Where("email = ?", email).Delete(&models.PasswordResetToken{}).Error; err != nil {
		return nil, err
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
		return nil, err
	}

	return &resetToken, nil
}

// ValidateResetToken checks if a reset token is valid
func (s *AuthService) ValidateResetToken(token string) (bool, error) {
	var resetToken models.PasswordResetToken
	result := s.db.Where("token = ?", token).First(&resetToken)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return false, nil
	} else if result.Error != nil {
		return false, result.Error
	}

	// Check if token has expired
	if resetToken.Expires.Before(time.Now()) {
		return false, nil
	}

	return true, nil
}

// ResetPassword changes a user's password using a reset token
func (s *AuthService) ResetPassword(token, newPassword string) error {
	var resetToken models.PasswordResetToken
	result := s.db.Where("token = ?", token).First(&resetToken)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("invalid token")
	} else if result.Error != nil {
		return result.Error
	}

	// Check if token has expired
	if resetToken.Expires.Before(time.Now()) {
		return errors.New("token has expired")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Update user's password
	if err := s.db.Model(&models.User{}).
		Where("email = ?", resetToken.Email).
		Update("password", string(hashedPassword)).Error; err != nil {
		return err
	}

	// Delete the used token
	if err := s.db.Delete(&resetToken).Error; err != nil {
		return err
	}

	return nil
}

// VerifyEmail marks a user's email as verified
func (s *AuthService) VerifyEmail(token string) error {
	var user models.User
	result := s.db.Where("verification_token = ?", token).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("invalid token")
	} else if result.Error != nil {
		return result.Error
	}

	// Update user
	return s.db.Model(&user).Updates(map[string]interface{}{
		"is_email_verified":  true,
		"verification_token": nil,
		"email_verified":     time.Now(),
	}).Error
}

// ResendVerificationEmail creates a new verification token
func (s *AuthService) ResendVerificationEmail(userID string) (string, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return "", err
	}

	// Check if already verified
	if user.IsEmailVerified {
		return "", errors.New("email is already verified")
	}

	// Generate new token
	verificationToken := uuid.New().String()

	// Update user
	if err := s.db.Model(&user).Update("verification_token", verificationToken).Error; err != nil {
		return "", err
	}

	return verificationToken, nil
}

// generateToken creates a new JWT token for a user
func (s *AuthService) generateToken(userID string) (string, error) {
	// Create the token
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims
	claims := token.Claims.(jwt.MapClaims)
	claims["sub"] = userID
	claims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix() // 7 days

	// Sign the token
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken checks if a JWT token is valid
func (s *AuthService) ValidateToken(tokenString string) (string, error) {
	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}

		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	// Validate the token
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := claims["sub"].(string)

		// Only check database if we have a DB connection
		if s.db != nil {
			// Check session in database (add this functionality)
			var session models.Session
			result := s.db.Where("session_token = ? AND expires > ?", tokenString, time.Now()).First(&session)

			if result.Error != nil {
				// If no session found, token is invalid
				if errors.Is(result.Error, gorm.ErrRecordNotFound) {
					return "", errors.New("no valid session found for token")
				}
				return "", result.Error
			}

			// Return the user ID from the session
			return session.UserID, nil
		}

		// If no DB connection, just return the user ID from the token
		return userID, nil
	}

	return "", errors.New("invalid token")
}

// GetUser retrieves a user by ID
func (s *AuthService) GetUser(id string) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
