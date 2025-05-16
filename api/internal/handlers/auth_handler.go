// internal/handlers/auth_handler.go
package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *services.AuthService
}

func NewAuthHandler(service *services.AuthService, jwtSecret string) *AuthHandler {
	return &AuthHandler{service: service}
}

// Register godoc
// @Summary Register a new user
// @Description Creates a new user account with email verification
// @Tags auth
// @Accept json
// @Produce json
// @Param body body object{name=string,email=string,password=string} true "User registration information"
// @Success 200 {object} object{success=boolean,token=string,user=object{id=string,name=string,email=string,isEmailVerified=boolean,balance=number,freeOperationsUsed=integer},emailSent=boolean}
// @Failure 400 {object} object{error=string}
// @Failure 409 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	// Parse request body
	var requestBody struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Register user
	result, err := h.service.Register(requestBody.Name, requestBody.Email, requestBody.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to register user: " + err.Error(),
		})
		return
	}

	if !result.Success {
		status := http.StatusBadRequest
		if result.Error == "User with this email already exists" {
			status = http.StatusConflict
		}
		c.JSON(status, gin.H{
			"error": result.Error,
		})
		return
	}

	// Return user information
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token,
		"user": map[string]interface{}{
			"id":                result.User.ID,
			"name":              result.User.Name,
			"email":             result.User.Email,
			"isEmailVerified":   result.User.IsEmailVerified,
			"balance":           result.User.Balance,
			"freeOperationsUsed": result.User.FreeOperationsUsed,
		},
		"emailSent": true, // In a real implementation, this would depend on email sending result
	})
}

// Login godoc
// @Summary Login a user
// @Description Authenticates a user and returns a JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param body body object{email=string,password=string} true "User login credentials"
// @Success 200 {object} object{success=boolean,token=string,user=object{id=string,name=string,email=string,isEmailVerified=boolean,role=string}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	// Parse request body
	var requestBody struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Login user
	result, err := h.service.Login(requestBody.Email, requestBody.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to login: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": result.Error,
		})
		return
	}

	// Return user information
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token,
		"user": map[string]interface{}{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
			"role":            result.User.Role,
		},
	})
}