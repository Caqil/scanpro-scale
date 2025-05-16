package models

import (
	"time"
)

// Transaction represents a financial transaction in the system
type Transaction struct {
	ID            string    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID        string    `gorm:"type:uuid;not null" json:"userId"`
	Amount        float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	BalanceAfter  float64   `gorm:"type:decimal(10,2);not null" json:"balanceAfter"`
	Description   string    `gorm:"type:text;not null" json:"description"`
	PaymentID     *string   `gorm:"size:255" json:"paymentId,omitempty"`
	Status        string    `gorm:"size:50;not null;default:pending" json:"status"`
	CreatedAt     time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"createdAt"`
	
	// Associations
	User          User     `gorm:"foreignKey:UserID" json:"-"`
}