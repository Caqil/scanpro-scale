// internal/db/database.go
package db

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the SQLite database connection
func InitDB() (*gorm.DB, error) {
	// Get database path from environment or use default
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		// Default to data directory in project root
		dbPath = "data/megapdf.db"
	}

	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	// Connect to SQLite database
	config := &gorm.Config{
		NowFunc: func() time.Time {
			return time.Now().UTC() // Use UTC for consistent timestamps
		},
	}

	// Enable SQL logging in development mode
	if os.Getenv("DEBUG") == "true" {
		config.Logger = logger.Default.LogMode(logger.Info)
	}

	fmt.Println("Connecting to SQLite database at:", dbPath)
	db, err := gorm.Open(sqlite.Open(dbPath), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SQLite database: %w", err)
	}

	// Enable foreign key constraints
	if err := db.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
		return nil, fmt.Errorf("failed to enable foreign key constraints: %w", err)
	}

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
		&models.LowBalanceAlert{}, // Add this line
		&models.OperationsAlert{},
		&models.PricingSetting{},
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
