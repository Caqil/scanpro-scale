package models

import (
	"time"
)

// UsageStat tracks API usage statistics
type UsageStat struct {
	ID         string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID     string    `gorm:"type:uuid;not null" json:"userId"`
	Operation  string    `gorm:"size:50;not null" json:"operation"`
	Count      int       `gorm:"not null;default:1" json:"count"`
	Date       time.Time `gorm:"type:date;not null" json:"date"`
	CreatedAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updatedAt"`
	
	// Associations
	User       User      `gorm:"foreignKey:UserID" json:"-"`
}