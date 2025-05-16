package models

import "time"

// TokenResponse is the response for login and token refresh
type TokenResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken,omitempty"`
	ExpiresAt    time.Time `json:"expiresAt"`
	TokenType    string    `json:"tokenType"`
	User         UserInfo  `json:"user"`
}

// UserInfo contains the public user information
type UserInfo struct {
	ID                      string     `json:"id"`
	Name                    string     `json:"name"`
	Email                   string     `json:"email"`
	Role                    string     `json:"role"`
	Balance                 float64    `json:"balance"`
	IsEmailVerified         bool       `json:"isEmailVerified"`
	FreeOperationsUsed      int        `json:"freeOperationsUsed"`
	FreeOperationsRemaining int        `json:"freeOperationsRemaining"`
	FreeOperationsReset     *time.Time `json:"freeOperationsReset"`
}

// ErrorResponse is the standard error response
type ErrorResponse struct {
	Error   string      `json:"error"`
	Success bool        `json:"success"`
	Details interface{} `json:"details,omitempty"`
}

// SuccessResponse is the standard success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// BillingDetails contains billing information for operations
type BillingDetails struct {
	UsedFreeOperation       bool    `json:"usedFreeOperation"`
	FreeOperationsRemaining int     `json:"freeOperationsRemaining"`
	CurrentBalance          float64 `json:"currentBalance"`
	OperationCost           float64 `json:"operationCost"`
}

// OperationResponse is the standard response for operations
type OperationResponse struct {
	Success      bool           `json:"success"`
	Message      string         `json:"message"`
	FileURL      string         `json:"fileUrl,omitempty"`
	Filename     string         `json:"filename,omitempty"`
	OriginalName string         `json:"originalName,omitempty"`
	Billing      BillingDetails `json:"billing,omitempty"`
}

// APIKeyResponse contains information about an API key
type APIKeyResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Key         string     `json:"key"` // Masked version of the key
	Permissions []string   `json:"permissions"`
	LastUsed    *time.Time `json:"lastUsed"`
	ExpiresAt   *time.Time `json:"expiresAt"`
	CreatedAt   time.Time  `json:"createdAt"`
}

// UserProfile contains profile and subscription information
type UserProfile struct {
	ID                      string     `json:"id"`
	Name                    string     `json:"name"`
	Email                   string     `json:"email"`
	Tier                    string     `json:"tier"`
	Status                  string     `json:"status"`
	Balance                 float64    `json:"balance"`
	Operations              int        `json:"operations"`
	Limit                   int        `json:"limit"`
	CurrentPeriodStart      time.Time  `json:"currentPeriodStart"`
	CurrentPeriodEnd        time.Time  `json:"currentPeriodEnd"`
	FreeOperationsUsed      int        `json:"freeOperationsUsed"`
	FreeOperationsRemaining int        `json:"freeOperationsRemaining"`
	FreeOperationsReset     *time.Time `json:"freeOperationsReset,omitempty"`
}

// BalanceResponse contains user balance information
type BalanceResponse struct {
	Success                 bool           `json:"success"`
	Balance                 float64        `json:"balance"`
	FreeOperationsUsed      int            `json:"freeOperationsUsed"`
	FreeOperationsRemaining int            `json:"freeOperationsRemaining"`
	FreeOperationsTotal     int            `json:"freeOperationsTotal"`
	NextResetDate           *time.Time     `json:"nextResetDate,omitempty"`
	Transactions            []Transaction  `json:"transactions,omitempty"`
	TotalOperations         int            `json:"totalOperations"`
	OperationCounts         map[string]int `json:"operationCounts"`
}
