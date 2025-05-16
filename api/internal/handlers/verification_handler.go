package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// VerificationHandler handles verification token-related HTTP requests
type VerificationHandler struct {
	Service *services.VerificationService
}

func NewVerificationHandler(service *services.VerificationService) *VerificationHandler {
	return &VerificationHandler{Service: service}
}

// CreateVerificationToken creates a new verification token
// @Summary Create a new verification token
// @Description Creates a new verification token with the provided details
// @Tags verification-tokens
// @Accept json
// @Produce json
// @Param token body models.VerificationToken true "VerificationToken data"
// @Success 201 {object} models.VerificationToken
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /verification-tokens [post]
func (h *VerificationHandler) CreateVerificationToken(c *gin.Context) {
	var token models.VerificationToken
	if err := c.ShouldBindJSON(&token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreateVerificationToken(&token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, token)
}

// GetVerificationToken retrieves a verification token by identifier
// @Summary Get a verification token
// @Description Retrieves a verification token by its identifier
// @Tags verification-tokens
// @Accept json
// @Produce json
// @Param identifier path string true "VerificationToken Identifier"
// @Success 200 {object} models.VerificationToken
// @Failure 404 {object} map[string]string
// @Router /verification-tokens/{identifier} [get]
func (h *VerificationHandler) GetVerificationToken(c *gin.Context) {
	identifier := c.Param("identifier")
	token, err := h.Service.GetVerificationToken(identifier)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "VerificationToken not found"})
		return
	}
	c.JSON(http.StatusOK, token)
}

// DeleteVerificationToken deletes a verification token by identifier
// @Summary Delete a verification token
// @Description Deletes a verification token by its identifier
// @Tags verification-tokens
// @Accept json
// @Produce json
// @Param identifier path string true "VerificationToken Identifier"
// @Success 204
// @Failure 500 {object} map[string]string
// @Router /verification-tokens/{identifier} [delete]
func (h *VerificationHandler) DeleteVerificationToken(c *gin.Context) {
	identifier := c.Param("identifier")
	if err := h.Service.DeleteVerificationToken(identifier); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
