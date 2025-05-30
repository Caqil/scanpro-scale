// internal/services/settings_service.go
package services

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// SettingsService handles application settings
type SettingsService struct {
	repo *repository.SettingsRepository
}

// NewSettingsService creates a new settings service
func NewSettingsService() *SettingsService {
	return &SettingsService{
		repo: repository.NewSettingsRepository(),
	}
}

// GetSettings gets all settings for a specific category
func (s *SettingsService) GetSettings(category string) (map[string]interface{}, error) {
	return s.repo.GetSettingsByCategory(category)
}

// UpdateSettings updates settings for a specific category
func (s *SettingsService) UpdateSettings(category string, settings map[string]interface{}, description string) error {
	return s.repo.SaveSettings(category, settings, description)
}

// GetAllSettings gets all settings from all categories
func (s *SettingsService) GetAllSettings() (map[string]interface{}, error) {
	categories := []string{"general", "api", "email", "security", "payment", "database", "oauth", "pricing"}
	allSettings := make(map[string]interface{})

	for _, category := range categories {
		settings, err := s.repo.GetSettingsByCategory(category)
		if err != nil {
			continue // Skip if category not found
		}
		allSettings[category] = settings
	}

	return allSettings, nil
}

// ApplySettings applies settings from database to environment variables
func (s *SettingsService) ApplySettings() error {
	// Fetch all settings
	allSettings, err := s.GetAllSettings()
	if err != nil {
		return err
	}

	// Map settings categories to environment variables
	setFromCategory(allSettings, "general", map[string]string{
		"siteName":                 "SITE_NAME",
		"siteDescription":          "SITE_DESCRIPTION",
		"maintenanceMode":          "MAINTENANCE_MODE",
		"registrationEnabled":      "REGISTRATION_ENABLED",
		"requireEmailVerification": "REQUIRE_EMAIL_VERIFICATION",
		"appUrl":                   "APP_URL",
		"apiUrl":                   "API_URL",
	})

	setFromCategory(allSettings, "security", map[string]string{
		"jwtSecret":                "JWT_SECRET",
		"passwordMinLength":        "PASSWORD_MIN_LENGTH",
		"passwordRequireUppercase": "PASSWORD_REQUIRE_UPPERCASE",
		"passwordRequireNumbers":   "PASSWORD_REQUIRE_NUMBERS",
		"passwordRequireSymbols":   "PASSWORD_REQUIRE_SYMBOLS",
		"sessionTimeout":           "SESSION_TIMEOUT",
		"maxLoginAttempts":         "MAX_LOGIN_ATTEMPTS",
		"corsAllowedOrigins":       "CORS_ALLOWED_ORIGINS",
	})

	setFromCategory(allSettings, "email", map[string]string{
		"emailProvider": "EMAIL_PROVIDER",
		"fromEmail":     "EMAIL_FROM",
		"fromName":      "EMAIL_FROM_NAME",
		"smtpHost":      "SMTP_HOST",
		"smtpPort":      "SMTP_PORT",
		"smtpUser":      "SMTP_USER",
		"smtpPassword":  "SMTP_PASS",
		"smtpSecure":    "SMTP_SECURE",
	})

	setFromCategory(allSettings, "payment", map[string]string{
		"paypalClientId":     "PAYPAL_CLIENT_ID",
		"paypalClientSecret": "PAYPAL_CLIENT_SECRET",
		"paypalApiBase":      "PAYPAL_API_BASE",
	})

	setFromCategory(allSettings, "api", map[string]string{
		"defaultRateLimit": "DEFAULT_RATE_LIMIT",
		"maxFileSize":      "MAX_FILE_SIZE",
		"apiTimeout":       "API_TIMEOUT",
		"loggingEnabled":   "LOGGING_ENABLED",
		"logLevel":         "LOG_LEVEL",
	})

	setFromCategory(allSettings, "database", map[string]string{
		"dbHost":         "DB_HOST",
		"dbPort":         "DB_PORT",
		"dbName":         "DB_NAME",
		"dbUser":         "DB_USER",
		"dbPassword":     "DB_PASSWORD",
		"dbMaxIdleConns": "DB_MAX_IDLE_CONNS",
		"dbMaxOpenConns": "DB_MAX_OPEN_CONNS",
	})

	setFromCategory(allSettings, "oauth", map[string]string{
		"googleClientId":     "GOOGLE_CLIENT_ID",
		"googleClientSecret": "GOOGLE_CLIENT_SECRET",
		"oauthRedirectUrl":   "OAUTH_REDIRECT_URL",
	})

	return nil
}

