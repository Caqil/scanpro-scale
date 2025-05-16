// internal/models/models.go
package models

import "time"

type User struct {
	ID                  string `gorm:"primaryKey;type:varchar(100)"`
	Name                string `gorm:"type:varchar(255)"`
	Email               string `gorm:"uniqueIndex;type:varchar(255)"`
	EmailVerified       *time.Time
	Image               string
	Password            string
	Role                string `gorm:"type:varchar(50);default:'user'"`
	VerificationToken   *string
	IsEmailVerified     bool    `gorm:"default:false"`
	Balance             float64 `gorm:"default:0"`
	FreeOperationsUsed  int     `gorm:"default:0"`
	FreeOperationsReset time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time

	Accounts     []Account     `gorm:"foreignKey:UserID"`
	ApiKeys      []ApiKey      `gorm:"foreignKey:UserID"`
	Sessions     []Session     `gorm:"foreignKey:UserID"`
	Transactions []Transaction `gorm:"foreignKey:UserID"`
	UsageStats   []UsageStats  `gorm:"foreignKey:UserID"`
}

type Transaction struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	UserID       string
	Amount       float64
	BalanceAfter float64
	Description  string
	PaymentID    string
	Status       string `gorm:"type:varchar(50);default:'completed'"`
	CreatedAt    time.Time

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Account struct {
	ID                string `gorm:"primaryKey;type:varchar(100)"`
	UserID            string
	Type              string
	Provider          string
	ProviderAccountID string
	RefreshToken      *string
	AccessToken       *string
	ExpiresAt         *int
	TokenType         *string
	Scope             *string
	IDToken           *string
	SessionState      *string
	CreatedAt         time.Time
	UpdatedAt         time.Time

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Session struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	SessionToken string `gorm:"uniqueIndex"`
	UserID       string
	Expires      time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type ApiKey struct {
	ID          string `gorm:"primaryKey;type:varchar(100)"`
	UserID      string
	Name        string
	Key         string   `gorm:"uniqueIndex"`
	Permissions []string `gorm:"type:json"`
	LastUsed    *time.Time
	ExpiresAt   *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type UsageStats struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string
	Operation string
	Count     int
	Date      time.Time
	CreatedAt time.Time
	UpdatedAt time.Time

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type PasswordResetToken struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	Email     string
	Token     string `gorm:"uniqueIndex"`
	Expires   time.Time
	CreatedAt time.Time
}

type VerificationToken struct {
	Identifier string `gorm:"uniqueIndex"`
	Token      string `gorm:"uniqueIndex"`
	Expires    time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type PaymentWebhookEvent struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	EventId      string
	EventType    string
	ResourceType string
	ResourceId   string
	RawData      string `gorm:"type:text"`
	CreatedAt    time.Time
}