// internal/handlers/admin/users.go
package admin

import (
	"net/http"
	"strconv"
	"time"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/models"
	"megapdf-api/internal/repositories"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UsersHandler handles admin user operations
type UsersHandler struct {
	userRepo        repositories.UserRepository
	usageStatsRepo  repositories.UsageStatsRepository
	transactionRepo repositories.TransactionRepository
}

// NewUsersHandler creates a new users handler
func NewUsersHandler(userRepo repositories.UserRepository, usageStatsRepo repositories.UsageStatsRepository, transactionRepo repositories.TransactionRepository) *UsersHandler {
	return &UsersHandler{
		userRepo:        userRepo,
		usageStatsRepo:  usageStatsRepo,
		transactionRepo: transactionRepo,
	}
}

// Register registers the routes for this handler
func (h *UsersHandler) Register(router *gin.RouterGroup) {
	userGroup := router.Group("/users")
	userGroup.GET("", h.GetUsers)
	userGroup.PATCH("/:userId", h.UpdateUser)
	userGroup.DELETE("/:userId", h.DeleteUser)
}

// GetUsers returns a list of users with pagination
func (h *UsersHandler) GetUsers(c *gin.Context) {
	// Parse query parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "25")
	search := c.DefaultQuery("search", "")
	tier := c.DefaultQuery("tier", "")
	status := c.DefaultQuery("status", "")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	// Get users with pagination
	users, total, err := h.userRepo.GetPaginated(page, limit, search, tier, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch users",
		})
		return
	}

	// Get additional data for each user
	now := time.Now()
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	userDetails := make([]gin.H, len(users))

	for i, user := range users {
		// Get API keys for this user
		apiKeys, _ := h.userRepo.GetAPIKeys(user.ID)

		// Get usage statistics
		totalUsage, _ := h.usageStatsRepo.SumUserTotal(user.ID)
		monthlyUsage, _ := h.usageStatsRepo.SumUserPeriod(user.ID, firstDayOfMonth, now)
		lastMonthStart := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, time.UTC)
		lastMonthEnd := firstDayOfMonth.Add(-time.Second)
		lastMonthUsage, _ := h.usageStatsRepo.SumUserPeriod(user.ID, lastMonthStart, lastMonthEnd)

		// Determine if user has made payments
		hasPaid, _ := h.transactionRepo.HasUserMadePayments(user.ID)
		accountTier := "free"
		if hasPaid {
			accountTier = "paid"
		}

		// Calculate free operations remaining
		freeOpsRemaining := 500 // FREE_OPERATIONS_MONTHLY
		if user.FreeOperationsUsed > 0 {
			freeOpsRemaining = maxInt(0, freeOpsRemaining-user.FreeOperationsUsed)
		}

		// Get last active time
		lastActive := user.UpdatedAt
		for _, key := range apiKeys {
			if key.LastUsed != nil && key.LastUsed.After(lastActive) {
				lastActive = *key.LastUsed
			}
		}

		userDetails[i] = gin.H{
			"id":                     user.ID,
			"name":                   user.Name,
			"email":                  user.Email,
			"role":                   user.Role,
			"createdAt":              user.CreatedAt,
			"lastActive":             lastActive,
			"balance":                user.Balance,
			"freeOperationsUsed":     user.FreeOperationsUsed,
			"freeOperationsRemaining": freeOpsRemaining,
			"subscription": gin.H{
				"tier":   accountTier,
				"status": "active", // Always active in pay-as-you-go
			},
			"apiKeys": apiKeys,
			"usage": gin.H{
				"total":      totalUsage,
				"thisMonth":  monthlyUsage,
				"lastMonth":  lastMonthUsage,
			},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users":      userDetails,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": (total + limit - 1) / limit,
	})
}

// UpdateUser updates a user's details
func (h *UsersHandler) UpdateUser(c *gin.Context) {
	userId := c.Param("userId")
	
	// Parse request body
	var request struct {
		Name               *string  `json:"name"`
		Email              *string  `json:"email"`
		Role               *string  `json:"role"`
		Balance            *float64 `json:"balance"`
		FreeOperationsUsed *int     `json:"freeOperationsUsed"`
		Suspended          *bool    `json:"suspended"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Get current user data
	user, err := h.userRepo.GetByID(userId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Prepare updates
	updates := map[string]interface{}{}
	
	if request.Name != nil {
		updates["name"] = *request.Name
	}
	
	if request.Email != nil {
		updates["email"] = *request.Email
	}
	
	if request.Role != nil {
		updates["role"] = *request.Role
	}
	
	if request.FreeOperationsUsed != nil {
		updates["free_operations_used"] = *request.FreeOperationsUsed
	}
	
	if request.Suspended != nil {
		if *request.Suspended {
			updates["role"] = "suspended"
		} else if user.Role == "suspended" {
			updates["role"] = "user"
		}
	}

	// Track if balance was changed
	var oldBalance float64
	var newBalance float64
	
	if request.Balance != nil {
		oldBalance = user.Balance
		newBalance = *request.Balance
		updates["balance"] = newBalance
	}

	// Update user
	if len(updates) > 0 {
		if err := h.userRepo.Update(userId, updates); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update user",
			})
			return
		}
	}

	// Create transaction record for balance adjustment if needed
	if request.Balance != nil && newBalance != oldBalance {
		amount := newBalance - oldBalance
		description := "Admin balance adjustment (added funds)"
		if amount < 0 {
			description = "Admin balance adjustment (removed funds)"
		}

		transaction := models.Transaction{
			ID:           uuid.New().String(),
			UserID:       userId,
			Amount:       amount,
			BalanceAfter: newBalance,
			Description:  description,
			Status:       "completed",
			CreatedAt:    time.Now(),
		}

		if err := h.transactionRepo.Create(&transaction); err != nil {
			// Log but continue (non-critical)
			fmt.Println("Failed to create balance adjustment transaction:", err)
		}
	}

	// Get updated user with all relations
	updatedUser, err := h.userRepo.GetFullDetails(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch updated user details",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    updatedUser,
	})
}

// DeleteUser deletes a user
func (h *UsersHandler) DeleteUser(c *gin.Context) {
	userId := c.Param("userId")

	if err := h.userRepo.Delete(userId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

// Helper function
func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}