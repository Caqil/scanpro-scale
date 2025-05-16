// internal/handlers/user/setup.go
package user

import (
	"megapdf-api/internal/services/auth"
	"megapdf-api/internal/services/billing"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all user-related routes
func RegisterRoutes(
	router *gin.Engine,
	authService *auth.Service,
	billingService *billing.Service,
	paypalService *payment.PayPalService,
	authMW gin.HandlerFunc,
	requireAuth gin.HandlerFunc,
) {
	// Create handlers
	profileHandler := NewProfileHandler(authService)
	passwordHandler := NewPasswordHandler(authService)
	balanceHandler := NewBalanceHandler(billingService)
	depositHandler := NewDepositHandler(billingService, paypalService)
	apiKeyHandler := NewAPIKeyHandler(authService)
	verificationHandler := NewVerificationHandler(authService)

	// Create user group
	userGroup := router.Group("/api/user")
	userGroup.Use(authMW) // Apply authentication middleware

	// Profile routes
	userGroup.GET("/profile", requireAuth, profileHandler.GetProfile)
	userGroup.PUT("/profile", requireAuth, profileHandler.UpdateProfile)
	userGroup.GET("/subscription", requireAuth, profileHandler.GetSubscription)

	// Password routes
	userGroup.PUT("/password", requireAuth, passwordHandler.ChangePassword)

	// Balance routes
	userGroup.GET("/balance", requireAuth, balanceHandler.GetBalance)
	userGroup.GET("/transactions", requireAuth, balanceHandler.GetTransactions)

	// Deposit routes
	userGroup.POST("/deposit", requireAuth, depositHandler.CreateDeposit)
	userGroup.POST("/deposit/verify", requireAuth, depositHandler.VerifyDeposit)
	userGroup.POST("/deposit/capture", requireAuth, depositHandler.CaptureDeposit)

	// API key routes
	userGroup.GET("/keys", requireAuth, apiKeyHandler.ListAPIKeys)
	userGroup.POST("/keys", requireAuth, apiKeyHandler.CreateAPIKey)
	userGroup.DELETE("/keys/:id", requireAuth, apiKeyHandler.DeleteAPIKey)

	// Verification routes
	userGroup.POST("/verify-email", requireAuth, verificationHandler.ResendVerificationEmail)
	userGroup.GET("/verify-email", verificationHandler.VerifyEmail) // No auth required, uses token
}
