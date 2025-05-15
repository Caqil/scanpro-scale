// internal/api/middleware/auth.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/services/auth"
	"megapdf-api/internal/utils/response"
)

// AuthMiddleware handles authentication from either JWT token or API key
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for web UI marker
		if isWebUIRequest(c) {
			// For web UI requests, check for JWT token
			if handleJWTAuth(c) {
				return // Successfully authenticated with JWT
			}
		}

		// For API requests or fallback, check for API key
		if handleAPIKeyAuth(c) {
			return // Successfully authenticated with API key
		}

		// Not authenticated
		response.Error(c, http.StatusUnauthorized, "Authentication required")
		c.Abort()
	}
}

// isWebUIRequest checks if the request is from the web UI
func isWebUIRequest(c *gin.Context) bool {
	// Check specific header set by web UI
	if c.GetHeader("X-Source") == "web-ui" {
		return true
	}

	// Check Accept header for HTML (browsers typically send this)
	accept := c.GetHeader("Accept")
	if strings.Contains(accept, "text/html") {
		return true
	}

	// Check referer header to see if it's from our own domain
	referer := c.GetHeader("Referer")
	if referer != "" && strings.Contains(referer, c.Request.Host) {
		return true
	}

	// Check user agent for browser patterns
	userAgent := c.GetHeader("User-Agent")
	browserPatterns := []string{"Mozilla/", "Chrome/", "Safari/", "Firefox/", "Edge/", "Opera/"}
	for _, pattern := range browserPatterns {
		if strings.Contains(userAgent, pattern) {
			return true
		}
	}

	return false
}

// handleJWTAuth validates JWT token and sets user info in context
func handleJWTAuth(c *gin.Context) bool {
	// Get JWT token from Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return false
	}

	// Check if Authentication header has Bearer prefix
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return false
	}

	// Extract token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == "" {
		return false
	}

	// Validate JWT token
	jwtService := auth.NewJWTService()
	claims, err := jwtService.ValidateToken(tokenString)
	if err != nil {
		log.Debug().Err(err).Msg("JWT validation failed")
		return false
	}

	// Set user info in context
	c.Set("userId", claims.UserID)
	c.Set("userRole", claims.Role)
	c.Set("authType", "jwt")
	c.Next()
	return true
}

// handleAPIKeyAuth validates API key and sets user info in context
func handleAPIKeyAuth(c *gin.Context) bool {
	// Get API key from header or query parameter
	apiKey := c.GetHeader("x-api-key")
	if apiKey == "" {
		apiKey = c.Query("api_key")
	}

	if apiKey == "" {
		return false
	}

	// Get operation type from route or header
	operation := getOperationFromRoute(c)
	if operationHeader := c.GetHeader("x-operation-type"); operationHeader != "" {
		operation = operationHeader
	}

	// Validate API key
	apiKeyService := auth.NewAPIKeyService()
	validation, err := apiKeyService.ValidateKey(apiKey, operation)
	if err != nil {
		log.Debug().Err(err).Str("apiKey", apiKey).Msg("API key validation failed")
		return false
	}

	if !validation.Valid {
		return false
	}

	// Set user info in context
	c.Set("userId", validation.UserID)
	c.Set("userRole", validation.Role)
	c.Set("apiKeyId", validation.KeyID)
	c.Set("apiPermissions", validation.Permissions)
	c.Set("authType", "apiKey")
	c.Next()
	return true
}

// getOperationFromRoute extracts operation type from route path
func getOperationFromRoute(c *gin.Context) string {
	path := c.Request.URL.Path
	pathParts := strings.Split(path, "/")

	if len(pathParts) >= 3 && pathParts[1] == "api" {
		switch pathParts[2] {
		case "pdf":
			if len(pathParts) >= 4 {
				return pathParts[3] // e.g., "convert", "compress", etc.
			}
		case "ocr":
			return "ocr"
		}
	}

	return "general"
}