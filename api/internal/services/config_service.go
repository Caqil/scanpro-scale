// internal/services/config_service.go
package services

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// ConfigService provides access to all application configuration
type ConfigService struct {
	settingsRepo *repository.SettingsRepository
	config       map[string]map[string]interface{}
}

// Config represents the application configuration
type Config struct {
	// General
	SiteName                 string
	SiteDescription          string
	MaintenanceMode          bool
	RegistrationEnabled      bool
	RequireEmailVerification bool
	AppURL                   string
	APIURL                   string
	Debug                    bool

	// Server
	Port int

	// Security
	JWTSecret                string
	PasswordMinLength        int
	PasswordRequireUppercase bool
	PasswordRequireNumbers   bool
	PasswordRequireSymbols   bool
	SessionTimeout           int
	MaxLoginAttempts         int
	CORSAllowedOrigins       []string

	// Email
	EmailProvider string
	FromEmail     string
	FromName      string
	SMTPHost      string
	SMTPPort      int
	SMTPUser      string
	SMTPPass      string
	SMTPSecure    bool

	// PayPal
	PayPalClientID     string
	PayPalClientSecret string
	PayPalAPIBase      string

	// API
	DefaultRateLimit int
	MaxFileSize      int
	APITimeout       int
	LoggingEnabled   bool
	LogLevel         string

	// Database
	DBHost            string
	DBPort            int
	DBName            string
	DBUser            string
	DBPassword        string
	DBCharset         string
	DBCollation       string
	DBTimezone        string
	DBMaxIdleConns    int
	DBMaxOpenConns    int
	DBConnMaxLifetime time.Duration

	// OAuth
	GoogleClientID     string
	GoogleClientSecret string
	OAuthRedirectURL   string

	// Storage
	TempDir     string
	UploadDir   string
	PublicDir   string
	StoragePath string

	// Pricing
	OperationCost         float64
	FreeOperationsMonthly int
}

var configInstance *ConfigService
var defaultConfig *Config

// NewConfigService creates a new ConfigService
func NewConfigService() *ConfigService {
	if configInstance == nil {
		configInstance = &ConfigService{
			settingsRepo: repository.NewSettingsRepository(),
			config:       make(map[string]map[string]interface{}),
		}
	}
	return configInstance
}

// LoadConfig loads the configuration from the database
func (s *ConfigService) LoadConfig() (*Config, error) {
	// Load all settings
	config, err := s.settingsRepo.GetAllSettings()
	if err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}

	// Store in service
	s.config = config

	// Create and return config object
	return s.buildConfig(), nil
}

// GetConfig returns the current configuration
func (s *ConfigService) GetConfig() *Config {
	if defaultConfig == nil {
		defaultConfig = s.buildConfig()
	}
	return defaultConfig
}

// RefreshConfig reloads the configuration from the database
func (s *ConfigService) RefreshConfig() (*Config, error) {
	config, err := s.LoadConfig()
	if err != nil {
		return nil, err
	}

	defaultConfig = config
	return config, nil
}

// buildConfig creates a Config object from the loaded settings
func (s *ConfigService) buildConfig() *Config {
	config := &Config{
		// Default values that will be overridden if found in settings
		SiteName:                 "MegaPDF",
		SiteDescription:          "Professional PDF tools and API services",
		Port:                     8080,
		MaintenanceMode:          false,
		RegistrationEnabled:      true,
		RequireEmailVerification: true,
		AppURL:                   "http://localhost:3000",
		APIURL:                   "http://localhost:8080",
		Debug:                    false,
		JWTSecret:                "your-default-secret-key",
		PasswordMinLength:        8,
		PasswordRequireUppercase: true,
		PasswordRequireNumbers:   true,
		PasswordRequireSymbols:   false,
		SessionTimeout:           24,
		MaxLoginAttempts:         5,
		CORSAllowedOrigins:       []string{"*"},
		EmailProvider:            "smtp",
		FromEmail:                "noreply@mega-pdf.com",
		FromName:                 "MegaPDF",
		SMTPPort:                 587,
		PayPalAPIBase:            "https://api-m.sandbox.paypal.com",
		DefaultRateLimit:         100,
		MaxFileSize:              50,
		APITimeout:               30,
		LoggingEnabled:           true,
		LogLevel:                 "info",
		DBHost:                   "localhost",
		DBPort:                   3306,
		DBName:                   "megapdf",
		DBUser:                   "root",
		DBCharset:                "utf8mb4",
		DBCollation:              "utf8mb4_unicode_ci",
		DBTimezone:               "UTC",
		DBMaxIdleConns:           10,
		DBMaxOpenConns:           100,
		DBConnMaxLifetime:        time.Hour,
		TempDir:                  "temp",
		UploadDir:                "uploads",
		PublicDir:                "public",
		StoragePath:              "./storage",
		OperationCost:            0.005,
		FreeOperationsMonthly:    500,
	}

	// Apply settings from each category
	s.applyGeneralSettings(config)
	s.applySecuritySettings(config)
	s.applyEmailSettings(config)
	s.applyPaymentSettings(config)
	s.applyAPISettings(config)
	s.applyDatabaseSettings(config)
	s.applyOAuthSettings(config)
	s.applyStorageSettings(config)
	s.applyPricingSettings(config)

	return config
}