// setFromCategory sets environment variables from a settings category
func setFromCategory(allSettings map[string]interface{}, category string, mapping map[string]string) {
	if settings, ok := allSettings[category].(map[string]interface{}); ok {
		for settingKey, envVar := range mapping {
			if value, exists := settings[settingKey]; exists && value != nil {
				// Convert value to string based on type
				strValue := ""
				switch v := value.(type) {
				case string:
					strValue = v
				case float64:
					strValue = strconv.FormatFloat(v, 'f', -1, 64)
				case int:
					strValue = strconv.Itoa(v)
				case bool:
					strValue = strconv.FormatBool(v)
				case []interface{}:
					// Convert array to comma-separated string
					parts := make([]string, len(v))
					for i, item := range v {
						parts[i] = fmt.Sprintf("%v", item)
					}
					strValue = strings.Join(parts, ",")
				default:
					// Skip if can't convert
					continue
				}
				os.Setenv(envVar, strValue)
			}
		}
	}
}

// GetEnvironmentOverrides returns a map of settings that are overridden by environment variables
func (s *SettingsService) GetEnvironmentOverrides() map[string]map[string]string {
	overrides := make(map[string]map[string]string)

	// Define mappings of environment variables to settings categories
	mappings := map[string]map[string]string{
		"general": {
			"SITE_NAME":                  "siteName",
			"SITE_DESCRIPTION":           "siteDescription",
			"MAINTENANCE_MODE":           "maintenanceMode",
			"REGISTRATION_ENABLED":       "registrationEnabled",
			"REQUIRE_EMAIL_VERIFICATION": "requireEmailVerification",
			"APP_URL":                    "appUrl",
			"API_URL":                    "apiUrl",
		},
		"security": {
			"JWT_SECRET":                 "jwtSecret",
			"PASSWORD_MIN_LENGTH":        "passwordMinLength",
			"PASSWORD_REQUIRE_UPPERCASE": "passwordRequireUppercase",
			"PASSWORD_REQUIRE_NUMBERS":   "passwordRequireNumbers",
			"PASSWORD_REQUIRE_SYMBOLS":   "passwordRequireSymbols",
			"SESSION_TIMEOUT":            "sessionTimeout",
			"MAX_LOGIN_ATTEMPTS":         "maxLoginAttempts",
			"CORS_ALLOWED_ORIGINS":       "corsAllowedOrigins",
		},
		"email": {
			"EMAIL_PROVIDER":  "emailProvider",
			"EMAIL_FROM":      "fromEmail",
			"EMAIL_FROM_NAME": "fromName",
			"SMTP_HOST":       "smtpHost",
			"SMTP_PORT":       "smtpPort",
			"SMTP_USER":       "smtpUser",
			"SMTP_PASS":       "smtpPassword",
			"SMTP_SECURE":     "smtpSecure",
		},
		"payment": {
			"PAYPAL_CLIENT_ID":     "paypalClientId",
			"PAYPAL_CLIENT_SECRET": "paypalClientSecret",
			"PAYPAL_API_BASE":      "paypalApiBase",
		},
		"api": {
			"DEFAULT_RATE_LIMIT": "defaultRateLimit",
			"MAX_FILE_SIZE":      "maxFileSize",
			"API_TIMEOUT":        "apiTimeout",
			"LOGGING_ENABLED":    "loggingEnabled",
			"LOG_LEVEL":          "logLevel",
		},
		"database": {
			"DB_HOST":           "dbHost",
			"DB_PORT":           "dbPort",
			"DB_NAME":           "dbName",
			"DB_USER":           "dbUser",
			"DB_PASSWORD":       "dbPassword",
			"DB_MAX_IDLE_CONNS": "dbMaxIdleConns",
			"DB_MAX_OPEN_CONNS": "dbMaxOpenConns",
		},
		"oauth": {
			"GOOGLE_CLIENT_ID":     "googleClientId",
			"GOOGLE_CLIENT_SECRET": "googleClientSecret",
			"OAUTH_REDIRECT_URL":   "oauthRedirectUrl",
		},
	}

	// Check each environment variable
	for category, vars := range mappings {
		for envVar, settingKey := range vars {
			if value := os.Getenv(envVar); value != "" {
				if overrides[category] == nil {
					overrides[category] = make(map[string]string)
				}
				overrides[category][settingKey] = value
			}
		}
	}

	return overrides
}
