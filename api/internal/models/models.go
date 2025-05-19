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

	// Relations - these fields won't be stored in the database
	// but will be used by GORM to load related records
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

	// Relations
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

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Session struct {
	ID           string `gorm:"primaryKey;type:varchar(100)"`
	SessionToken string `gorm:"uniqueIndex"`
	UserID       string
	Expires      time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// ApiKey model stores API keys for users
type ApiKey struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string
	Name      string
	Key       string `gorm:"uniqueIndex"`
	LastUsed  *time.Time
	ExpiresAt *time.Time
	CreatedAt time.Time
	UpdatedAt time.Time

	// Store permissions as a JSON string in SQLite
	// This will be converted to/from []string using hooks
	PermissionsJSON string `gorm:"column:permissions;type:text"`

	// This field won't be stored in the database but will be used to
	// access the permissions as a slice
	Permissions []string `gorm:"-"`

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// Hooks to convert between JSON string and Go slice for Permissions
func (a *ApiKey) BeforeSave() error {
	a.PermissionsJSON = ConvertToJSONArray(a.Permissions)
	return nil
}

func (a *ApiKey) AfterFind() error {
	a.Permissions = ConvertJSONArray(a.PermissionsJSON)
	return nil
}

type UsageStats struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string
	Operation string
	Count     int
	Date      time.Time
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relations
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

// LowBalanceAlert tracks when low balance warnings have been sent
type LowBalanceAlert struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// OperationsAlert tracks when operation limit warnings or exhausted notifications have been sent
type OperationsAlert struct {
	ID        string `gorm:"primaryKey;type:varchar(100)"`
	UserID    string
	Type      string `gorm:"type:varchar(50)"` // "warning" or "exhausted"
	CreatedAt time.Time

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}
