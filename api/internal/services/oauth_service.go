// internal/services/oauth_service.go
package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type OAuthService struct {
	db           *gorm.DB
	googleConfig *oauth2.Config
	jwtSecret    string
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

func NewOAuthService(db *gorm.DB, jwtSecret, googleClientID, googleClientSecret, redirectURL string) *OAuthService {
	googleConfig := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &OAuthService{
		db:           db,
		googleConfig: googleConfig,
		jwtSecret:    jwtSecret,
	}
}

// GenerateStateToken creates a secure random state token to prevent CSRF
func (s *OAuthService) GenerateStateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}

// GetGoogleAuthURL returns the Google OAuth URL
func (s *OAuthService) GetGoogleAuthURL(state string) string {
	return s.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// HandleGoogleCallback processes the Google OAuth callback
func (s *OAuthService) HandleGoogleCallback(code string) (*AuthResult, error) {
	// Exchange code for token
	token, err := s.googleConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %v", err)
	}

	// Get user info from Google
	userInfo, err := s.getGoogleUserInfo(token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %v", err)
	}

	// Find or create user in database
	return s.findOrCreateGoogleUser(userInfo, token)
}

// getGoogleUserInfo fetches the user's information from Google API
func (s *OAuthService) getGoogleUserInfo(accessToken string) (*GoogleUserInfo, error) {
	// Make request to Google's userinfo endpoint
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("userinfo request failed with status: %d", resp.StatusCode)
	}

	// Read and parse the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// findOrCreateGoogleUser finds an existing user or creates a new one based on Google profile
func (s *OAuthService) findOrCreateGoogleUser(userInfo *GoogleUserInfo, token *oauth2.Token) (*AuthResult, error) {
	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Look for existing account linked to this Google ID
	var account models.Account
	err := tx.Where("provider = ? AND provider_account_id = ?", "google", userInfo.ID).First(&account).Error

	// If account exists, get the user
	var user models.User
	if err == nil {
		// Found existing account, get the user
		if err := tx.First(&user, "id = ?", account.UserID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to find user for existing Google account: %v", err)
		}
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// No account found, check if user exists with this email
		err = tx.Where("email = ?", userInfo.Email).First(&user).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new user
			// Set reset date to start of next month
			now := time.Now()
			nextMonth := now.AddDate(0, 1, 0)
			resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

			user = models.User{
				ID:                  uuid.New().String(),
				Name:                userInfo.Name,
				Email:               userInfo.Email,
				IsEmailVerified:     userInfo.VerifiedEmail,
				Image:               userInfo.Picture,
				Role:                "user",
				FreeOperationsUsed:  0,
				FreeOperationsReset: resetDate,
				CreatedAt:           time.Now(),
				UpdatedAt:           time.Now(),
			}

			if userInfo.VerifiedEmail {
				user.EmailVerified = &now
			}

			if err := tx.Create(&user).Error; err != nil {
				tx.Rollback()
				return nil, fmt.Errorf("failed to create user: %v", err)
			}
		} else if err != nil {
			// Other error occurred
			tx.Rollback()
			return nil, fmt.Errorf("error checking for existing user: %v", err)
		}

		// Create new account
		refreshToken := ""
		if token.RefreshToken != "" {
			refreshToken = token.RefreshToken
		}

		expiresAt := 0
		if !token.Expiry.IsZero() {
			expiresAt = int(token.Expiry.Unix())
		}

		account = models.Account{
			ID:                uuid.New().String(),
			UserID:            user.ID,
			Type:              "oauth",
			Provider:          "google",
			ProviderAccountID: userInfo.ID,
			RefreshToken:      &refreshToken,
			AccessToken:       &token.AccessToken,
			ExpiresAt:         &expiresAt,
			TokenType:         &token.TokenType,
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}

		if err := tx.Create(&account).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create account: %v", err)
		}
	} else {
		// Other error occurred
		tx.Rollback()
		return nil, fmt.Errorf("error checking for existing account: %v", err)
	}

	// Generate JWT token
	authService := NewAuthService(s.db, s.jwtSecret)
	jwtToken, err := authService.generateToken(user.ID)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to generate token: %v", err)
	}

	// Create a session
	expiry := time.Now().Add(time.Hour * 24 * 7) // 7 days
	session := models.Session{
		ID:           uuid.New().String(),
		UserID:       user.ID,
		SessionToken: jwtToken,
		Expires:      expiry,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := tx.Create(&session).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create session: %v", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return &AuthResult{
		Success: true,
		Token:   jwtToken,
		User:    &user,
	}, nil
}
