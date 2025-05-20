// internal/models/models.go
package models

import "time"

type User struct {
	ID                  string `gorm:"primaryKey;type:varchar(100)"`
	Name                string `gorm:"type:varchar(255)"`
	Email               string `gorm:"uniqueIndex;type:varchar(255)"`
	EmailVerified       *time.Time
	Image               string  `gorm:"type:varchar(255)"`
	Password            string  `gorm:"type:varchar(255)"`
	Role                string  `gorm:"type:varchar(50);default:'user'"`
	VerificationToken   *string `gorm:"type:varchar(255)"`
	IsEmailVerified     bool    `gorm:"default:false"`
	Balance             float64 `gorm:"type:decimal(10,3);default:0"`
	FreeOperationsUsed  int     `gorm:"default:0"`
	FreeOperationsReset time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time

	// Relations - these fields won't be stored in the database
	// but will be used by GORM to load related records
	Accounts     []Account     `gorm:"foreignKey:UserID"`
	ApiKeys      []ApiKey      `gorm:"foreignKey:UserID"`
	Sessions     []Session     `gorm:"foreignKey:UserID"`
	Transactions []Transaction `gorm:"foreignKey:UserID"`
	UsageStats   []UsageStats  `gorm:"foreignKey:UserID"`
}

type Transaction struct {
	ID           string  `gorm:"primaryKey;type:varchar(100)"`
	UserID       string  `gorm:"type:varchar(100);index"`
	Amount       float64 `gorm:"type:decimal(10,2)"`
	BalanceAfter float64 `gorm:"type:decimal(10,2)"`
	Description  string  `gorm:"type:varchar(255)"`
	PaymentID    string  `gorm:"type:varchar(100)"`
	Status       string  `gorm:"type:varchar(50);default:'completed'"`
	CreatedAt    time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Account struct {
	ID                string  `gorm:"primaryKey;type:varchar(100)"`
	UserID            string  `gorm:"type:varchar(100);index"`
	Type              string  `gorm:"type:varchar(50)"`
	Provider          string  `gorm:"type:varchar(50)"`
	ProviderAccountID string  `gorm:"type:varchar(100)"`
	RefreshToken      *string `gorm:"type:text"`
	AccessToken       *string `gorm:"type:text"`
	ExpiresAt         *int
	TokenType         *string `gorm:"type:varchar(50)"`
	Scope             *string `gorm:"type:varchar(255)"`
	IDToken           *string `gorm:"type:text"`
	SessionState      *string `gorm:"type:varchar(255)"`
	CreatedAt         time.Time
	UpdatedAt         time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Session struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	SessionToken string `gorm:"uniqueIndex;type:varchar(255)"`
	UserID       string `gorm:"type:varchar(100);index"`
	Expires      time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// ApiKey model stores API keys for users
type ApiKey struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string `gorm:"type:varchar(100);index"`
	Name      string `gorm:"type:varchar(100)"`
	Key       string `gorm:"uniqueIndex;type:varchar(255)"`
	LastUsed  *time.Time
	ExpiresAt *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type UsageStats struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string `gorm:"type:varchar(100);index"`
	Operation string `gorm:"type:varchar(50);index"`
	Count     int
	Date      time.Time `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type PasswordResetToken struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	Email     string `gorm:"type:varchar(255);index"`
	Token     string `gorm:"uniqueIndex;type:varchar(255)"`
	Expires   time.Time
	CreatedAt time.Time
}

type VerificationToken struct {
	Identifier string `gorm:"uniqueIndex;type:varchar(255)"`
	Token      string `gorm:"uniqueIndex;type:varchar(255)"`
	Expires    time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type PaymentWebhookEvent struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	EventId      string `gorm:"type:varchar(100)"`
	EventType    string `gorm:"type:varchar(100)"`
	ResourceType string `gorm:"type:varchar(100)"`
	ResourceId   string `gorm:"type:varchar(100)"`
	RawData      string `gorm:"type:longtext"` // Using longtext for MySQL
	CreatedAt    time.Time
}

// LowBalanceAlert tracks when low balance warnings have been sent
type LowBalanceAlert struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string `gorm:"type:varchar(100);index"`
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// OperationsAlert tracks when operation limit warnings or exhausted notifications have been sent
type OperationsAlert struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string `gorm:"type:varchar(100);index"`
	Type      string `gorm:"type:varchar(50)"` // "warning" or "exhausted"
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
