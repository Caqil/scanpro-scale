// internal/handlers/utils/webhooks.go
package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"megapdf-api/internal/services/billing"
	"megapdf-api/internal/services/payment"

	"github.com/gin-gonic/gin"
)

// WebhooksHandler handles webhook callbacks from external services
type WebhooksHandler struct {
	paypalService  *payment.PayPalService
	billingService *billing.Service
}

// NewWebhooksHandler creates a new webhooks handler
func NewWebhooksHandler(paypalService *payment.PayPalService, billingService *billing.Service) *WebhooksHandler {
	return &WebhooksHandler{
		paypalService:  paypalService,
		billingService: billingService,
	}
}

// PayPalWebhook handles PayPal webhook events
func (h *WebhooksHandler) PayPalWebhook(c *gin.Context) {
	// Read raw body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Failed to read request body",
			"success": false,
		})
		return
	}

	// Parse event data
	var webhookEvent struct {
		EventType    string `json:"event_type"`
		ResourceType string `json:"resource_type"`
		Resource     struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"resource"`
	}

	if err := json.Unmarshal(body, &webhookEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid webhook payload",
			"success": false,
		})
		return
	}

	// Log the webhook event
	logWebhookEvent(webhookEvent)

	// Validate PayPal webhook signature (we skip this in this implementation)
	// In a production implementation, you should validate the webhook signature

	// Process the webhook event
	result, err := h.processPayPalWebhook(c, webhookEvent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err.Error(),
			"success": false,
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, result)
}

// processPayPalWebhook processes a PayPal webhook event
func (h *WebhooksHandler) processPayPalWebhook(c *gin.Context, event struct {
	EventType    string `json:"event_type"`
	ResourceType string `json:"resource_type"`
	Resource     struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	} `json:"resource"`
}) (gin.H, error) {
	// Handle different event types
	switch event.EventType {
	case "PAYMENT.CAPTURE.COMPLETED":
		// Payment was completed successfully
		return h.handlePaymentCaptureCompleted(c, event.Resource.ID)

	case "CHECKOUT.ORDER.APPROVED":
		// Order was approved but not yet captured
		return h.handleCheckoutOrderApproved(c, event.Resource.ID)

	case "CHECKOUT.ORDER.COMPLETED":
		// Order was completed
		return h.handleCheckoutOrderCompleted(c, event.Resource.ID)

	case "PAYMENT.SALE.COMPLETED":
		// Legacy event for payment completed
		return h.handlePaymentSaleCompleted(c, event.Resource.ID)

	default:
		// For other events, just acknowledge receipt
		return gin.H{
			"success": true,
			"message": "Webhook received but no action required",
			"event":   event.EventType,
		}, nil
	}
}

// handlePaymentCaptureCompleted handles a PAYMENT.CAPTURE.COMPLETED event
func (h *WebhooksHandler) handlePaymentCaptureCompleted(c *gin.Context, paymentID string) (gin.H, error) {
	// Get payment details from PayPal
	verified, amount, err := h.paypalService.GetOrderDetails(c, paymentID)
	if err != nil {
		return nil, err
	}

	if !verified {
		// Payment verification failed
		return gin.H{
			"success": false,
			"message": "Payment verification failed",
		}, nil
	}

	// Complete the deposit
	if err := h.billingService.CompletePendingDeposit(c, paymentID, amount); err != nil {
		return nil, err
	}

	return gin.H{
		"success": true,
		"message": "Payment processed successfully",
		"amount":  amount,
	}, nil
}

// handleCheckoutOrderApproved handles a CHECKOUT.ORDER.APPROVED event
func (h *WebhooksHandler) handleCheckoutOrderApproved(c *gin.Context, orderID string) (gin.H, error) {
	// We don't automatically capture on approval, so just acknowledge
	return gin.H{
		"success": true,
		"message": "Order approval acknowledged",
		"orderID": orderID,
	}, nil
}

// handleCheckoutOrderCompleted handles a CHECKOUT.ORDER.COMPLETED event
func (h *WebhooksHandler) handleCheckoutOrderCompleted(c *gin.Context, orderID string) (gin.H, error) {
	// Get order details from PayPal
	verified, amount, err := h.paypalService.GetOrderDetails(c, orderID)
	if err != nil {
		return nil, err
	}

	if !verified {
		// Order verification failed
		return gin.H{
			"success": false,
			"message": "Order verification failed",
		}, nil
	}

	// Complete the deposit
	if err := h.billingService.CompletePendingDeposit(c, orderID, amount); err != nil {
		return nil, err
	}

	return gin.H{
		"success": true,
		"message": "Order processed successfully",
		"amount":  amount,
	}, nil
}

// handlePaymentSaleCompleted handles a PAYMENT.SALE.COMPLETED event
func (h *WebhooksHandler) handlePaymentSaleCompleted(c *gin.Context, saleID string) (gin.H, error) {
	// Legacy event, similar to PAYMENT.CAPTURE.COMPLETED
	// Just acknowledge, as we would have already processed this via the CAPTURE event
	return gin.H{
		"success": true,
		"message": "Sale completion acknowledged",
		"saleID":  saleID,
	}, nil
}

// logWebhookEvent logs a webhook event for debugging
func logWebhookEvent(event interface{}) {
	// In a real implementation, this would log to a file or logging service
	eventJSON, _ := json.Marshal(event)
	fmt.Printf("Received webhook event: %s\n", string(eventJSON))
}
