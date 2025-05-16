// internal/db/database.go
package db

import (
	"os"
	"path/filepath"

	"github.com/Caqil/megapdf-api/internal/models"
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
	config := &gorm.Config{}
	
	// Enable SQL logging in development mode
	if os.Getenv("DEBUG") == "true" {
		config.Logger = logger.Default.LogMode(logger.Info)
	}
	
	db, err := gorm.Open(sqlite.Open(dbPath), config)
	if err != nil {
		return nil, err
	}
	
	// Auto-migrate the database
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
	)
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}