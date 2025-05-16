package models

import "time"

// SwaggerUser represents a user for Swagger documentation
// @Description User account information
type SwaggerUser struct {
	ID                  string     `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name                string     `json:"name" example:"John Doe"`
	Email               string     `json:"email" example:"user@example.com"`
	EmailVerified       *time.Time `json:"emailVerified"`
	Image               string     `json:"image"`
	Role                string     `json:"role" example:"user"`
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
	IsEmailVerified     bool       `json:"isEmailVerified" example:"false"`
	Balance             float64    `json:"balance" example:"100.50"`
	FreeOperationsReset time.Time  `json:"freeOperationsReset"`
	FreeOperationsUsed  int        `json:"freeOperationsUsed" example:"5"`
}

// SwaggerTransaction represents a transaction for Swagger documentation
// @Description Financial transaction record
type SwaggerTransaction struct {
	ID           string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	UserID       string    `json:"userId" example:"550e8400-e29b-41d4-a716-446655440000"`
	Amount       float64   `json:"amount" example:"25.99"`
	BalanceAfter float64   `json:"balanceAfter" example:"126.49"`
	Description  string    `json:"description" example:"Monthly subscription payment"`
	PaymentID    string    `json:"paymentId" example:"pay_12345"`
	Status       string    `json:"status" example:"completed"`
	CreatedAt    time.Time `json:"createdAt"`
}

// Add similar swagger model representations for other models...
