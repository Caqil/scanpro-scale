package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// PasswordResetHandler handles password reset token-related HTTP requests
type PasswordResetHandler struct {
	Service *services.PasswordResetService
}

func NewPasswordResetHandler(service *services.PasswordResetService) *PasswordResetHandler {
	return &PasswordResetHandler{Service: service}
}

// CreatePasswordResetToken creates a new password reset token
// @Summary Create a new password reset token
// @Description Creates a new password reset token with the provided details
// @Tags password-reset-tokens
// @Accept json
// @Produce json
// @Param token body models.PasswordResetToken true "PasswordResetToken data"
// @Success 201 {object} models.PasswordResetToken
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /password-reset-tokens [post]
func (h *PasswordResetHandler) CreatePasswordResetToken(c *gin.Context) {
	var token models.PasswordResetToken
	if err := c.ShouldBindJSON(&token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreatePasswordResetToken(&token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, token)
}

// GetPasswordResetToken retrieves a password reset token by ID
// @Summary Get a password reset token
// @Description Retrieves a password reset token by its ID
// @Tags password-reset-tokens
// @Accept json
// @Produce json
// @Param id path string true "PasswordResetToken ID"
// @Success 200 {object} models.PasswordResetToken
// @Failure 404 {object} map[string]string
// @Router /password-reset-tokens/{id} [get]
func (h *PasswordResetHandler) GetPasswordResetToken(c *gin.Context) {
	id := c.Param("id")
	token, err := h.Service.GetPasswordResetToken(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "PasswordResetToken not found"})
		return
	}
	c.JSON(http.StatusOK, token)
}

// DeletePasswordResetToken deletes a password reset token by ID
// @Summary Delete a password reset token
// @Description Deletes a password reset token by its ID
// @Tags password-reset-tokens
// @Accept json
// @Produce json
// @Param id path string true "PasswordResetToken ID"
// @Success 204
// @Failure 500 {object} map[string]string
// @Router /password-reset-tokens/{id} [delete]
func (h *PasswordResetHandler) DeletePasswordResetToken(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeletePasswordResetToken(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
