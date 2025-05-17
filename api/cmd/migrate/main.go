// cmd/migrate/main.go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	"github.com/Caqil/megapdf-api/internal/db"
	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

// PrismaUser represents a user from Prisma's JSON export
type PrismaUser struct {
	ID                  string     `json:"id"`
	Name                string     `json:"name"`
	Email               string     `json:"email"`
	EmailVerified       *time.Time `json:"emailVerified"`
	Image               string     `json:"image"`
	Password            string     `json:"password"`
	Role                string     `json:"role"`
	VerificationToken   *string    `json:"verificationToken"`
	IsEmailVerified     bool       `json:"isEmailVerified"`
	Balance             float64    `json:"balance"`
	FreeOperationsUsed  int        `json:"freeOperationsUsed"`
	FreeOperationsReset time.Time  `json:"freeOperationsReset"`
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
}

// PrismaTransaction represents a transaction from Prisma's JSON export
type PrismaTransaction struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	Amount       float64   `json:"amount"`
	BalanceAfter float64   `json:"balanceAfter"`
	Description  string    `json:"description"`
	PaymentID    string    `json:"paymentId"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
}

// PrismaApiKey represents an API key from Prisma's JSON export
type PrismaApiKey struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	Name        string     `json:"name"`
	Key         string     `json:"key"`
	Permissions []string   `json:"permissions"`
	LastUsed    *time.Time `json:"lastUsed"`
	ExpiresAt   *time.Time `json:"expiresAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: No .env file found. Using environment variables.")
	}

	// Initialize SQLite database
	database, err := db.InitDB()
	if err != nil {
		fmt.Printf("Failed to initialize database: %v\n", err)
		os.Exit(1)
	}

	// Check if migration data directory exists
	migrationDir := "migration_data"
	if _, err := os.Stat(migrationDir); os.IsNotExist(err) {
		fmt.Printf("Migration data directory '%s' not found. Create it and place your Prisma JSON exports there.\n", migrationDir)
		os.Exit(1)
	}

	// Migrate users
	if err := migrateUsers(database, migrationDir); err != nil {
		fmt.Printf("Failed to migrate users: %v\n", err)
		os.Exit(1)
	}

	// Migrate transactions
	if err := migrateTransactions(database, migrationDir); err != nil {
		fmt.Printf("Failed to migrate transactions: %v\n", err)
		os.Exit(1)
	}

	// Migrate API keys
	if err := migrateApiKeys(database, migrationDir); err != nil {
		fmt.Printf("Failed to migrate API keys: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Migration completed successfully!")
}

func migrateUsers(db *gorm.DB, migrationDir string) error {
	fmt.Println("Migrating users...")

	// Load users JSON
	usersFile := filepath.Join(migrationDir, "users.json")
	if _, err := os.Stat(usersFile); os.IsNotExist(err) {
		fmt.Println("No users.json found, skipping user migration")
		return nil
	}

	data, err := ioutil.ReadFile(usersFile)
	if err != nil {
		return fmt.Errorf("failed to read users file: %w", err)
	}

	var prismaUsers []PrismaUser
	if err := json.Unmarshal(data, &prismaUsers); err != nil {
		return fmt.Errorf("failed to parse users JSON: %w", err)
	}

	for _, pu := range prismaUsers {
		// Check if user already exists
		var count int64
		db.Model(&models.User{}).Where("id = ?", pu.ID).Count(&count)
		if count > 0 {
			fmt.Printf("User %s already exists, skipping\n", pu.ID)
			continue
		}

		// Create SQLite user
		user := models.User{
			ID:                  pu.ID,
			Name:                pu.Name,
			Email:               pu.Email,
			EmailVerified:       pu.EmailVerified,
			Image:               pu.Image,
			Password:            pu.Password,
			Role:                pu.Role,
			VerificationToken:   pu.VerificationToken,
			IsEmailVerified:     pu.IsEmailVerified,
			Balance:             pu.Balance,
			FreeOperationsUsed:  pu.FreeOperationsUsed,
			FreeOperationsReset: pu.FreeOperationsReset,
			CreatedAt:           pu.CreatedAt,
			UpdatedAt:           pu.UpdatedAt,
		}

		if err := db.Create(&user).Error; err != nil {
			return fmt.Errorf("failed to create user %s: %w", pu.ID, err)
		}

		fmt.Printf("Migrated user: %s (%s)\n", pu.Email, pu.ID)
	}

	fmt.Printf("Migrated %d users\n", len(prismaUsers))
	return nil
}

