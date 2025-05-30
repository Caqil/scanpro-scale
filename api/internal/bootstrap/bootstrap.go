// internal/bootstrap/bootstrap.go
package bootstrap

import (
	"fmt"
	"os"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Bootstrap initializes the application
func Bootstrap() error {
	fmt.Println("Bootstrapping application...")

	// First, initialize the database with bootstrap values
	if err := initializeDatabase(); err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}

	// Initialize settings
	if err := initializeSettings(); err != nil {
		return fmt.Errorf("failed to initialize settings: %w", err)
	}

	// Load configuration
	configService := services.NewConfigService()
	_, err := configService.LoadConfig()
	if err != nil {
		return fmt.Errorf("failed to load configuration: %w", err)
	}

	fmt.Println("Application bootstrapped successfully!")
	return nil
}

// initializeDatabase initializes the database connection
func initializeDatabase() error {
	fmt.Println("Initializing database connection...")

	// Start with a minimal bootstrap configuration for database
	// We can't use config service yet since it relies on the database
	dbHost := getEnvOrDefault("DB_HOST", "localhost")
	dbPort := getEnvOrDefault("DB_PORT", "3306")
	dbName := getEnvOrDefault("DB_NAME", "megapdf")
	dbUser := getEnvOrDefault("DB_USER", "root")
	dbPassword := getEnvOrDefault("DB_PASSWORD", "")
	dbCharset := getEnvOrDefault("DB_CHARSET", "utf8mb4")
	dbCollation := getEnvOrDefault("DB_COLLATION", "utf8mb4_unicode_ci")
	dbTimezone := getEnvOrDefault("DB_TIMEZONE", "UTC")

	// Build DSN
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
		dbCharset, dbCollation, dbTimezone,
	)

	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to database
	database, err := gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := database.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Set global DB instance
	db.DB = database

	fmt.Println("Database connection established")
	return nil
}

// initializeSettings initializes default settings if they don't exist
func initializeSettings() error {
	fmt.Println("Initializing default settings...")

	// Create repository
	settingsRepo := repository.NewSettingsRepository()

	// Initialize default settings
	if err := settingsRepo.InitializeDefaultSettings(); err != nil {
		return fmt.Errorf("failed to initialize default settings: %w", err)
	}

	fmt.Println("Default settings initialized successfully")
	return nil
}

// getEnvOrDefault gets an environment variable or returns a default value
func getEnvOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
