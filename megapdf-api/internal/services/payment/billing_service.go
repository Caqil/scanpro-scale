package billing

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/config"
	"megapdf-api/internal/database"
	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service provides billing functionality
type Service struct {
	db     *gorm.DB
	config *config.BillingConfig
}

// NewService creates a new billing service
func NewService(cfg *config.BillingConfig) *Service {
	return &Service{
		db:     database.GetDB(),
		config: cfg,
	}
}

// OperationEligibility contains information about whether a user can perform an operation
type OperationEligibility struct {
	CanPerform              bool
	HasFreeOperations       bool
	FreeOperationsRemaining int
	HasBalance              bool
	CurrentBalance          float64
	Error                   string
}

// OperationResult contains the result of an operation charge
type OperationResult struct {
	Success                 bool
	UsedFreeOperation       bool
	FreeOperationsRemaining int
	CurrentBalance          float64
	Error                   string
}

// CanPerformOperation checks if a user can perform a specific operation
func (s *Service) CanPerformOperation(ctx context.Context, userID, operation string) (*OperationEligibility, error) {
	// Get user with balance information
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &OperationEligibility{
				CanPerform: false,
				Error:      "User not found",
			}, nil
		}
		return nil, err
	}

	// Check if free operations should be reset
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed

	if user.FreeOperationsReset != nil && user.FreeOperationsReset.Before(now) {
		// Reset would happen on actual operation, but for checking,
		// we assume they have full free operations
		freeOpsUsed = 0
	}

	// Calculate remaining free operations
	freeOpsRemaining := FREE_OPERATIONS_MONTHLY - freeOpsUsed
	if freeOpsRemaining < 0 {
		freeOpsRemaining = 0
	}

	hasFreeOps := freeOpsRemaining > 0

	// Check if user has enough balance (if no free operations)
	hasEnoughBalance := user.Balance >= OPERATION_COST

	result := &OperationEligibility{
		CanPerform:              hasFreeOps || hasEnoughBalance,
		HasFreeOperations:       hasFreeOps,
		FreeOperationsRemaining: freeOpsRemaining,
		HasBalance:              hasEnoughBalance,
		CurrentBalance:          user.Balance,
	}

	if !result.CanPerform {
		result.Error = "Insufficient balance and no free operations remaining"
	}

	return result, nil
}

// ProcessOperation charges for an operation and updates the user's balance or free operations
func (s *Service) ProcessOperation(ctx context.Context, userID, operation string) (*OperationResult, error) {
	// Start a transaction to ensure atomicity
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Roll back the transaction if it's not committed
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get user with balance information
	var user models.User
	if err := tx.First(&user, "id = ?", userID).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &OperationResult{
				Success: false,
				Error:   "User not found",
			}, errors.New("user not found")
		}
		return nil, err
	}

	// Check if free operations should be reset
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed
	resetDate := user.FreeOperationsReset

	if user.FreeOperationsReset != nil && user.FreeOperationsReset.Before(now) {
		// Calculate new reset date (first day of next month)
		nextMonth := now.AddDate(0, 1, 0)
		firstDayNextMonth := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

		// Reset free operations counter
		freeOpsUsed = 0
		resetDate = &firstDayNextMonth

		// Update user with reset values
		if err := tx.Model(&user).Updates(map[string]interface{}{
			"free_operations_used":  0,
			"free_operations_reset": firstDayNextMonth,
		}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Check if free operations are available
	freeOpsRemaining := FREE_OPERATIONS_MONTHLY - freeOpsUsed

	if freeOpsRemaining > 0 {
		// Use a free operation
		if err := tx.Model(&user).Update("free_operations_used", freeOpsUsed+1).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// Track the operation in usage stats
		if err := s.trackOperationUsage(ctx, tx, userID, operation); err != nil {
			tx.Rollback()
			return nil, err
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			return nil, err
		}

		return &OperationResult{
			Success:                 true,
			UsedFreeOperation:       true,
			FreeOperationsRemaining: freeOpsRemaining - 1,
			CurrentBalance:          user.Balance,
		}, nil
	}

	// No free operations left, use balance
	if user.Balance < OPERATION_COST {
		tx.Rollback()
		return &OperationResult{
			Success: false,
			Error:   "Insufficient balance",
		}, errors.New("insufficient balance")
	}

	// Deduct from balance
	newBalance := user.Balance - OPERATION_COST

	if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Record transaction
	transaction := models.Transaction{
		ID:           uuid.New().String(),
		UserID:       userID,
		Amount:       -OPERATION_COST,
		BalanceAfter: newBalance,
		Description:  "Operation: " + operation,
		Status:       models.StatusCompleted,
		CreatedAt:    time.Now(),
	}

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Track the operation in usage stats
	if err := s.trackOperationUsage(ctx, tx, userID, operation); err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &OperationResult{
		Success:                 true,
		UsedFreeOperation:       false,
		FreeOperationsRemaining: 0,
		CurrentBalance:          newBalance,
	}, nil
}

// trackOperationUsage records an operation in the usage stats
func (s *Service) trackOperationUsage(ctx context.Context, tx *gorm.DB, userID, operation string) error {
	today := time.Now().Truncate(24 * time.Hour)

	// Check if a stat for today already exists
	var stat models.UsageStat
	err := tx.Where("user_id = ? AND operation = ? AND date = ?", userID, operation, today).First(&stat).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create a new stat
			stat = models.UsageStat{
				ID:        uuid.New().String(),
				UserID:    userID,
				Operation: operation,
				Count:     1,
				Date:      today,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			return tx.Create(&stat).Error
		}
		return err
	}

	// Update existing stat
	return tx.Model(&stat).Update("count", stat.Count+1).Update("updated_at", time.Now()).Error
}

