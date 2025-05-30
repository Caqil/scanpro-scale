// internal/config/config.go
package config

import (
	"errors"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// Config uses the repository.Config struct as our configuration
type Config = repository.Config

var globalConfig *Config
var configRepo *repository.ConfigRepository

// Initialize initializes the config package
func Initialize() {
	configRepo = repository.NewConfigRepository()
}

// LoadConfig loads configuration from the database
func LoadConfig() (*Config, error) {
	if configRepo == nil {
		return nil, errors.New("config repository not initialized")
	}

	// Load config from database
	config, err := configRepo.LoadConfig()
	if err != nil {
		return nil, err
	}

	globalConfig = config
	return config, nil
}

// GetConfig returns the current configuration
func GetConfig() *Config {
	if globalConfig == nil {
		// Try to load it (ignore error, will use defaults if necessary)
		config, _ := LoadConfig()
		if config != nil {
			globalConfig = config
		} else {
			// Use default config if loading fails
			globalConfig = &Config{
				Port:      8080,
				TempDir:   "temp",
				UploadDir: "uploads",
				PublicDir: "public",
				Debug:     false,
			}
		}
	}
	return globalConfig
}

// RefreshConfig reloads configuration from the database
func RefreshConfig() (*Config, error) {
	if configRepo == nil {
		return nil, errors.New("config repository not initialized")
	}

	config, err := configRepo.LoadConfig()
	if err != nil {
		return nil, err
	}

	globalConfig = config
	return config, nil
}

// GetRateLimitDuration returns the rate limit duration
func GetRateLimitDuration(cfg *Config) time.Duration {
	if cfg == nil {
		cfg = GetConfig()
	}
	return time.Duration(cfg.RateLimitPeriod) * time.Second
}

// GetSplitAsSlice splits a string into a slice
func GetSplitAsSlice(value string, defaultValue string) []string {
	if value == "" {
		value = defaultValue
	}
	if value == "" {
		return []string{}
	}
	return strings.Split(value, ",")
}

// InitializeDefaultSettings initializes default settings in the database
func InitializeDefaultSettings() error {
	if configRepo == nil {
		return errors.New("config repository not initialized")
	}

	return configRepo.InitializeDefaultSettings()
}

// SaveConfig saves the configuration to the database
func SaveConfig(config *Config) error {
	if configRepo == nil {
		return errors.New("config repository not initialized")
	}

	return configRepo.SaveConfig(config)
}
