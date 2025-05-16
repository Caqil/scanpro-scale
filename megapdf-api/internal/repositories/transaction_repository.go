// internal/repositories/transaction_repository.go
package repositories

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TransactionRepository handles database operations for transactions
type TransactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository creates a new transaction repository
func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{
		db: db,
	}
}

// GetByID gets a transaction by ID
func (r *TransactionRepository) GetByID(ctx context.Context, id string) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.First(&transaction, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, result.Error
	}
	return &transaction, nil
}

// Create creates a new transaction
func (r *TransactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	if transaction.ID == "" {
		transaction.ID = uuid.New().String()
	}
	if transaction.CreatedAt.IsZero() {
		transaction.CreatedAt = time.Now()
	}
	return r.db.Create(transaction).Error
}

// Update updates a transaction
func (r *TransactionRepository) Update(ctx context.Context, transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

// UpdateFields updates specific fields of a transaction
func (r *TransactionRepository) UpdateFields(ctx context.Context, id string, updates map[string]interface{}) error {
	return r.db.Model(&models.Transaction{}).Where("id = ?", id).Updates(updates).Error
}

// GetByUserID gets all transactions for a user with pagination
func (r *TransactionRepository) GetByUserID(ctx context.Context, userID string, offset, limit int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	// Get total count
	err := r.db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get transactions with pagination
	result := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&transactions)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return transactions, total, nil
}

// GetByPaymentID gets a transaction by payment ID
func (r *TransactionRepository) GetByPaymentID(ctx context.Context, paymentID string) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.Where("payment_id = ?", paymentID).First(&transaction)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, result.Error
	}
	return &transaction, nil
}

// GetPendingByPaymentID gets a pending transaction by payment ID
func (r *TransactionRepository) GetPendingByPaymentID(ctx context.Context, paymentID string) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.Where("payment_id = ? AND status = ?", paymentID, "pending").First(&transaction)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("pending transaction not found")
		}
		return nil, result.Error
	}
	return &transaction, nil
}

// GetWithUser gets a transaction with user details
func (r *TransactionRepository) GetWithUser(ctx context.Context, id string) (*models.Transaction, error) {
	var transaction models.Transaction
	result := r.db.Preload("User").First(&transaction, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("transaction not found")
		}
		return nil, result.Error
	}
	return &transaction, nil
}

// GetAllWithPagination gets all transactions with pagination and filtering
func (r *TransactionRepository) GetAllWithPagination(ctx context.Context, offset, limit int, search string, transactionType string, status string, dateRange time.Time) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.db.Model(&models.Transaction{})

	// Apply date range filter
	query = query.Where("created_at >= ?", dateRange)

	// Apply transaction type filter
	if transactionType != "" && transactionType != "all" {
		switch transactionType {
		case "deposit":
			query = query.Where("amount > 0").Where("description LIKE ?", "%Deposit%")
		case "operation":
			query = query.Where("amount < 0").Where("description LIKE ?", "%Operation%")
		case "adjustment":
			query = query.Where("description LIKE ?", "%adjustment%")
		}
	}

	// Apply status filter
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	// Apply search filter
	if search != "" {
		query = query.Where("description LIKE ?", "%"+search+"%").
			Or("payment_id LIKE ?", "%"+search+"%").
			Or("id LIKE ?", "%"+search+"%")
	}

	// Get total count
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get transactions with pagination
	err = query.Preload("User").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetOperationCounts gets the count of operations by type in a date range
func (r *TransactionRepository) GetOperationCounts(ctx context.Context, startDate, endDate time.Time) (map[string]int, error) {
	type Result struct {
		Operation string
		Count     int
	}

	var results []Result

	// This query extracts the operation type from the description and counts them
	query := `
		SELECT 
			SUBSTRING(description FROM 'Operation: (.*)') AS operation,
			COUNT(*) AS count
		FROM 
			transactions
		WHERE 
			amount < 0 
			AND created_at BETWEEN ? AND ? 
			AND description LIKE 'Operation: %'
		GROUP BY 
			operation
		ORDER BY 
			count DESC
	`

	err := r.db.Raw(query, startDate, endDate).Scan(&results).Error
	if err != nil {
		return nil, err
	}

	// Convert results to map
	counts := make(map[string]int)
	for _, result := range results {
		counts[result.Operation] = result.Count
	}

	return counts, nil
}