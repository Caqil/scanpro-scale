// internal/db/database.go
package db

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres" // Or mysql, depending on your Prisma database
	"gorm.io/gorm"
)

var DB *gorm.DB

// Initialize database connection
func InitDB() (*gorm.DB, error) {
	// Get database connection string from environment
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	// Connect to the database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}
