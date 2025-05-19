// internal/db/database.go
package db

import (
	"fmt"
	"os"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the MySQL database connection
func InitDB() (*gorm.DB, error) {
	// Get database configuration from environment variables
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "megapdf")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbCharset := getEnv("DB_CHARSET", "utf8mb4")
	dbCollation := getEnv("DB_COLLATION", "utf8mb4_unicode_ci")
	dbTimezone := getEnv("DB_TIMEZONE", "UTC")

	// Build MySQL connection string
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
		dbCharset, dbCollation, dbTimezone,
	)

	// Configure GORM
	config := &gorm.Config{
		NowFunc: func() time.Time {
			return time.Now().UTC() // Use UTC for consistent timestamps
		},
	}

	// Enable SQL logging in development mode
	if os.Getenv("DEBUG") == "true" {
		config.Logger = logger.Default.LogMode(logger.Info)
	}

	fmt.Println("Connecting to MySQL database at:", dbHost+":"+dbPort)
	db, err := gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}

	// Set connection pool settings
	maxIdleConns := 10
	maxOpenConns := 100
	connMaxLifetime := time.Hour
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)

	// Auto-migrate all models
	fmt.Println("Auto-migrating database schema...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Transaction{},
		&models.Account{},
		&models.Session{},
		&models.ApiKey{},
		&models.UsageStats{},
		&models.PasswordResetToken{},
		&models.VerificationToken{},
		&models.PaymentWebhookEvent{},
		&models.LowBalanceAlert{},
		&models.OperationsAlert{},
		&models.PricingSetting{},
		&models.Setting{},
		// Add any other models here
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database schema: %w", err)
	}

	// Create admin user if it doesn't exist
	if err := createAdminUser(db); err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}

	// Store DB in package variable for global access
	DB = db
	fmt.Println("Database initialized successfully!")
	return db, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// createAdminUser creates a default admin user if no admin exists
func createAdminUser(db *gorm.DB) error {
	// Check if any admin users exist
	var adminCount int64
	if err := db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount).Error; err != nil {
		return err
	}

	return nil
}

// TransactionFunc is a type for database transaction functions
type TransactionFunc func(tx *gorm.DB) error

// WithTransaction runs a function in a database transaction
func WithTransaction(fn TransactionFunc) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		return fn(tx)
	})
}
