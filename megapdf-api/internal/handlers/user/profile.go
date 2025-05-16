// internal/handlers/user/profile.go
package user

import (
	"net/http"

	"megapdf-api/internal/models"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// ProfileHandler manages user profile operations
type ProfileHandler struct {
	authService *auth.Service
}

// NewProfileHandler creates a new profile handler
func NewProfileHandler(authService *auth.Service) *ProfileHandler {
	return &ProfileHandler{
		authService: authService,
	}
}

// GetProfile gets the user's profile
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get user profile
	user, err := h.authService.GetUserProfile(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user profile",
			"success": false,
		})
		return
	}

	// Format response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"createdAt":  user.CreatedAt,
			"isVerified": user.IsEmailVerified,
		},
	})
}

// UpdateProfile updates the user's profile
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Parse request body
	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"success": false,
		})
		return
	}

	// Update profile
	user, err := h.authService.UpdateUserProfile(c, userID.(string), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update profile",
			"success": false,
		})
		return
	}

	// Format response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user": gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"createdAt":  user.CreatedAt,
			"isVerified": user.IsEmailVerified,
		},
	})
}

// GetSubscription gets the user's subscription status
func (h *ProfileHandler) GetSubscription(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Authentication required",
			"success": false,
		})
		return
	}

	// Get user profile and billing info
	user, err := h.authService.GetUserProfile(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user profile",
			"success": false,
		})
		return
	}

	// Get operations stats
	stats, err := h.authService.GetUserOperationStats(c, userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get operation statistics",
			"success": false,
		})
		return
	}

	// Calculate tier based on whether user has made deposits
	tier := "free"
	if user.HasPaidDeposits {
		tier = "paid"
	}

	// Format response
	response := models.UserProfile{
		ID:                      user.ID,
		Name:                    user.Name,
		Email:                   user.Email,
		Tier:                    tier,
		Status:                  "active", // We don't have inactive status in this model
		Balance:                 user.Balance,
		Operations:              stats.MonthlyOperations,
		Limit:                   stats.MonthlyLimit,
		CurrentPeriodStart:      stats.CurrentPeriodStart,
		CurrentPeriodEnd:        stats.CurrentPeriodEnd,
		FreeOperationsUsed:      user.FreeOperationsUsed,
		FreeOperationsRemaining: user.FreeOperationsRemaining,
		FreeOperationsReset:     user.FreeOperationsReset,
	}

	c.JSON(http.StatusOK, response)
}