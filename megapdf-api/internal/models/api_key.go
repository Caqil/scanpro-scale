package models

import (
	"time"
)

// APIKey represents an API key in the system
type APIKey struct {
	ID          string     `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID      string     `gorm:"type:uuid;not null" json:"userId"`
	Name        string     `gorm:"size:255;not null" json:"name"`
	Key         string     `gorm:"size:255;uniqueIndex;not null" json:"key"`
	Permissions []string   `gorm:"type:jsonb;not null" json:"permissions"`
	LastUsed    *time.Time `json:"lastUsed"`
	ExpiresAt   *time.Time `json:"expiresAt"`
	CreatedAt   time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`

	// Associations
	User User `gorm:"foreignKey:UserID" json:"-"`
}
