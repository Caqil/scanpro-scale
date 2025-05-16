package models

import (
	"time"
)

// User represents a user in the application
type User struct {
	ID                  string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Name                string     `gorm:"size:255" json:"name"`
	Email               string     `gorm:"size:255;uniqueIndex;not null" json:"email"`
	Password            string     `gorm:"size:255;not null" json:"-"` // Password is not exposed in JSON
	Role                string     `gorm:"size:50;not null;default:user" json:"role"`
	Balance             float64    `gorm:"type:decimal(10,2);not null;default:0" json:"balance"`
	FreeOperationsUsed  int        `gorm:"not null;default:0" json:"freeOperationsUsed"`
	FreeOperationsReset *time.Time `json:"freeOperationsReset"`
	IsEmailVerified     bool       `gorm:"not null;default:false" json:"isEmailVerified"`
	VerificationToken   *string    `json:"-"` // Not exposed in JSON
	EmailVerified       *time.Time `json:"emailVerified"`
	CreatedAt           time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt           time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`

	// Define relationships (optional)
	APIKeys      []APIKey      `gorm:"foreignKey:UserID" json:"-"`
	Transactions []Transaction `gorm:"foreignKey:UserID" json:"-"`
	UsageStats   []UsageStat   `gorm:"foreignKey:UserID" json:"-"`
}
