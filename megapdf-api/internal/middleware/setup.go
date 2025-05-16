package middleware

import (
	"megapdf-api/internal/config"
	"megapdf-api/internal/services/auth"
	"megapdf-api/internal/services/billing"

	"github.com/gin-gonic/gin"
)

// SetupMiddleware sets up all middleware for the application
func SetupMiddleware(
	router *gin.Engine,
	config *config.Config,
	authService *auth.Service,
	billingService *billing.Service,
) {
	// Apply global middleware in the correct order

	// Recovery must be first to handle panics
	router.Use(Recovery())

	// Logger for request tracking
	router.Use(Logger())

	// CORS for cross-origin requests
	router.Use(CORS(config))

	// Rate limiting
	router.Use(RateLimit(config))

	// Authentication middleware (JWT and API key)
	// These don't abort if no auth credentials are provided,
	// they just set user context if auth is present
	authMW := combineMiddleware(
		Auth(authService),
		APIKey(authService),
	)

	// Make the middleware available on the router
	router.Use(authMW)

	// Error handler should be last to catch errors from other middleware
	router.Use(ErrorHandler())
}

// GetAuthMiddleware returns the authentication middleware
func GetAuthMiddleware(authService *auth.Service) gin.HandlerFunc {
	return combineMiddleware(
		Auth(authService),
		APIKey(authService),
	)
}

// GetRequireAuthMiddleware returns middleware that requires authentication
func GetRequireAuthMiddleware() gin.HandlerFunc {
	return RequireAuth()
}

// GetAdminMiddleware returns middleware that requires admin role
func GetAdminMiddleware() gin.HandlerFunc {
	return Admin()
}

// GetOperationEligibilityMiddleware returns middleware that checks operation eligibility
func GetOperationEligibilityMiddleware(billingService *billing.Service) gin.HandlerFunc {
	return CheckOperationEligibility(billingService)
}

// GetOperationTrackingMiddleware returns middleware that tracks operations
func GetOperationTrackingMiddleware(billingService *billing.Service) gin.HandlerFunc {
	return TrackOperation(billingService)
}

// combineMiddleware combines multiple middleware functions into one
func combineMiddleware(middlewares ...gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, middleware := range middlewares {
			middleware(c)
			// If the request was aborted, stop processing middleware
			if c.IsAborted() {
				return
			}
		}
	}
}
