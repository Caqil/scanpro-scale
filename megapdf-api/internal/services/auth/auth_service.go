package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"megapdf-api/internal/config"
	"megapdf-api/internal/models"
	"megapdf-api/internal/repositories"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	// FREE_OPERATIONS_MONTHLY is the number of free operations per month
	FREE_OPERATIONS_MONTHLY = 500
)

// Service provides authentication methods
type Service struct {
	db        *gorm.DB
	jwtSecret string
	jwtExpiry time.Duration
}

// NewService creates a new auth service
func NewService(cfg *config.JWTConfig) *Service {
	return &Service{
		db:        repositories.GetDB(),
		jwtSecret: cfg.Secret,
		jwtExpiry: time.Duration(cfg.ExpiryHours) * time.Hour,
	}
}

// Claims represents the JWT claims
type Claims struct {
	UserID string `json:"userID"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// APIKeyInfo contains information about an API key
type APIKeyInfo struct {
	ID          string
	UserID      string
	Permissions []string
}

// HasPermission checks if the API key has permission for an operation
func (k *APIKeyInfo) HasPermission(operation string) bool {
	for _, p := range k.Permissions {
		if p == "*" || p == operation {
			return true
		}
	}
	return false
}

// Login authenticates a user and returns a JWT token
func (s *Service) Login(ctx context.Context, email, password string) (*models.TokenResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate token
	token, expiresAt, err := s.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	// Prepare user info
	freeOpsRemaining := 0
	if user.FreeOperationsReset != nil && user.FreeOperationsReset.After(time.Now()) {
		freeOpsRemaining = FREE_OPERATIONS_MONTHLY - user.FreeOperationsUsed
	} else {
		freeOpsRemaining = FREE_OPERATIONS_MONTHLY // Reset if expired
	}

	// Return token response
	return &models.TokenResponse{
		AccessToken: token,
		ExpiresAt:   expiresAt,
		TokenType:   "Bearer",
		User: models.UserInfo{
			ID:                      user.ID,
			Name:                    user.Name,
			Email:                   user.Email,
			Role:                    user.Role,
			Balance:                 user.Balance,
			IsEmailVerified:         user.IsEmailVerified,
			FreeOperationsUsed:      user.FreeOperationsUsed,
			FreeOperationsRemaining: freeOpsRemaining,
			FreeOperationsReset:     user.FreeOperationsReset,
		},
	}, nil
}

// Register creates a new user account
func (s *Service) Register(ctx context.Context, name, email, password string) (*models.User, error) {
	// Check if user already exists
	var existingUser models.User
	result := s.db.Where("email = ?", email).First(&existingUser)
	if result.Error == nil {
		return nil, errors.New("user with this email already exists")
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

	// Calculate next month for free operations reset
	nextMonth := time.Now().AddDate(0, 1, 0)
	firstDayNextMonth := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

	// Create user
	user := models.User{
		ID:                  uuid.New().String(),
		Name:                name,
		Email:               email,
		Password:            string(hashedPassword),
		Role:                models.RoleUser,
		Balance:             0,
		FreeOperationsUsed:  0,
		FreeOperationsReset: &firstDayNextMonth,
		IsEmailVerified:     false,
		VerificationToken:   &verificationToken,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	// In a real implementation, we would send a verification email here

	return &user, nil
}

// ValidateToken validates a JWT token and returns the claims
func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	// Validate claims
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// ValidateAPIKey validates an API key and returns key info
func (s *Service) ValidateAPIKey(ctx context.Context, key string) (*APIKeyInfo, error) {
	var apiKey models.APIKey
	if err := s.db.Where("key = ?", key).First(&apiKey).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid API key")
		}
		return nil, err
	}

	// Check if expired
	if apiKey.ExpiresAt != nil && apiKey.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("API key has expired")
	}

	// Update last used
	now := time.Now()
	s.db.Model(&apiKey).Update("last_used", now)

	return &APIKeyInfo{
		ID:          apiKey.ID,
		UserID:      apiKey.UserID,
		Permissions: apiKey.Permissions,
	}, nil
}

// generateToken generates a new JWT token
func (s *Service) generateToken(userID, email, role string) (string, time.Time, error) {
	// Set expiration time
	expiresAt := time.Now().Add(s.jwtExpiry)

	// Create claims
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "megapdf-api",
		},
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// CreateAPIKey creates a new API key for a user
func (s *Service) CreateAPIKey(ctx context.Context, userID, name string, permissions []string) (*models.APIKey, error) {
	// Validate permissions
	if len(permissions) == 0 {
		// Default permissions
		permissions = []string{
			models.PermConvert,
			models.PermCompress,
			models.PermMerge,
			models.PermSplit,
		}
	} else if contains(permissions, "*") {
		// Wildcard permission
		permissions = []string{"*"}
	} else {
		// Filter valid permissions
		validPermissions := []string{}
		for _, p := range permissions {
			if contains(models.SupportedOperations, p) {
				validPermissions = append(validPermissions, p)
			}
		}
		permissions = validPermissions
	}

	// Generate key
	keyString := fmt.Sprintf("sk_%s", uuid.New().String())

	// Create API key
	apiKey := models.APIKey{
		ID:          uuid.New().String(),
		UserID:      userID,
		Name:        name,
		Key:         keyString,
		Permissions: permissions,
		CreatedAt:   time.Now(),
	}

	if err := s.db.Create(&apiKey).Error; err != nil {
		return nil, err
	}

	return &apiKey, nil
}

// DeleteAPIKey deletes an API key
func (s *Service) DeleteAPIKey(ctx context.Context, userID, keyID string) error {
	result := s.db.Where("id = ? AND user_id = ?", keyID, userID).Delete(&models.APIKey{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("API key not found or not owned by user")
	}
	return nil
}

// GetAPIKeys gets all API keys for a user
func (s *Service) GetAPIKeys(ctx context.Context, userID string) ([]models.APIKey, error) {
	var keys []models.APIKey
	if err := s.db.Where("user_id = ?", userID).Find(&keys).Error; err != nil {
		return nil, err
	}
	return keys, nil
}

// Helper function to check if a slice contains a value
func contains(slice []string, value string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}
