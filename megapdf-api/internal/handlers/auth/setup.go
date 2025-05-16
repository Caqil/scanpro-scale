// internal/handlers/auth/setup.go
package auth

import (
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// RegisterAuthHandlers registers all auth handlers
func RegisterAuthHandlers(router *gin.Engine, authService *auth.Service) {
	// Create auth router group
	authGroup := router.Group("/api/auth")

	// Initialize handlers
	loginHandler := NewLoginHandler(authService)
	registerHandler := NewRegisterHandler(authService)
	resetPasswordHandler := NewResetPasswordHandler(authService)
	verifyHandler := NewVerifyHandler(authService)

	// Register routes
	loginHandler.Register(authGroup)
	registerHandler.Register(authGroup)
	resetPasswordHandler.Register(authGroup)
	verifyHandler.Register(authGroup)
}
