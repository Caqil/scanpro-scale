// internal/services/auth/jwt_service.go
package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/config"
)

// JWTClaims represents the claims in the JWT
type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// JWTService handles JWT operations
type JWTService struct {
	secretKey []byte
	issuer    string
	expiryDuration time.Duration
}

// NewJWTService creates a new JWTService
func NewJWTService() *JWTService {
	cfg := config.GetConfig()
	return &JWTService{