func migrateTransactions(db *gorm.DB, migrationDir string) error {
	fmt.Println("Migrating transactions...")

	// Load transactions JSON
	txFile := filepath.Join(migrationDir, "transactions.json")
	if _, err := os.Stat(txFile); os.IsNotExist(err) {
		fmt.Println("No transactions.json found, skipping transaction migration")
		return nil
	}

	data, err := ioutil.ReadFile(txFile)
	if err != nil {
		return fmt.Errorf("failed to read transactions file: %w", err)
	}

	var prismaTxs []PrismaTransaction
	if err := json.Unmarshal(data, &prismaTxs); err != nil {
		return fmt.Errorf("failed to parse transactions JSON: %w", err)
	}

	for _, pt := range prismaTxs {
		// Check if transaction already exists
		var count int64
		db.Model(&models.Transaction{}).Where("id = ?", pt.ID).Count(&count)
		if count > 0 {
			fmt.Printf("Transaction %s already exists, skipping\n", pt.ID)
			continue
		}

		// Check if user exists
		var userCount int64
		db.Model(&models.User{}).Where("id = ?", pt.UserID).Count(&userCount)
		if userCount == 0 {
			fmt.Printf("User %s for transaction %s not found, skipping\n", pt.UserID, pt.ID)
			continue
		}

		// Create SQLite transaction
		tx := models.Transaction{
			ID:           pt.ID,
			UserID:       pt.UserID,
			Amount:       pt.Amount,
			BalanceAfter: pt.BalanceAfter,
			Description:  pt.Description,
			PaymentID:    pt.PaymentID,
			Status:       pt.Status,
			CreatedAt:    pt.CreatedAt,
		}

		if err := db.Create(&tx).Error; err != nil {
			return fmt.Errorf("failed to create transaction %s: %w", pt.ID, err)
		}

		fmt.Printf("Migrated transaction: %s\n", pt.ID)
	}

	fmt.Printf("Migrated %d transactions\n", len(prismaTxs))
	return nil
}

func migrateApiKeys(db *gorm.DB, migrationDir string) error {
	fmt.Println("Migrating API keys...")

	// Load API keys JSON
	keysFile := filepath.Join(migrationDir, "apikeys.json")
	if _, err := os.Stat(keysFile); os.IsNotExist(err) {
		fmt.Println("No apikeys.json found, skipping API key migration")
		return nil
	}

	data, err := ioutil.ReadFile(keysFile)
	if err != nil {
		return fmt.Errorf("failed to read API keys file: %w", err)
	}

	var prismaKeys []PrismaApiKey
	if err := json.Unmarshal(data, &prismaKeys); err != nil {
		return fmt.Errorf("failed to parse API keys JSON: %w", err)
	}

	for _, pk := range prismaKeys {
		// Check if key already exists
		var count int64
		db.Model(&models.ApiKey{}).Where("id = ?", pk.ID).Count(&count)
		if count > 0 {
			fmt.Printf("API key %s already exists, skipping\n", pk.ID)
			continue
		}

		// Check if user exists
		var userCount int64
		db.Model(&models.User{}).Where("id = ?", pk.UserID).Count(&userCount)
		if userCount == 0 {
			fmt.Printf("User %s for API key %s not found, skipping\n", pk.UserID, pk.ID)
			continue
		}

		// Create SQLite API key
		key := models.ApiKey{
			ID:          pk.ID,
			UserID:      pk.UserID,
			Name:        pk.Name,
			Key:         pk.Key,
			Permissions: pk.Permissions,
			LastUsed:    pk.LastUsed,
			ExpiresAt:   pk.ExpiresAt,
			CreatedAt:   pk.CreatedAt,
			UpdatedAt:   pk.UpdatedAt,
		}

		if err := db.Create(&key).Error; err != nil {
			return fmt.Errorf("failed to create API key %s: %w", pk.ID, err)
		}

		fmt.Printf("Migrated API key: %s\n", pk.ID)
	}

	fmt.Printf("Migrated %d API keys\n", len(prismaKeys))
	return nil
}
