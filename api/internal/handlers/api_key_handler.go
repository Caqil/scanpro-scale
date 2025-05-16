package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// ApiKeyHandler handles API key-related HTTP requests
type ApiKeyHandler struct {
	Service *services.ApiKeyService
}

func NewApiKeyHandler(service *services.ApiKeyService) *ApiKeyHandler {
	return &ApiKeyHandler{Service: service}
}

// CreateApiKey creates a new API key
// @Summary Create a new API key
// @Description Creates a new API key with the provided details
// @Tags api-keys
// @Accept json
// @Produce json
// @Param apiKey body models.ApiKey true "ApiKey data"
// @Success 201 {object} models.ApiKey
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /api-keys [post]
func (h *ApiKeyHandler) CreateApiKey(c *gin.Context) {
	var apiKey models.ApiKey
	if err := c.ShouldBindJSON(&apiKey); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreateApiKey(&apiKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, apiKey)
}

// GetApiKey retrieves an API key by ID
// @Summary Get an API key
// @Description Retrieves an API key by its ID
// @Tags api-keys
// @Accept json
// @Produce json
// @Param id path string true "ApiKey ID"
// @Success 200 {object} models.ApiKey
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /api-keys/{id} [get]
func (h *ApiKeyHandler) GetApiKey(c *gin.Context) {
	id := c.Param("id")
	apiKey, err := h.Service.GetApiKey(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ApiKey not found"})
		return
	}
	c.JSON(http.StatusOK, apiKey)
}

// UpdateApiKey updates an API key by ID
// @Summary Update an API key
// @Description Updates an API key with the provided details
// @Tags api-keys
// @Accept json
// @Produce json
// @Param id path string true "ApiKey ID"
// @Param apiKey body models.ApiKey true "ApiKey data"
// @Success 200 {object} models.ApiKey
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /api-keys/{id} [put]
func (h *ApiKeyHandler) UpdateApiKey(c *gin.Context) {
	id := c.Param("id")
	var apiKey models.ApiKey
	if err := c.ShouldBindJSON(&apiKey); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.UpdateApiKey(id, &apiKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, apiKey)
}

// DeleteApiKey deletes an API key by ID
// @Summary Delete an API key
// @Description Deletes an API key by its ID
// @Tags api-keys
// @Accept json
// @Produce json
// @Param id path string true "ApiKey ID"
// @Success 204
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /api-keys/{id} [delete]
func (h *ApiKeyHandler) DeleteApiKey(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteApiKey(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
