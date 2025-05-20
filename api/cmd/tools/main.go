// cmd/tools/migrate/main.go
package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to SQLite database (source)
	srcDB, err := connectSQLite()
	if err != nil {
		log.Fatalf("Failed to connect to SQLite database: %v", err)
	}

	// Connect to MySQL database (destination)
	destDB, err := connectMySQL()
	if err != nil {
		log.Fatalf("Failed to connect to MySQL database: %v", err)
	}

	// Auto-migrate schema in MySQL
	if err := autoMigrateMySQL(destDB); err != nil {
		log.Fatalf("Failed to migrate MySQL schema: %v", err)
	}

	// Migrate data from SQLite to MySQL
	if err := migrateData(srcDB, destDB); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration completed successfully!")
}

func connectSQLite() (*gorm.DB, error) {
	// Get database path from environment
	dbPath := os.Getenv("SQLITE_PATH")
	if dbPath == "" {
		dbPath = "data/megapdf.db"
	}

	log.Printf("Connecting to SQLite database at: %s", dbPath)

	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to SQLite
	return gorm.Open(sqlite.Open(dbPath), config)
}

func connectMySQL() (*gorm.DB, error) {
	// Get MySQL configuration from environment
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "megapdf")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbCharset := getEnv("DB_CHARSET", "utf8mb4")
	dbCollation := getEnv("DB_COLLATION", "utf8mb4_unicode_ci")
	dbTimezone := getEnv("DB_TIMEZONE", "UTC")

	// Build MySQL DSN
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
		dbCharset, dbCollation, dbTimezone,
	)

	log.Printf("Connecting to MySQL database at: %s:%s", dbHost, dbPort)

	// Configure GORM
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to MySQL
	db, err := gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func autoMigrateMySQL(db *gorm.DB) error {
	log.Println("Auto-migrating MySQL schema...")

	return db.AutoMigrate(
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
	)
}

func migrateData(srcDB, destDB *gorm.DB) error {
	// Migrate Users
	if err := migrateTable(srcDB, destDB, "users", &models.User{}, &[]models.User{}); err != nil {
		return fmt.Errorf("failed to migrate users: %w", err)
	}

	// Migrate Transactions
	if err := migrateTable(srcDB, destDB, "transactions", &models.Transaction{}, &[]models.Transaction{}); err != nil {
		return fmt.Errorf("failed to migrate transactions: %w", err)
	}

	// Migrate Accounts
	if err := migrateTable(srcDB, destDB, "accounts", &models.Account{}, &[]models.Account{}); err != nil {
		return fmt.Errorf("failed to migrate accounts: %w", err)
	}

	// Migrate Sessions
	if err := migrateTable(srcDB, destDB, "sessions", &models.Session{}, &[]models.Session{}); err != nil {
		return fmt.Errorf("failed to migrate sessions: %w", err)
	}

	// Migrate API Keys
	if err := migrateTable(srcDB, destDB, "api_keys", &models.ApiKey{}, &[]models.ApiKey{}); err != nil {
		return fmt.Errorf("failed to migrate api keys: %w", err)
	}

	// Migrate Usage Stats
	if err := migrateTable(srcDB, destDB, "usage_stats", &models.UsageStats{}, &[]models.UsageStats{}); err != nil {
		return fmt.Errorf("failed to migrate usage stats: %w", err)
	}

	// Migrate Password Reset Tokens
	if err := migrateTable(srcDB, destDB, "password_reset_tokens", &models.PasswordResetToken{}, &[]models.PasswordResetToken{}); err != nil {
		return fmt.Errorf("failed to migrate password reset tokens: %w", err)
	}

	// Migrate Verification Tokens
	if err := migrateTable(srcDB, destDB, "verification_tokens", &models.VerificationToken{}, &[]models.VerificationToken{}); err != nil {
		return fmt.Errorf("failed to migrate verification tokens: %w", err)
	}

	// Migrate Payment Webhook Events
	if err := migrateTable(srcDB, destDB, "payment_webhook_events", &models.PaymentWebhookEvent{}, &[]models.PaymentWebhookEvent{}); err != nil {
		return fmt.Errorf("failed to migrate payment webhook events: %w", err)
	}

	// Migrate Low Balance Alerts
	if err := migrateTable(srcDB, destDB, "low_balance_alerts", &models.LowBalanceAlert{}, &[]models.LowBalanceAlert{}); err != nil {
		return fmt.Errorf("failed to migrate low balance alerts: %w", err)
	}

	// Migrate Operations Alerts
	if err := migrateTable(srcDB, destDB, "operations_alerts", &models.OperationsAlert{}, &[]models.OperationsAlert{}); err != nil {
		return fmt.Errorf("failed to migrate operations alerts: %w", err)
	}

	// Migrate Pricing Settings
	if err := migrateTable(srcDB, destDB, "pricing_settings", &models.PricingSetting{}, &[]models.PricingSetting{}); err != nil {
		return fmt.Errorf("failed to migrate pricing settings: %w", err)
	}

	// Migrate Settings
	if err := migrateTable(srcDB, destDB, "settings", &models.Setting{}, &[]models.Setting{}); err != nil {
		return fmt.Errorf("failed to migrate settings: %w", err)
	}

	return nil
}

func migrateTable(srcDB, destDB *gorm.DB, tableName string, model interface{}, records interface{}) error {
	log.Printf("Migrating %s...", tableName)

	// Count records in source
	var count int64
	if err := srcDB.Table(tableName).Count(&count).Error; err != nil {
		return err
	}

	log.Printf("Found %d records in %s", count, tableName)

	// Skip if no records
	if count == 0 {
		log.Printf("No records to migrate for %s", tableName)
		return nil
	}

	// Fetch all records from source
	if err := srcDB.Table(tableName).Find(records).Error; err != nil {
		return err
	}

	// Disable foreign key checks for faster imports
	destDB.Exec("SET FOREIGN_KEY_CHECKS = 0")
	defer destDB.Exec("SET FOREIGN_KEY_CHECKS = 1")

	// Insert records into destination
	return destDB.Table(tableName).CreateInBatches(records, 100).Error
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
