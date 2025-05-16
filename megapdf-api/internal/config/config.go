package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

// Config holds all application configuration
type Config struct {
	Environment string `mapstructure:"ENVIRONMENT"`
	Server      ServerConfig
	Database    DatabaseConfig
	JWT         JWTConfig
	Storage     StorageConfig
	PDF         PDFConfig
	Email       EmailConfig
	Billing     BillingConfig
	CORS        CORSConfig
}

type ServerConfig struct {
	Host string `mapstructure:"SERVER_HOST"`
	Port int    `mapstructure:"SERVER_PORT"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"DB_HOST"`
	Port     int    `mapstructure:"DB_PORT"`
	User     string `mapstructure:"DB_USER"`
	Password string `mapstructure:"DB_PASSWORD"`
	DBName   string `mapstructure:"DB_NAME"`
	SSLMode  string `mapstructure:"DB_SSLMODE"`
}

type JWTConfig struct {
	Secret        string `mapstructure:"JWT_SECRET"`
	ExpiryHours   int    `mapstructure:"JWT_EXPIRY_HOURS"`
	RefreshSecret string `mapstructure:"JWT_REFRESH_SECRET"`
	RefreshHours  int    `mapstructure:"JWT_REFRESH_HOURS"`
}

type StorageConfig struct {
	UploadDir       string        `mapstructure:"STORAGE_UPLOAD_DIR"`
	ProcessedDir    string        `mapstructure:"STORAGE_PROCESSED_DIR"`
	TempDir         string        `mapstructure:"STORAGE_TEMP_DIR"`
	RetentionPeriod time.Duration `mapstructure:"STORAGE_RETENTION_HOURS"`
	BaseURL         string        `mapstructure:"STORAGE_BASE_URL"`
}

type PDFConfig struct {
	PDFCpuPath      string `mapstructure:"PDF_PDFCPU_PATH"`
	GhostscriptPath string `mapstructure:"PDF_GHOSTSCRIPT_PATH"`
	OCRMyPDFPath    string `mapstructure:"PDF_OCRMYPDF_PATH"`
	LibreofficePath string `mapstructure:"PDF_LIBREOFFICE_PATH"`
}

type EmailConfig struct {
	Host     string `mapstructure:"EMAIL_HOST"`
	Port     int    `mapstructure:"EMAIL_PORT"`
	User     string `mapstructure:"EMAIL_USER"`
	Password string `mapstructure:"EMAIL_PASSWORD"`
	From     string `mapstructure:"EMAIL_FROM"`
}

type BillingConfig struct {
	FreeOperationsMonthly int     `mapstructure:"BILLING_FREE_OPERATIONS_MONTHLY"`
	OperationCost         float64 `mapstructure:"BILLING_OPERATION_COST"`
	PayPalClientID        string  `mapstructure:"PAYPAL_CLIENT_ID"`
	PayPalClientSecret    string  `mapstructure:"PAYPAL_CLIENT_SECRET"`
	PayPalSandbox         bool    `mapstructure:"PAYPAL_SANDBOX"`
}

type CORSConfig struct {
	AllowOrigins     []string `mapstructure:"CORS_ALLOW_ORIGINS"`
	AllowMethods     []string `mapstructure:"CORS_ALLOW_METHODS"`
	AllowHeaders     []string `mapstructure:"CORS_ALLOW_HEADERS"`
	ExposeHeaders    []string `mapstructure:"CORS_EXPOSE_HEADERS"`
	AllowCredentials bool     `mapstructure:"CORS_ALLOW_CREDENTIALS"`
	MaxAge           int      `mapstructure:"CORS_MAX_AGE"`
}

// Load loads configuration from environment variables and/or config file
func Load() (*Config, error) {
	// First set defaults
	setDefaults()

	// Look for a config file
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath(".")

	// Read config file if it exists
	if err := viper.ReadInConfig(); err != nil {
		// It's ok if config file is not found, but other errors are not
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Override with environment variables
	viper.AutomaticEnv()

	// Unmarshal into config struct
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	return &config, nil
}

// setDefaults sets default values for configuration
func setDefaults() {
	// Server defaults
	viper.SetDefault("SERVER_HOST", "0.0.0.0")
	viper.SetDefault("SERVER_PORT", 8080)

	// Database defaults
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", 5432)
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_NAME", "megapdf")
	viper.SetDefault("DB_SSLMODE", "disable")

	// JWT defaults
	viper.SetDefault("JWT_EXPIRY_HOURS", 24)
	viper.SetDefault("JWT_REFRESH_HOURS", 168) // 7 days

	// Storage defaults
	viper.SetDefault("STORAGE_UPLOAD_DIR", "./data/uploads")
	viper.SetDefault("STORAGE_PROCESSED_DIR", "./data/processed")
	viper.SetDefault("STORAGE_TEMP_DIR", "./data/temp")
	viper.SetDefault("STORAGE_RETENTION_HOURS", 24)
	viper.SetDefault("STORAGE_BASE_URL", "/api/file")

	// Billing defaults
	viper.SetDefault("BILLING_FREE_OPERATIONS_MONTHLY", 500)
	viper.SetDefault("BILLING_OPERATION_COST", 0.005)

	// CORS defaults
	viper.SetDefault("CORS_ALLOW_ORIGINS", []string{"*"})
	viper.SetDefault("CORS_ALLOW_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	viper.SetDefault("CORS_ALLOW_HEADERS", []string{"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key"})
	viper.SetDefault("CORS_EXPOSE_HEADERS", []string{"Content-Length", "Content-Disposition"})
	viper.SetDefault("CORS_ALLOW_CREDENTIALS", true)
	viper.SetDefault("CORS_MAX_AGE", 12) // hours

	// PDF tool paths - empty means search in PATH
	viper.SetDefault("PDF_PDFCPU_PATH", "")
	viper.SetDefault("PDF_GHOSTSCRIPT_PATH", "")
	viper.SetDefault("PDF_OCRMYPDF_PATH", "")
	viper.SetDefault("PDF_LIBREOFFICE_PATH", "")

	// Default environment
	viper.SetDefault("ENVIRONMENT", "development")
}
