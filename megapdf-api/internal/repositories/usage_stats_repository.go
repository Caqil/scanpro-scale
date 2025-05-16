// internal/repositories/usage_stats_repository.go
package repositories

import (
	"context"
	"errors"
	"time"

	"megapdf-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UsageStatsRepository handles database operations for usage statistics
type UsageStatsRepository struct {
	db *gorm.DB
}

// NewUsageStatsRepository creates a new usage stats repository
func NewUsageStatsRepository(db *gorm.DB) *UsageStatsRepository {
	return &UsageStatsRepository{
		db: db,
	}
}

// GetByID gets a usage stat by ID
func (r *UsageStatsRepository) GetByID(ctx context.Context, id string) (*models.UsageStat, error) {
	var usageStat models.UsageStat
	result := r.db.First(&usageStat, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("usage stat not found")
		}
		return nil, result.Error
	}
	return &usageStat, nil
}

// Create creates a new usage stat
func (r *UsageStatsRepository) Create(ctx context.Context, usageStat *models.UsageStat) error {
	if usageStat.ID == "" {
		usageStat.ID = uuid.New().String()
	}
	if usageStat.CreatedAt.IsZero() {
		usageStat.CreatedAt = time.Now()
	}
	if usageStat.UpdatedAt.IsZero() {
		usageStat.UpdatedAt = time.Now()
	}
	return r.db.Create(usageStat).Error
}

// Update updates a usage stat
func (r *UsageStatsRepository) Update(ctx context.Context, usageStat *models.UsageStat) error {
	usageStat.UpdatedAt = time.Now()
	return r.db.Save(usageStat).Error
}

// GetByUserIDAndOperation gets a usage stat by user ID and operation for a specific date
func (r *UsageStatsRepository) GetByUserIDAndOperation(ctx context.Context, userID, operation string, date time.Time) (*models.UsageStat, error) {
	startDate := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 0, 1)

	var usageStat models.UsageStat
	result := r.db.Where("user_id = ? AND operation = ? AND date >= ? AND date < ?",
		userID, operation, startDate, endDate).First(&usageStat)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // Not found is not an error in this case, return nil
		}
		return nil, result.Error
	}
	return &usageStat, nil
}

// IncrementCount increments the count for a usage stat
func (r *UsageStatsRepository) IncrementCount(ctx context.Context, id string, increment int) error {
	return r.db.Model(&models.UsageStat{}).
		Where("id = ?", id).
		Update("count", gorm.Expr("count + ?", increment)).
		Update("updated_at", time.Now()).
		Error
}

// UpsertUsageStat creates or updates a usage stat
func (r *UsageStatsRepository) UpsertUsageStat(ctx context.Context, userID, operation string, date time.Time, increment int) error {
	// Normalize date to start of day
	date = time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	// Check if a record already exists
	stat, err := r.GetByUserIDAndOperation(ctx, userID, operation, date)
	if err != nil {
		return err
	}

	if stat != nil {
		// Update existing record
		return r.IncrementCount(ctx, stat.ID, increment)
	}

	// Create new record
	newStat := &models.UsageStat{
		ID:        uuid.New().String(),
		UserID:    userID,
		Operation: operation,
		Count:     increment,
		Date:      date,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return r.Create(ctx, newStat)
}

// GetUserMonthlyStats gets usage stats for a user for the current month
func (r *UsageStatsRepository) GetUserMonthlyStats(ctx context.Context, userID string) ([]models.UsageStat, error) {
	// Get first day of current month
	now := time.Now()
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)

	var stats []models.UsageStat
	result := r.db.Where("user_id = ? AND date >= ?", userID, firstDayOfMonth).Find(&stats)
	if result.Error != nil {
		return nil, result.Error
	}
	return stats, nil
}

// GetUserTotalCount gets the total count of operations for a user in a date range
func (r *UsageStatsRepository) GetUserTotalCount(ctx context.Context, userID string, startDate, endDate time.Time) (int, error) {
	var total int64
	result := r.db.Model(&models.UsageStat{}).
		Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate, endDate).
		Select("COALESCE(SUM(count), 0) as total").
		Pluck("total", &total)

	if result.Error != nil {
		return 0, result.Error
	}
	return int(total), nil
}

// GetUserOperationCounts gets the count of operations by type for a user in a date range
func (r *UsageStatsRepository) GetUserOperationCounts(ctx context.Context, userID string, startDate, endDate time.Time) (map[string]int, error) {
	type Result struct {
		Operation string
		Count     int64
	}

	var results []Result
	err := r.db.Model(&models.UsageStat{}).
		Select("operation, SUM(count) as count").
		Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate, endDate).
		Group("operation").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Convert results to map
	counts := make(map[string]int)
	for _, result := range results {
		counts[result.Operation] = int(result.Count)
	}

	return counts, nil
}

// GetTotalOperationCounts gets the total count of operations by type for all users in a date range
func (r *UsageStatsRepository) GetTotalOperationCounts(ctx context.Context, startDate, endDate time.Time) (map[string]int, error) {
	type Result struct {
		Operation string
		Count     int64
	}

	var results []Result
	err := r.db.Model(&models.UsageStat{}).
		Select("operation, SUM(count) as count").
		Where("date >= ? AND date <= ?", startDate, endDate).
		Group("operation").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Convert results to map
	counts := make(map[string]int)
	for _, result := range results {
		counts[result.Operation] = int(result.Count)
	}

	return counts, nil
}

// GetDailyStats gets daily operation counts for a date range
func (r *UsageStatsRepository) GetDailyStats(ctx context.Context, startDate, endDate time.Time) ([]struct {
	Date  time.Time
	Count int
}, error) {
	type Result struct {
		Date  time.Time
		Count int64
	}

	var results []Result
	err := r.db.Model(&models.UsageStat{}).
		Select("date, SUM(count) as count").
		Where("date >= ? AND date <= ?", startDate, endDate).
		Group("date").
		Order("date").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Convert results
	stats := make([]struct {
		Date  time.Time
		Count int
	}, len(results))

	for i, result := range results {
		stats[i].Date = result.Date
		stats[i].Count = int(result.Count)
	}

	return stats, nil
}

// GetTopUsers gets the top users by operation count in a date range
func (r *UsageStatsRepository) GetTopUsers(ctx context.Context, startDate, endDate time.Time, limit int) ([]struct {
	UserID string
	Count  int
}, error) {
	type Result struct {
		UserID string
		Count  int64
	}

	var results []Result
	err := r.db.Model(&models.UsageStat{}).
		Select("user_id, SUM(count) as count").
		Where("date >= ? AND date <= ?", startDate, endDate).
		Group("user_id").
		Order("count DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Convert results
	users := make([]struct {
		UserID string
		Count  int
	}, len(results))

	for i, result := range results {
		users[i].UserID = result.UserID
		users[i].Count = int(result.Count)
	}

	return users, nil
}