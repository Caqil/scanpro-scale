// internal/handlers/paypal_webhook_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

type PayPalWebhookHandler struct {
}

func NewPayPalWebhookHandler() *PayPalWebhookHandler {
	return &PayPalWebhookHandler{}
}

// HandleWebhook processes PayPal webhook events
func (h *PayPalWebhookHandler) HandleWebhook(c *gin.Context) {
	// Read the raw request body
	rawBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	// Parse the JSON payload
	var event map[string]interface{}
	if err := json.Unmarshal(rawBody, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Log the webhook event type
	eventType, _ := event["event_type"].(string)
	resourceType, _ := event["resource_type"].(string)
	var resourceID string
	if resource, ok := event["resource"].(map[string]interface{}); ok {
		resourceID, _ = resource["id"].(string)
	}
	fmt.Printf("Processing PayPal webhook: type=%s, resource=%s, ID=%s\n",
		eventType, resourceType, resourceID)
	// Log webhook details
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(http.StatusOK)

	// Create PayPal service
	paypalService := services.NewPayPalService(
		os.Getenv("PAYPAL_CLIENT_ID"),
		os.Getenv("PAYPAL_CLIENT_SECRET"),
		os.Getenv("PAYPAL_API_BASE"),
		os.Getenv("NEXT_PUBLIC_APP_URL"),
	)

	// Process the webhook
	if err := paypalService.HandleWebhook(event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process webhook: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Webhook processed successfully",
	})
}
