package models

// LoginRequest defines the login request structure
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// RegisterRequest defines the registration request structure
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// ResetPasswordRequest defines the password reset request structure
type ResetPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ConfirmPasswordResetRequest defines the password reset confirmation request
type ConfirmPasswordResetRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

// CreateAPIKeyRequest defines the API key creation request
type CreateAPIKeyRequest struct {
	Name        string   `json:"name" binding:"required"`
	Permissions []string `json:"permissions"`
}

// DepositRequest defines the deposit request structure
type DepositRequest struct {
	Amount float64 `json:"amount" binding:"required,min=5"`
}

// ChangePasswordRequest defines the change password request
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
}

// UpdateProfileRequest defines the profile update request
type UpdateProfileRequest struct {
	Name string `json:"name" binding:"required"`
}
