// internal/services/auth/apikey_service.go
package auth

import (
	"errors"
	"time"

	"github.com/rs/zerolog/log"

	"megapdf-api/internal/db/repositories"
)

// Validation result returned by API key validation
type ValidationResult struct {
	Valid       bool
	UserID      string
	KeyID       string
	Role        string
	Permissions []string
	Error       string
}

// Operation permissions constants
const (
	FREE_OPERATIONS_MONTHLY = 500   // Free operations per month
	OPERATION_COST          = 0.005 // Cost per operation in credits/dollars
)

// Supported API operations
var API_OPERATIONS = []string{
	"convert", "compress", "merge", "split", "watermark",
	"protect", "unlock", "remove", "rotate", "sign",
	"ocr", "repair", "pagenumber",
}

// APIKeyService handles API key operations
type APIKeyService struct {
	apiKeyRepo      *repositories.APIKeyRepository
	userRepo        *repositories.UserRepository
	usageRepo       *repositories.UsageRepository
	transactionRepo *repositories.TransactionRepository
}

// NewAPIKeyService creates a new APIKeyService
func NewAPIKeyService() *APIKeyService {
	return &APIKeyService{
		apiKeyRepo:      repositories.NewAPIKeyRepository(),
		userRepo:        repositories.NewUserRepository(),
		usageRepo:       repositories.NewUsageRepository(),
		transactionRepo: repositories.NewTransactionRepository(),
	}
}

// ValidateKey validates an API key and checks permissions for an operation
func (s *APIKeyService) ValidateKey(apiKey string, operation string) (ValidationResult, error) {
	result := ValidationResult{
		Valid: false,
	}

	if apiKey == "" {
		result.Error = "API key is required"
		return result, errors.New("API key is required")
	}

	// Find API key in database
	keyRecord, err := s.apiKeyRepo.FindByKey(apiKey)
	if err != nil {
		result.Error = "Invalid API key"
		return result, errors.New("invalid API key")
	}

	// Check if key has expired
	if keyRecord.ExpiresAt != nil && keyRecord.ExpiresAt.Before(time.Now()) {
		result.Error = "API key has expired"
		return result, errors.New("API key has expired")
	}

	// Get user info
	user, err := s.userRepo.FindByID(keyRecord.UserID)
	if err != nil {
		result.Error = "User not found for API key"
		return result, errors.New("user not found for API key")
	}

	// Check if user is suspended
	if user.Role == "suspended" {
		result.Error = "User account is suspended"
		return result, errors.New("user account is suspended")
	}

	// Check operation permissions if an operation is specified
	if operation != "" {
		hasPermission := false
		for _, perm := range keyRecord.Permissions {
			if perm == "*" || perm == operation {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			result.Error = "This API key does not have permission to perform this operation"
			return result, errors.New("insufficient permissions for operation: " + operation)
		}
	}

	// Update last used timestamp
	err = s.apiKeyRepo.UpdateLastUsed(keyRecord.ID, time.Now())
	if err != nil {
		log.Error().Err(err).Str("keyID", keyRecord.ID).Msg("Failed to update last used time for API key")
		// Continue despite update error
	}

	// Populate success result
	result.Valid = true
	result.UserID = keyRecord.UserID
	result.KeyID = keyRecord.ID
	result.Role = user.Role
	result.Permissions = keyRecord.Permissions

	return result, nil
}

// CanPerformOperation checks if a user can perform an operation (has sufficient balance or free operations)
func (s *APIKeyService) CanPerformOperation(userID string, operation string) (bool, float64, int, error) {
	// Get user with balance information
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return false, 0, 0, errors.New("user not found")
	}

	// Check if free operations need to be reset
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed

	if user.FreeOperationsReset.Before(now) {
		// Calculate new reset date (first day of next month)
		nextResetDate := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())

		// Reset free operations counter
		freeOpsUsed = 0

		// Update user in database
		err = s.userRepo.UpdateFreeOperations(userID, 0, nextResetDate)
		if err != nil {
			log.Error().Err(err).Str("userID", userID).Msg("Failed to reset free operations counter")
			// Continue anyway, using zero as free operations used
		}
	}

	// Calculate remaining free operations
	freeOpsRemaining := FREE_OPERATIONS_MONTHLY - freeOpsUsed

	// Check if free operations are available
	if freeOpsRemaining > 0 {
		return true, user.Balance, freeOpsRemaining, nil
	}

	// Check if user has enough balance
	if user.Balance >= OPERATION_COST {
		return true, user.Balance, 0, nil
	}

	// User has neither free operations nor sufficient balance
	return false, user.Balance, 0, nil
}