// GetUserBalance gets the current balance and free operations for a user
func (s *Service) GetUserBalance(ctx context.Context, userID string) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// AddUserBalance adds funds to a user's balance
func (s *Service) AddUserBalance(ctx context.Context, userID string, amount float64, description, paymentID string) error {
	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Roll back the transaction if it's not committed
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get current balance
	var user models.User
	if err := tx.First(&user, "id = ?", userID).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update balance
	newBalance := user.Balance + amount
	if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Record transaction
	transaction := models.Transaction{
		ID:           uuid.New().String(),
		UserID:       userID,
		Amount:       amount,
		BalanceAfter: newBalance,
		Description:  description,
		PaymentID:    &paymentID,
		Status:       models.StatusCompleted,
		CreatedAt:    time.Now(),
	}

	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	return tx.Commit().Error
}

// CreatePendingDeposit creates a pending deposit transaction
func (s *Service) CreatePendingDeposit(ctx context.Context, userID string, amount float64, paymentID string) (*models.Transaction, error) {
	// Get current balance
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Create transaction
	transaction := models.Transaction{
		ID:           uuid.New().String(),
		UserID:       userID,
		Amount:       amount,
		BalanceAfter: user.Balance, // Will be updated when completed
		Description:  "Deposit - pending",
		PaymentID:    &paymentID,
		Status:       models.StatusPending,
		CreatedAt:    time.Now(),
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

// CompletePendingDeposit completes a pending deposit
func (s *Service) CompletePendingDeposit(ctx context.Context, paymentID string, amount float64) error {
	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Roll back the transaction if it's not committed
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find the pending transaction
	var transaction models.Transaction
	if err := tx.Where("payment_id = ? AND status = ?", paymentID, models.StatusPending).First(&transaction).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("transaction not found or not pending")
		}
		return err
	}

	// Get user
	var user models.User
	if err := tx.First(&user, "id = ?", transaction.UserID).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update balance
	newBalance := user.Balance + amount
	if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update transaction
	updates := map[string]interface{}{
		"amount":        amount,
		"balance_after": newBalance,
		"status":        models.StatusCompleted,
		"description":   "Deposit - completed",
	}

	if err := tx.Model(&transaction).Updates(updates).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit transaction
	return tx.Commit().Error
}

// FailPendingDeposit marks a pending deposit as failed
func (s *Service) FailPendingDeposit(ctx context.Context, paymentID string, reason string) error {
	return s.db.Model(&models.Transaction{}).
		Where("payment_id = ? AND status = ?", paymentID, models.StatusPending).
		Updates(map[string]interface{}{
			"status":      models.StatusFailed,
			"description": "Deposit - failed: " + reason,
		}).Error
}

// GetUserTransactions gets the transactions for a user
func (s *Service) GetUserTransactions(ctx context.Context, userID string, limit, offset int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var count int64

	// Get count
	if err := s.db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return nil, 0, err
	}

	// Get transactions
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error; err != nil {
		return nil, 0, err
	}

	return transactions, count, nil
}
