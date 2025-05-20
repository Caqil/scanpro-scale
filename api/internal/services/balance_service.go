// internal/services/balance_service.go
package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BalanceService struct {
	db *gorm.DB
}

type OperationResult struct {
	Success                 bool
	UsedFreeOperation       bool
	FreeOperationsRemaining int
	CurrentBalance          float64
	OperationCost           float64
	Error                   string
}

func NewBalanceService(db *gorm.DB) *BalanceService {
	return &BalanceService{db: db}
}

// ProcessOperation charges a user for an operation
func (s *BalanceService) ProcessOperation(userID string, operation string) (*OperationResult, error) {
	var result OperationResult

	// Get the operation cost BEFORE entering the transaction to prevent
	// query errors inside the transaction
	operationCost := s.getOperationCost(operation)

	// Debug log
	fmt.Printf("Processing operation %s for user %s with cost %.3f\n", operation, userID, operationCost)

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Get user data
		var user models.User
		if err := tx.First(&user, "id = ?", userID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				result = OperationResult{
					Success: false,
					Error:   "User not found",
				}
				return nil
			}
			return err
		}

		// Check if free operations should be reset
		now := time.Now()
		freeOpsUsed := user.FreeOperationsUsed

		if user.FreeOperationsReset.Before(now) {
			// Calculate new reset date (first day of next month)
			nextMonth := now.AddDate(0, 1, 0)
			resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)

			// Reset free operations counter
			freeOpsUsed = 0

			if err := tx.Model(&user).Updates(map[string]interface{}{
				"free_operations_used":  0,
				"free_operations_reset": resetDate,
			}).Error; err != nil {
				return err
			}
		}

		// Get free operations limit
		freeOperationsLimit := constants.FreeOperationsMonthly

		// Try to get from pricing settings
		pricingRepo := repository.NewPricingRepository()
		if pricing, err := pricingRepo.GetPricingSettings(); err == nil {
			freeOperationsLimit = pricing.FreeOperationsMonthly
		}

		// Debug logs
		fmt.Printf("Free operations: used=%d, limit=%d\n", freeOpsUsed, freeOperationsLimit)

		// Check if free operations are available
		if freeOpsUsed < freeOperationsLimit {
			// Use a free operation
			if err := tx.Model(&user).Update("free_operations_used", freeOpsUsed+1).Error; err != nil {
				return err
			}

			// Track the operation in usage stats
			if err := s.trackOperationUsage(tx, userID, operation); err != nil {
				return err
			}

			// Create transaction for the free operation with 0 cost
			freeTransaction := models.Transaction{
				ID:           uuid.New().String(),
				UserID:       userID,
				Amount:       0, // No cost for free operation
				BalanceAfter: user.Balance,
				Description:  fmt.Sprintf("Operation: %s (Free)", operation),
				Status:       "completed",
				CreatedAt:    time.Now(),
			}

			if err := tx.Create(&freeTransaction).Error; err != nil {
				return err
			}

			result = OperationResult{
				Success:                 true,
				UsedFreeOperation:       true,
				FreeOperationsRemaining: freeOperationsLimit - freeOpsUsed - 1,
				CurrentBalance:          user.Balance,
				OperationCost:           operationCost,
			}
			return nil
		}

		// No free operations left, use balance
		if user.Balance < operationCost {
			result = OperationResult{
				Success:                 false,
				UsedFreeOperation:       false,
				FreeOperationsRemaining: 0,
				CurrentBalance:          user.Balance,
				OperationCost:           operationCost,
				Error:                   "Insufficient balance",
			}
			return nil
		}

		// Deduct from balance
		newBalance := user.Balance - operationCost

		// Debug log
		fmt.Printf("Deducting %.3f from balance %.3f, new balance: %.3f\n", operationCost, user.Balance, newBalance)

		if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// Record transaction
		transaction := models.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       -operationCost, // Explicitly make it negative to indicate a deduction
			BalanceAfter: newBalance,
			Description:  "Operation: " + operation,
			Status:       "completed",
			CreatedAt:    time.Now(),
		}

		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// Track the operation in usage stats
		if err := s.trackOperationUsage(tx, userID, operation); err != nil {
			return err
		}

		result = OperationResult{
			Success:                 true,
			UsedFreeOperation:       false,
			FreeOperationsRemaining: 0,
			CurrentBalance:          newBalance,
			OperationCost:           operationCost,
		}
		return nil
	})

	return &result, err
}

// trackOperationUsage records the operation in the usage stats
func (s *BalanceService) trackOperationUsage(tx *gorm.DB, userID string, operation string) error {
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.Local)

	var usageStat models.UsageStats
	result := tx.Where("user_id = ? AND operation = ? AND date = ?", userID, operation, today).First(&usageStat)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new record
		usageStat = models.UsageStats{
			ID:        uuid.New().String(),
			UserID:    userID,
			Operation: operation,
			Count:     1,
			Date:      today,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		return tx.Create(&usageStat).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record
	return tx.Model(&usageStat).Updates(map[string]interface{}{
		"count":      usageStat.Count + 1,
		"updated_at": time.Now(),
	}).Error
}

