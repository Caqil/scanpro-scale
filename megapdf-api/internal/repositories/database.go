// internal/repositories/database.go
package repositories

import (
	"fmt"
	"sync"

	"megapdf-api/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db     *gorm.DB
	dbOnce sync.Once
)

// InitDatabase initializes the database connection
func InitDatabase(cfg config.DatabaseConfig) (*gorm.DB, error) {
	var err error

	dbOnce.Do(func() {
		dsn := fmt.Sprintf(
			"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
			cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
		)

		// Configure the logger based on environment
		logLevel := logger.Silent
		if cfg.LogLevel == "info" {
			logLevel = logger.Info
		} else if cfg.LogLevel == "warn" {
			logLevel = logger.Warn
		} else if cfg.LogLevel == "error" {
			logLevel = logger.Error
		}

		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logLevel),
		})
	})

	return db, err
}

// GetDB returns the database connection
func GetDB() *gorm.DB {
	if db == nil {
		panic("database not initialized")
	}
	return db
}

// CloseDB closes the database connection
func CloseDB() error {
	if db == nil {
		return nil
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}
