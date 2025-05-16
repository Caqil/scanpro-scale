// internal/handlers/keys/create.go
package keys

import (
	"net/http"

	"megapdf-api/internal/middleware"
	"megapdf-api/internal/models"
	"megapdf-api/internal/services/auth"

	"github.com/gin-gonic/gin"
)

// CreateHandler handles creation of API keys
type CreateHandler struct {
	authService *auth.Service
}

// NewCreateHandler creates a new create handler
func NewCreateHandler(authService *auth.Service) *CreateHandler {
	return &CreateHandler{
		authService: authService,
	}
}

// Register registers the routes for this handler
func (h *CreateHandler) Register(router *gin.RouterGroup) {
	// Protected route - requires authentication
	router.Use(middleware.Auth())
	router.POST("", h.CreateKey)
}

// CreateKey creates a new API key for the authenticated user
func (h *CreateHandler) CreateKey(c *gin.Context) {
	// Get user ID from context (set by Auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"success": false,
		})
		return
	}

	// Parse request body
	var request struct {
		Name        string   `json:"name" binding:"required"`
		Permissions []string `json:"permissions"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"success": false,
		})
		return
	}

	// Check if name is provided
	if request.Name == "" {
		request.Name = "API Key" // Default name
	}

	// Validate permissions
	availableOperations := []string{
		"convert", "compress", "merge", "split", "watermark", 
		"protect", "unlock", "rotate", "remove", "sign", 
		"ocr", "repair", "*",
	}

	validPermissions := []string{}
	
	// Check and validate each permission
	if len(request.Permissions) > 0 {
		// Check if wildcard is included
		for _, perm := range request.Permissions {
			if perm == "*" {
				validPermissions = []string{"*"}
				break
			}
		}
		
		// If not using wildcard, validate individual permissions
		if len(validPermissions) == 0 {
			for _, perm := range request.Permissions {
				for _, validPerm := range availableOperations {
					if perm == validPerm {
						validPermissions = append(validPermissions, perm)
						break
					}
				}
			}
		}
	}
	
	// If no valid permissions provided, use defaults
	if len(validPermissions) == 0 {
		validPermissions = []string{"convert", "compress", "merge", "split"}
	}

	// Create API key
	apiKey, err := h.authService.CreateAPIKey(c, userID.(string), request.Name, validPermissions)
	if err != nil {
		statusCode := http.StatusInternalServerError
		
		// Check for specific errors
		if err.Error() == "API key limit reached" {
			statusCode = http.StatusForbidden
		}
		
		c.JSON(statusCode, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// Return the full key (only shown once)
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"key": gin.H{
			"id":          apiKey.ID,
			"name":        apiKey.Name,
			"key":         apiKey.Key, // Return the full key
			"permissions": apiKey.Permissions,
			"createdAt":   apiKey.CreatedAt,
		},
	})
}