// GetBalance returns a user's balance information
func (s *BalanceService) GetBalance(userID string) (map[string]interface{}, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Get recent transactions
	var transactions []models.Transaction
	if err := s.db.Where("user_id = ?", userID).Order("created_at desc").Limit(10).Find(&transactions).Error; err != nil {
		return nil, err
	}

	// Check if free operations reset date has passed
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed
	resetDate := user.FreeOperationsReset

	// Get free operations limit from pricing settings
	freeOperationsLimit := constants.FreeOperationsMonthly
	pricingRepo := repository.NewPricingRepository()
	if pricing, err := pricingRepo.GetPricingSettings(); err == nil {
		freeOperationsLimit = pricing.FreeOperationsMonthly
	}

	if resetDate.Before(now) {
		// Reset would happen on next operation, but for display we show as reset
		freeOpsUsed = 0
		nextMonth := now.AddDate(0, 1, 0)
		resetDate = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)
	}

	// Get usage statistics for current month
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	var usageStats []models.UsageStats
	if err := s.db.Where("user_id = ? AND date >= ?", userID, firstDayOfMonth).Find(&usageStats).Error; err != nil {
		return nil, err
	}

	// Calculate total operations and operation counts
	totalOperations := 0
	operationCounts := make(map[string]int)
	for _, stat := range usageStats {
		totalOperations += stat.Count
		operationCounts[stat.Operation] += stat.Count
	}

	// Format transactions for response
	formattedTransactions := make([]map[string]interface{}, len(transactions))
	for i, tx := range transactions {
		formattedTransactions[i] = map[string]interface{}{
			"id":           tx.ID,
			"amount":       tx.Amount,
			"balanceAfter": tx.BalanceAfter,
			"description":  tx.Description,
			"status":       tx.Status,
			"createdAt":    tx.CreatedAt,
		}
	}

	return map[string]interface{}{
		"success":                 true,
		"balance":                 user.Balance,
		"freeOperationsUsed":      freeOpsUsed,
		"freeOperationsRemaining": freeOperationsLimit - freeOpsUsed,
		"freeOperationsTotal":     freeOperationsLimit,
		"nextResetDate":           resetDate,
		"transactions":            formattedTransactions,
		"totalOperations":         totalOperations,
		"operationCounts":         operationCounts,
	}, nil
}

// CreateDeposit creates a pending deposit for a user
func (s *BalanceService) CreateDeposit(userID string, amount float64, paymentID string) (*models.Transaction, error) {
	// Get user's current balance
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Create transaction record
	transaction := models.Transaction{
		ID:           uuid.New().String(),
		UserID:       userID,
		Amount:       amount,
		BalanceAfter: user.Balance + amount, // This will be updated when completed
		Description:  "Deposit - pending",
		PaymentID:    paymentID,
		Status:       "pending",
		CreatedAt:    time.Now(),
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

// In the CompleteDeposit method of BalanceService
func (s *BalanceService) CompleteDeposit(paymentID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Find the pending transaction
		var transaction models.Transaction
		if err := tx.Where("payment_id = ? AND status = ?", paymentID, "pending").First(&transaction).Error; err != nil {
			return err
		}

		// Log for debugging
		fmt.Printf("Found pending transaction - ID: %s, Amount: %f\n", transaction.ID, transaction.Amount)

		// Get current user balance
		var user models.User
		if err := tx.First(&user, "id = ?", transaction.UserID).Error; err != nil {
			return err
		}

		// Log for debugging
		fmt.Printf("User current balance: %f\n", user.Balance)

		// Calculate new balance
		newBalance := user.Balance + transaction.Amount

		// Log for debugging
		fmt.Printf("New calculated balance: %f\n", newBalance)

		// Update user balance
		if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// Update transaction
		return tx.Model(&transaction).Updates(map[string]interface{}{
			"status":        "completed",
			"description":   "Deposit - completed",
			"balance_after": newBalance,
		}).Error
	})
}

func (s *BalanceService) getOperationCost(operation string) float64 {
	// Debug log
	fmt.Println("Getting operation cost for:", operation)

	// Get pricing info
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		// Log the error
		fmt.Printf("Error getting pricing settings: %v, using default\n", err)
		// Fallback to default if we can't get pricing info
		return constants.OperationCost
	}

	// Debug log
	fmt.Printf("Pricing settings: global=%.3f, custom=%v\n", pricing.OperationCost, pricing.CustomPrices)

	// Check for custom price
	if customPrice, ok := pricing.CustomPrices[operation]; ok {
		fmt.Printf("Using custom price for %s: %.3f\n", operation, customPrice)
		return customPrice
	}

	// Otherwise use global price
	fmt.Printf("Using global price for %s: %.3f\n", operation, pricing.OperationCost)
	return pricing.OperationCost
}