// Apply settings by category
func (s *ConfigService) applyGeneralSettings(config *Config) {
	if general, ok := s.config["general"]; ok {
		if v, ok := general["siteName"].(string); ok {
			config.SiteName = v
		}
		if v, ok := general["siteDescription"].(string); ok {
			config.SiteDescription = v
		}
		if v, ok := general["maintenanceMode"].(bool); ok {
			config.MaintenanceMode = v
		}
		if v, ok := general["registrationEnabled"].(bool); ok {
			config.RegistrationEnabled = v
		}
		if v, ok := general["requireEmailVerification"].(bool); ok {
			config.RequireEmailVerification = v
		}
		if v, ok := general["appUrl"].(string); ok {
			config.AppURL = v
		}
		if v, ok := general["apiUrl"].(string); ok {
			config.APIURL = v
		}
		if v, ok := general["debug"].(bool); ok {
			config.Debug = v
		}
		if v, ok := general["port"].(float64); ok {
			config.Port = int(v)
		}
	}
}

func (s *ConfigService) applySecuritySettings(config *Config) {
	if security, ok := s.config["security"]; ok {
		if v, ok := security["jwtSecret"].(string); ok {
			config.JWTSecret = v
		}
		if v, ok := security["passwordMinLength"].(float64); ok {
			config.PasswordMinLength = int(v)
		}
		if v, ok := security["passwordRequireUppercase"].(bool); ok {
			config.PasswordRequireUppercase = v
		}
		if v, ok := security["passwordRequireNumbers"].(bool); ok {
			config.PasswordRequireNumbers = v
		}
		if v, ok := security["passwordRequireSymbols"].(bool); ok {
			config.PasswordRequireSymbols = v
		}
		if v, ok := security["sessionTimeout"].(float64); ok {
			config.SessionTimeout = int(v)
		}
		if v, ok := security["maxLoginAttempts"].(float64); ok {
			config.MaxLoginAttempts = int(v)
		}
		if v, ok := security["corsAllowedOrigins"].(string); ok {
			config.CORSAllowedOrigins = strings.Split(v, ",")
		}
	}
}

func (s *ConfigService) applyEmailSettings(config *Config) {
	if email, ok := s.config["email"]; ok {
		if v, ok := email["emailProvider"].(string); ok {
			config.EmailProvider = v
		}
		if v, ok := email["fromEmail"].(string); ok {
			config.FromEmail = v
		}
		if v, ok := email["fromName"].(string); ok {
			config.FromName = v
		}
		if v, ok := email["smtpHost"].(string); ok {
			config.SMTPHost = v
		}
		if v, ok := email["smtpPort"].(float64); ok {
			config.SMTPPort = int(v)
		}
		if v, ok := email["smtpUser"].(string); ok {
			config.SMTPUser = v
		}
		if v, ok := email["smtpPassword"].(string); ok {
			config.SMTPPass = v
		}
		if v, ok := email["smtpSecure"].(bool); ok {
			config.SMTPSecure = v
		}
	}
}

func (s *ConfigService) applyPaymentSettings(config *Config) {
	if payment, ok := s.config["payment"]; ok {
		if v, ok := payment["paypalClientId"].(string); ok {
			config.PayPalClientID = v
		}
		if v, ok := payment["paypalClientSecret"].(string); ok {
			config.PayPalClientSecret = v
		}
		if v, ok := payment["paypalApiBase"].(string); ok {
			config.PayPalAPIBase = v
		}
	}
}

func (s *ConfigService) applyAPISettings(config *Config) {
	if api, ok := s.config["api"]; ok {
		if v, ok := api["defaultRateLimit"].(float64); ok {
			config.DefaultRateLimit = int(v)
		}
		if v, ok := api["maxFileSize"].(float64); ok {
			config.MaxFileSize = int(v)
		}
		if v, ok := api["apiTimeout"].(float64); ok {
			config.APITimeout = int(v)
		}
		if v, ok := api["loggingEnabled"].(bool); ok {
			config.LoggingEnabled = v
		}
		if v, ok := api["logLevel"].(string); ok {
			config.LogLevel = v
		}
	}
}