// ProcessOperation processes an operation, debiting either free operations or balance
func (s *APIKeyService) ProcessOperation(userID string, operation string) error {
	// Get user with balance information
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	// Check if free operations should be reset
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed
	resetDate := user.FreeOperationsReset

	if resetDate.Before(now) {
		// Calculate new reset date (first day of next month)
		nextResetDate := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())

		// Reset free operations counter
		freeOpsUsed = 0
		resetDate = nextResetDate

		// Update user in database
		err = s.userRepo.UpdateFreeOperations(userID, 0, nextResetDate)
		if err != nil {
			log.Error().Err(err).Str("userID", userID).Msg("Failed to reset free operations counter")
			// Continue anyway, using zero as free operations used
		}
	}

	// Check if free operations are available
	if freeOpsUsed < FREE_OPERATIONS_MONTHLY {
		// Use a free operation
		err = s.userRepo.IncrementFreeOperations(userID)
		if err != nil {
			return errors.New("failed to increment free operations counter")
		}

		// Track the operation in usage stats
		err = s.usageRepo.TrackOperation(userID, operation, 1, now)
		if err != nil {
			log.Error().Err(err).Str("userID", userID).Str("operation", operation).Msg("Failed to track operation")
			// Continue despite tracking error
		}

		return nil
	}

	// No free operations left, check and use balance
	if user.Balance < OPERATION_COST {
		return errors.New("insufficient balance")
	}

	// Deduct from balance
	newBalance := user.Balance - OPERATION_COST

	err = s.userRepo.UpdateBalance(userID, newBalance)
	if err != nil {
		return errors.New("failed to update balance")
	}

	// Record transaction
	transactionDescription := "Operation: " + operation
	err = s.transactionRepo.Create(userID, -OPERATION_COST, newBalance, transactionDescription, "completed")
	if err != nil {
		log.Error().Err(err).Str("userID", userID).Msg("Failed to record transaction")
		// Continue despite transaction recording error
	}

	// Track the operation in usage stats
	err = s.usageRepo.TrackOperation(userID, operation, 1, now)
	if err != nil {
		log.Error().Err(err).Str("userID", userID).Str("operation", operation).Msg("Failed to track operation")
		// Continue despite tracking error
	}

	return nil
}

// GetOperationStats gets operation statistics for a user in the current month
func (s *APIKeyService) GetOperationStats(userID string) (map[string]int, error) {
	// Get start of current month
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// Get usage stats for current month
	stats, err := s.usageRepo.GetUserStats(userID, startOfMonth, now)
	if err != nil {
		return nil, errors.New("failed to get usage stats")
	}

	return stats, nil
}

// GetBillingInfo gets billing information for a user and operation
func (s *APIKeyService) GetBillingInfo(userID string, operation string) (map[string]interface{}, error) {
	// Get user with billing information
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if free operations should be reset
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed
	resetDate := user.FreeOperationsReset

	if resetDate.Before(now) {
		// Use reset values for display purposes
		freeOpsUsed = 0
		resetDate = time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
	}

	// Calculate free operations remaining
	freeOpsRemaining := FREE_OPERATIONS_MONTHLY - freeOpsUsed
	if freeOpsRemaining < 0 {
		freeOpsRemaining = 0
	}

	// Get operation count in current month
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	stats, err := s.usageRepo.GetUserStats(userID, startOfMonth, now)
	if err != nil {
		// Continue despite stats error, just set count to 0
		stats = make(map[string]int)
	}

	// Get monthly total and operation count
	monthlyTotal := 0
	operationCount := 0

	for op, count := range stats {
		monthlyTotal += count
		if op == operation {
			operationCount = count
		}
	}

	// Build billing info
	billingInfo := map[string]interface{}{
		"balance":                 user.Balance,
		"freeOperationsUsed":      freeOpsUsed,
		"freeOperationsRemaining": freeOpsRemaining,
		"nextResetDate":           resetDate.Format(time.RFC3339),
		"monthlyOperations":       monthlyTotal,
		"operationCount":          operationCount,
		"operationCost":           OPERATION_COST,
	}

	return billingInfo, nil
}

