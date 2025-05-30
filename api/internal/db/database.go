// internal/db/database.go
package db

import (
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Config interface for initialization
type Config interface {
	// Database fields
	GetDBHost() string
	GetDBPort() int
	GetDBName() string
	GetDBUser() string
	GetDBPassword() string
	GetDBCharset() string
	GetDBCollation() string
	GetDBTimezone() string
	GetDBMaxIdleConns() int
	GetDBMaxOpenConns() int
	GetDBConnMaxLifetime() string
	GetDebug() bool
}

// ConfigAdapter adapts our config to the interface
type ConfigAdapter struct {
	DBHost            string
	DBPort            int
	DBName            string
	DBUser            string
	DBPassword        string
	DBCharset         string
	DBCollation       string
	DBTimezone        string
	DBMaxIdleConns    int
	DBMaxOpenConns    int
	DBConnMaxLifetime string
	Debug             bool
}

func (c *ConfigAdapter) GetDBHost() string            { return c.DBHost }
func (c *ConfigAdapter) GetDBPort() int               { return c.DBPort }
func (c *ConfigAdapter) GetDBName() string            { return c.DBName }
func (c *ConfigAdapter) GetDBUser() string            { return c.DBUser }
func (c *ConfigAdapter) GetDBPassword() string        { return c.DBPassword }
func (c *ConfigAdapter) GetDBCharset() string         { return c.DBCharset }
func (c *ConfigAdapter) GetDBCollation() string       { return c.DBCollation }
func (c *ConfigAdapter) GetDBTimezone() string        { return c.DBTimezone }
func (c *ConfigAdapter) GetDBMaxIdleConns() int       { return c.DBMaxIdleConns }
func (c *ConfigAdapter) GetDBMaxOpenConns() int       { return c.DBMaxOpenConns }
func (c *ConfigAdapter) GetDBConnMaxLifetime() string { return c.DBConnMaxLifetime }
func (c *ConfigAdapter) GetDebug() bool               { return c.Debug }

// InitDB initializes the MySQL database connection
func InitDB(config Config) (*gorm.DB, error) {
	// Get database configuration
	dbHost := config.GetDBHost()
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := config.GetDBPort()
	if dbPort == 0 {
		dbPort = 3306
	}

	dbName := config.GetDBName()
	if dbName == "" {
		dbName = "megapdf"
	}

	dbUser := config.GetDBUser()
	if dbUser == "" {
		dbUser = "root"
	}

	dbPassword := config.GetDBPassword()

	dbCharset := config.GetDBCharset()
	if dbCharset == "" {
		dbCharset = "utf8mb4"
	}

	dbCollation := config.GetDBCollation()
	if dbCollation == "" {
		dbCollation = "utf8mb4_unicode_ci"
	}

	dbTimezone := config.GetDBTimezone()
	if dbTimezone == "" {
		dbTimezone = "UTC"
	}

	// Build MySQL connection string
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
		dbCharset, dbCollation, dbTimezone,
	)

	// Configure GORM
	gormConfig := &gorm.Config{
		NowFunc: func() time.Time {
			return time.Now().UTC() // Use UTC for consistent timestamps
		},
	}

	// Enable SQL logging in development mode
	if config.GetDebug() {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	fmt.Println("Connecting to MySQL database at:", dbHost+":"+fmt.Sprintf("%d", dbPort))
	db, err := gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}

	// Set connection pool settings
	maxIdleConns := config.GetDBMaxIdleConns()
	if maxIdleConns == 0 {
		maxIdleConns = 10
	}

	maxOpenConns := config.GetDBMaxOpenConns()
	if maxOpenConns == 0 {
		maxOpenConns = 100
	}

	connMaxLifetime := config.GetDBConnMaxLifetime()
	if connMaxLifetime == "" {
		connMaxLifetime = "1h"
	}

	duration, err := time.ParseDuration(connMaxLifetime)
	if err != nil {
		duration = time.Hour // Default to 1 hour
	}

	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(duration)

	// Store DB in package variable for global access
	DB = db
	fmt.Println("Database initialized successfully!")
	return db, nil
}

// TransactionFunc is a type for database transaction functions
type TransactionFunc func(tx *gorm.DB) error

// WithTransaction runs a function in a database transaction
func WithTransaction(fn TransactionFunc) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		return fn(tx)
	})
}
