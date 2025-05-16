// internal/config/loader.go
package config

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/viper"
)

// Environment constants
const (
	EnvDevelopment = "development"
	EnvProduction  = "production"
	EnvTesting     = "testing"
)

// ConfigLoader is responsible for loading configuration
type ConfigLoader struct {
	// Viper instance for configuration
	viper *viper.Viper
	// Environment (development, production, testing)
	environment string
	// Configuration paths to search in
	configPaths []string
	// Config file name
	configName string
}

// NewConfigLoader creates a new config loader
func NewConfigLoader() *ConfigLoader {
	return &ConfigLoader{
		viper:       viper.New(),
		environment: getEnvironment(),
		configPaths: []string{
			"./configs",
			"../configs",
			"../../configs",
			".",
		},
		configName: "config",
	}
}

// Load loads the configuration from files and environment variables
func (l *ConfigLoader) Load() (*Config, error) {
	// Set up viper
	l.setupViper()

	// Set default values
	l.setDefaults()

	// Try to read configuration file
	err := l.viper.ReadInConfig()
	if err != nil {
		// It's ok if config file is not found, but other errors are not
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
		// Log that we're using default configuration
		fmt.Println("Configuration file not found, using default and environment values")
	} else {
		fmt.Printf("Using configuration file: %s\n", l.viper.ConfigFileUsed())
	}

	// Try to load environment-specific config
	l.loadEnvironmentConfig()

	// Override with environment variables
	l.viper.AutomaticEnv()
	l.viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Unmarshal into config struct
	var config Config
	if err := l.viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	// Validate configuration
	if err := l.validateConfig(&config); err != nil {
		return nil, fmt.Errorf("configuration validation error: %w", err)
	}

	// Set environment in config
	config.Environment = l.environment

	return &config, nil
}

// setupViper configures viper for config loading
func (l *ConfigLoader) setupViper() {
	l.viper.SetConfigName(l.configName)
	l.viper.SetConfigType("yaml")

	// Add config paths
	for _, path := range l.configPaths {
		l.viper.AddConfigPath(path)
	}

	// Case insensitivity for environment variables
	l.viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
}

// loadEnvironmentConfig loads environment-specific configuration
func (l *ConfigLoader) loadEnvironmentConfig() {
	// Try to load environment-specific config file
	envConfigName := fmt.Sprintf("config.%s", l.environment)
	l.viper.SetConfigName(envConfigName)

	// Try to read the environment-specific config
	if err := l.viper.MergeInConfig(); err != nil {
		// It's ok if the file is not found
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			fmt.Printf("Error loading environment config: %v\n", err)
		}
	} else {
		fmt.Printf("Loaded environment-specific config: %s\n", l.viper.ConfigFileUsed())
	}

	// Reset the config name for potential future operations
	l.viper.SetConfigName(l.configName)
}

// setDefaults sets default configuration values
func (l *ConfigLoader) setDefaults() {
	// Server defaults
	l.viper.SetDefault("SERVER_HOST", "0.0.0.0")
	l.viper.SetDefault("SERVER_PORT", 8080)

	// Database defaults
	l.viper.SetDefault("DB_HOST", "localhost")
	l.viper.SetDefault("DB_PORT", 5432)
	l.viper.SetDefault("DB_USER", "postgres")
	l.viper.SetDefault("DB_NAME", "megapdf")
	l.viper.SetDefault("DB_SSLMODE", "disable")

	// JWT defaults
	l.viper.SetDefault("JWT_EXPIRY_HOURS", 24)
	l.viper.SetDefault("JWT_REFRESH_HOURS", 168) // 7 days

	// Storage defaults
	l.viper.SetDefault("STORAGE_UPLOAD_DIR", "./data/uploads")
	l.viper.SetDefault("STORAGE_PROCESSED_DIR", "./data/processed")
	l.viper.SetDefault("STORAGE_TEMP_DIR", "./data/temp")
	l.viper.SetDefault("STORAGE_RETENTION_HOURS", 24)

	// API rate limits
	l.viper.SetDefault("RATE_LIMIT_REQUESTS", 100)
	l.viper.SetDefault("RATE_LIMIT_WINDOW_SECONDS", 60)

	// Email defaults
	l.viper.SetDefault("EMAIL_PORT", 587)
	l.viper.SetDefault("EMAIL_FROM", "noreply@example.com")

	// Billing defaults
	l.viper.SetDefault("BILLING_FREE_OPERATIONS_MONTHLY", 500)
	l.viper.SetDefault("BILLING_OPERATION_COST", 0.005)
	l.viper.SetDefault("PAYPAL_SANDBOX", true)

	// CORS defaults
	l.viper.SetDefault("CORS_ALLOW_ORIGINS", []string{"*"})
	l.viper.SetDefault("CORS_ALLOW_METHODS", []string{
		"GET", "POST", "PUT", "DELETE", "OPTIONS",
	})
	l.viper.SetDefault("CORS_ALLOW_HEADERS", []string{
		"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key",
	})
	l.viper.SetDefault("CORS_EXPOSE_HEADERS", []string{
		"Content-Length", "Content-Disposition",
	})
	l.viper.SetDefault("CORS_ALLOW_CREDENTIALS", true)
	l.viper.SetDefault("CORS_MAX_AGE", 12) // hours
}

// validateConfig validates the loaded configuration
func (l *ConfigLoader) validateConfig(config *Config) error {
	// Validate required fields
	if config.JWT.Secret == "" && l.environment != EnvTesting {
		return errors.New("JWT_SECRET is required in production and development environments")
	}

	// Verify storage directories exist or can be created
	for _, dir := range []string{
		config.Storage.UploadDir,
		config.Storage.ProcessedDir,
		config.Storage.TempDir,
	} {
		if err := ensureDirectoryExists(dir); err != nil {
			return fmt.Errorf("storage directory error: %w", err)
		}
	}

	// Additional validations
	if config.Billing.OperationCost <= 0 {
		return errors.New("operation cost must be greater than 0")
	}

	return nil
}

// ensureDirectoryExists checks if a directory exists and creates it if not
func ensureDirectoryExists(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return os.MkdirAll(dir, 0755)
	}
	return nil
}

// getEnvironment determines the current environment
func getEnvironment() string {
	env := os.Getenv("APP_ENV")
	switch env {
	case EnvProduction, EnvDevelopment, EnvTesting:
		return env
	default:
		// Default to development if not specified
		return EnvDevelopment
	}
}

// LoadConfig is a convenience function to create a config loader and load config
func LoadConfig() (*Config, error) {
	loader := NewConfigLoader()
	return loader.Load()
}