// GetAPIKeysForUser gets all API keys for a user
func (s *APIKeyService) GetAPIKeysForUser(userID string) ([]map[string]interface{}, error) {
	// Get all API keys for user
	keys, err := s.apiKeyRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("failed to fetch API keys")
	}

	// Format results
	result := make([]map[string]interface{}, len(keys))

	for i, key := range keys {
		// Mask API key for security
		maskedKey := key.Key
		if len(maskedKey) > 12 {
			maskedKey = maskedKey[:8] + "..." + maskedKey[len(maskedKey)-4:]
		}

		result[i] = map[string]interface{}{
			"id":          key.ID,
			"name":        key.Name,
			"key":         maskedKey,
			"permissions": key.Permissions,
			"lastUsed":    key.LastUsed,
			"expiresAt":   key.ExpiresAt,
			"createdAt":   key.CreatedAt,
		}
	}

	return result, nil
}

// CreateAPIKey creates a new API key for a user
func (s *APIKeyService) CreateAPIKey(userID string, name string, permissions []string) (map[string]interface{}, error) {
	// Validate name
	if name == "" {
		name = "API Key" // Default name
	}

	// Validate permissions
	validatedPermissions := []string{}

	// If permissions are provided, validate each one
	if len(permissions) > 0 {
		// Filter to only include valid operations
		for _, perm := range permissions {
			if perm == "*" {
				validatedPermissions = []string{"*"} // Wildcard permission
				break
			}

			// Check if permission is valid
			valid := false
			for _, validOp := range API_OPERATIONS {
				if perm == validOp {
					valid = true
					break
				}
			}

			if valid {
				validatedPermissions = append(validatedPermissions, perm)
			}
		}
	} else {
		// Default to all permissions with wildcard
		validatedPermissions = []string{"*"}
	}

	// Get user to check limits
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Get existing keys count
	existingKeys, err := s.apiKeyRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("failed to fetch existing API keys")
	}

	// Determine key limits based on user type
	// A user is considered paid if they have a positive balance
	isPaid := user.Balance > 0

	keyLimit := 1 // Default for free users
	if isPaid {
		keyLimit = 10 // Higher limit for paid users
	}

	if len(existingKeys) >= keyLimit {
		return nil, errors.New("API key limit reached")
	}

	// Generate a new API key
	newKey, err := s.apiKeyRepo.Create(userID, name, validatedPermissions)
	if err != nil {
		return nil, errors.New("failed to create API key")
	}

	// Return the created key
	result := map[string]interface{}{
		"id":          newKey.ID,
		"name":        newKey.Name,
		"key":         newKey.Key,
		"permissions": newKey.Permissions,
		"lastUsed":    newKey.LastUsed,
		"expiresAt":   newKey.ExpiresAt,
		"createdAt":   newKey.CreatedAt,
	}

	return result, nil
}

// DeleteAPIKey deletes an API key
func (s *APIKeyService) DeleteAPIKey(userID string, keyID string) error {
	// Check if key exists and belongs to user
	key, err := s.apiKeyRepo.FindByID(keyID)
	if err != nil {
		return errors.New("API key not found")
	}

	if key.UserID != userID {
		return errors.New("unauthorized: API key does not belong to user")
	}

	// Delete the key
	err = s.apiKeyRepo.Delete(keyID)
	if err != nil {
		return errors.New("failed to delete API key")
	}

	return nil
}
