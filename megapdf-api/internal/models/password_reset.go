package models

import (
	"time"
)

// PasswordResetToken represents a password reset token
type PasswordResetToken struct {
	ID        string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"size:255;not null;index" json:"email"`
	Token     string    `gorm:"size:255;uniqueIndex;not null" json:"token"`
	Expires   time.Time `gorm:"not null" json:"expires"`
	CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
}