func (s *ConfigService) applyDatabaseSettings(config *Config) {
	if database, ok := s.config["database"]; ok {
		if v, ok := database["dbHost"].(string); ok {
			config.DBHost = v
		}
		if v, ok := database["dbPort"].(float64); ok {
			config.DBPort = int(v)
		}
		if v, ok := database["dbName"].(string); ok {
			config.DBName = v
		}
		if v, ok := database["dbUser"].(string); ok {
			config.DBUser = v
		}
		if v, ok := database["dbPassword"].(string); ok {
			config.DBPassword = v
		}
		if v, ok := database["dbCharset"].(string); ok {
			config.DBCharset = v
		}
		if v, ok := database["dbCollation"].(string); ok {
			config.DBCollation = v
		}
		if v, ok := database["dbTimezone"].(string); ok {
			config.DBTimezone = v
		}
		if v, ok := database["dbMaxIdleConns"].(float64); ok {
			config.DBMaxIdleConns = int(v)
		}
		if v, ok := database["dbMaxOpenConns"].(float64); ok {
			config.DBMaxOpenConns = int(v)
		}
		if v, ok := database["dbConnMaxLifetime"].(string); ok {
			if duration, err := time.ParseDuration(v); err == nil {
				config.DBConnMaxLifetime = duration
			}
		}
	}
}

func (s *ConfigService) applyOAuthSettings(config *Config) {
	if oauth, ok := s.config["oauth"]; ok {
		if v, ok := oauth["googleClientId"].(string); ok {
			config.GoogleClientID = v
		}
		if v, ok := oauth["googleClientSecret"].(string); ok {
			config.GoogleClientSecret = v
		}
		if v, ok := oauth["oauthRedirectUrl"].(string); ok {
			config.OAuthRedirectURL = v
		}
	}
}

func (s *ConfigService) applyStorageSettings(config *Config) {
	if storage, ok := s.config["storage"]; ok {
		if v, ok := storage["tempDir"].(string); ok {
			config.TempDir = v
		}
		if v, ok := storage["uploadDir"].(string); ok {
			config.UploadDir = v
		}
		if v, ok := storage["publicDir"].(string); ok {
			config.PublicDir = v
		}
		if v, ok := storage["storagePath"].(string); ok {
			config.StoragePath = v
		}
	}
}

func (s *ConfigService) applyPricingSettings(config *Config) {
	if pricing, ok := s.config["pricing"]; ok {
		if v, ok := pricing["operationCost"].(float64); ok {
			config.OperationCost = v
		}
		if v, ok := pricing["freeOperationsMonthly"].(float64); ok {
			config.FreeOperationsMonthly = int(v)
		}
	}
}

// GetDatabaseDSN returns the database connection string
func (s *ConfigService) GetDatabaseDSN() string {
	config := s.GetConfig()
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		config.DBUser, config.DBPassword, config.DBHost, config.DBPort, config.DBName,
		config.DBCharset, config.DBCollation, config.DBTimezone,
	)
}

// GetConfig returns a single setting value
func (s *ConfigService) GetSetting(category, key string) (interface{}, error) {
	return s.settingsRepo.GetSetting(category, key)
}

// UpdateSettings updates settings for a category
func (s *ConfigService) UpdateSettings(category string, settings map[string]interface{}, description string) error {
	err := s.settingsRepo.SaveSettings(category, settings, description)
	if err != nil {
		return err
	}

	// Refresh config
	_, err = s.RefreshConfig()
	return err
}

// GetStringValue gets a string value from settings
func (s *ConfigService) GetStringValue(category, key, defaultValue string) string {
	value, err := s.settingsRepo.GetSetting(category, key)
	if err != nil || value == nil {
		return defaultValue
	}

	if strValue, ok := value.(string); ok {
		return strValue
	}

	return defaultValue
}

// GetIntValue gets an int value from settings
func (s *ConfigService) GetIntValue(category, key string, defaultValue int) int {
	value, err := s.settingsRepo.GetSetting(category, key)
	if err != nil || value == nil {
		return defaultValue
	}

	// Try to convert to int
	if floatValue, ok := value.(float64); ok {
		return int(floatValue)
	}

	if strValue, ok := value.(string); ok {
		if intValue, err := strconv.Atoi(strValue); err == nil {
			return intValue
		}
	}

	return defaultValue
}

// GetBoolValue gets a boolean value from settings
func (s *ConfigService) GetBoolValue(category, key string, defaultValue bool) bool {
	value, err := s.settingsRepo.GetSetting(category, key)
	if err != nil || value == nil {
		return defaultValue
	}

	if boolValue, ok := value.(bool); ok {
		return boolValue
	}

	if strValue, ok := value.(string); ok {
		if strValue == "true" {
			return true
		} else if strValue == "false" {
			return false
		}
	}

	return defaultValue
}

// GetFloatValue gets a float value from settings
func (s *ConfigService) GetFloatValue(category, key string, defaultValue float64) float64 {
	value, err := s.settingsRepo.GetSetting(category, key)
	if err != nil || value == nil {
		return defaultValue
	}

	if floatValue, ok := value.(float64); ok {
		return floatValue
	}

	if strValue, ok := value.(string); ok {
		if floatValue, err := strconv.ParseFloat(strValue, 64); err == nil {
			return floatValue
		}
	}

	return defaultValue
}
