package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// WebhookHandler handles webhook event-related HTTP requests
type WebhookHandler struct {
	Service *services.WebhookService
}

func NewWebhookHandler(service *services.WebhookService) *WebhookHandler {
	return &WebhookHandler{Service: service}
}

// CreateWebhookEvent creates a new webhook event
// @Summary Create a new webhook event
// @Description Creates a new webhook event with the provided details
// @Tags webhooks
// @Accept json
// @Produce json
// @Param event body models.PaymentWebhookEvent true "WebhookEvent data"
// @Success 201 {object} models.PaymentWebhookEvent
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /webhooks [post]
func (h *WebhookHandler) CreateWebhookEvent(c *gin.Context) {
	var event models.PaymentWebhookEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreateWebhookEvent(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, event)
}

// GetWebhookEvent retrieves a webhook event by ID
// @Summary Get a webhook event
// @Description Retrieves a webhook event by its ID
// @Tags webhooks
// @Accept json
// @Produce json
// @Param id path string true "WebhookEvent ID"
// @Success 200 {object} models.PaymentWebhookEvent
// @Failure 404 {object} map[string]string
// @Router /webhooks/{id} [get]
func (h *WebhookHandler) GetWebhookEvent(c *gin.Context) {
	id := c.Param("id")
	event, err := h.Service.GetWebhookEvent(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "WebhookEvent not found"})
		return
	}
	c.JSON(http.StatusOK, event)
}

// UpdateWebhookEvent updates a webhook event by ID
// @Summary Update a webhook event
// @Description Updates a webhook event with the provided details
// @Tags webhooks
// @Accept json
// @Produce json
// @Param id path string true "WebhookEvent ID"
// @Param event body models.PaymentWebhookEvent true "WebhookEvent data"
// @Success 200 {object} models.PaymentWebhookEvent
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /webhooks/{id} [put]
func (h *WebhookHandler) UpdateWebhookEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.PaymentWebhookEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.UpdateWebhookEvent(id, &event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, event)
}

// DeleteWebhookEvent deletes a webhook event by ID
// @Summary Delete a webhook event
// @Description Deletes a webhook event by its ID
// @Tags webhooks
// @Accept json
// @Produce json
// @Param id path string true "WebhookEvent ID"
// @Success 204
// @Failure 500 {object} map[string]string
// @Router /webhooks/{id} [delete]
func (h *WebhookHandler) DeleteWebhookEvent(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteWebhookEvent(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
