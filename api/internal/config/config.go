package config

import (
	"log"

	"github.com/Caqil/megapdf-api/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("database.db"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate models
	err = db.AutoMigrate(
		&models.User{},
		&models.Transaction{},
		&models.Account{},
		&models.Session{},
		&models.UsageStats{},
		&models.VerificationToken{},
		&models.ApiKey{},
		&models.PasswordResetToken{},
		&models.PaymentWebhookEvent{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	return db, nil
}
