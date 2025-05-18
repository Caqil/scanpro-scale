// internal/services/paypal_service.go
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/Caqil/megapdf-api/internal/db"
	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PayPalService struct {
	clientID     string
	clientSecret string
	apiBase      string
	appURL       string
}

func NewPayPalService(clientID, clientSecret, apiBase, appURL string) *PayPalService {
	return &PayPalService{
		clientID:     clientID,
		clientSecret: clientSecret,
		apiBase:      apiBase,
		appURL:       appURL,
	}
}

// GetAccessToken obtains an access token from PayPal
func (s *PayPalService) GetAccessToken() (string, error) {
	if s.clientID == "" || s.clientSecret == "" {
		return "", fmt.Errorf("PayPal credentials are not configured")
	}

	url := fmt.Sprintf("%s/v1/oauth2/token", s.apiBase)
	payload := []byte("grant_type=client_credentials")

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}

	req.SetBasicAuth(s.clientID, s.clientSecret)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("failed to get access token: %s - %s", resp.Status, string(body))
	}

	var result struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.AccessToken, nil
}

// CreateOrder creates a PayPal order for deposit
func (s *PayPalService) CreateOrder(userID string, amount float64, description string) (string, string, error) {
	accessToken, err := s.GetAccessToken()
	if err != nil {
		return "", "", err
	}

	url := fmt.Sprintf("%s/v2/checkout/orders", s.apiBase)

	// Format amount to 2 decimal places
	formattedAmount := fmt.Sprintf("%.2f", amount)

	// Create order payload
	orderData := map[string]interface{}{
		"intent": "CAPTURE",
		"purchase_units": []map[string]interface{}{
			{
				"reference_id": userID,
				"description":  description,
				"amount": map[string]interface{}{
					"currency_code": "USD",
					"value":         formattedAmount,
				},
			},
		},
		"application_context": map[string]interface{}{
			"brand_name":          "MegaPDF",
			"locale":              "en-US",
			"shipping_preference": "NO_SHIPPING",
			"user_action":         "PAY_NOW",
			"return_url":          fmt.Sprintf("%s/en/dashboard/success", s.appURL),
			"cancel_url":          fmt.Sprintf("%s/en/dashboard/cancel", s.appURL),
		},
	}

	jsonData, err := json.Marshal(orderData)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("PayPal-Request-Id", fmt.Sprintf("order_%d_%s", time.Now().Unix(), userID[:8]))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("failed to create order: %s - %s", resp.Status, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}

	// Extract order ID
	orderID, ok := result["id"].(string)
	if !ok {
		return "", "", fmt.Errorf("order ID not found in response")
	}

	// Extract approval URL
	var approvalURL string
	if links, ok := result["links"].([]interface{}); ok {
		for _, link := range links {
			if linkMap, ok := link.(map[string]interface{}); ok {
				if rel, ok := linkMap["rel"].(string); ok && rel == "approve" {
					approvalURL = linkMap["href"].(string)
					break
				}
			}
		}
	}

	if approvalURL == "" {
		return "", "", fmt.Errorf("approval URL not found in response")
	}

	return orderID, approvalURL, nil
}

// VerifyOrder verifies and captures a PayPal order
func (s *PayPalService) VerifyOrder(orderID string) (bool, float64, error) {
	accessToken, err := s.GetAccessToken()
	if err != nil {
		return false, 0, err
	}

	// First, get order details
	detailsURL := fmt.Sprintf("%s/v2/checkout/orders/%s", s.apiBase, orderID)
	req, err := http.NewRequest("GET", detailsURL, nil)
	if err != nil {
		return false, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return false, 0, fmt.Errorf("failed to get order details: %s - %s", resp.Status, string(body))
	}

	var orderDetails map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&orderDetails); err != nil {
		return false, 0, err
	}

	// Check if the order is approved
	status, ok := orderDetails["status"].(string)
	if !ok || status != "APPROVED" {
		return false, 0, fmt.Errorf("order is not approved: %s", status)
	}

	// Capture the payment
	captureURL := fmt.Sprintf("%s/v2/checkout/orders/%s/capture", s.apiBase, orderID)
	captureReq, err := http.NewRequest("POST", captureURL, bytes.NewBuffer([]byte("{}")))
	if err != nil {
		return false, 0, err
	}

	captureReq.Header.Set("Content-Type", "application/json")
	captureReq.Header.Set("Authorization", "Bearer "+accessToken)

	captureResp, err := client.Do(captureReq)
	if err != nil {
		return false, 0, err
	}
	defer captureResp.Body.Close()

	if captureResp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(captureResp.Body)
		return false, 0, fmt.Errorf("failed to capture payment: %s - %s", captureResp.Status, string(body))
	}

	var captureData map[string]interface{}
	if err := json.NewDecoder(captureResp.Body).Decode(&captureData); err != nil {
		return false, 0, err
	}

	// Check status of capture
	captureStatus, ok := captureData["status"].(string)
	if !ok || captureStatus != "COMPLETED" {
		return false, 0, fmt.Errorf("capture not completed: %s", captureStatus)
	}

	// Extract amount
	var amount float64 = 0.0

	// Try to get amount from capture data
	if purchaseUnits, ok := captureData["purchase_units"].([]interface{}); ok && len(purchaseUnits) > 0 {
		if unit, ok := purchaseUnits[0].(map[string]interface{}); ok {
			if payments, ok := unit["payments"].(map[string]interface{}); ok {
				if captures, ok := payments["captures"].([]interface{}); ok && len(captures) > 0 {
					if capture, ok := captures[0].(map[string]interface{}); ok {
						if amountObj, ok := capture["amount"].(map[string]interface{}); ok {
							if valueStr, ok := amountObj["value"].(string); ok {
								amount, _ = strconv.ParseFloat(valueStr, 64)
							} else if valueFloat, ok := amountObj["value"].(float64); ok {
								amount = valueFloat
							}
						}
					}
				}
			}
		}
	}

	// If amount is still 0, try to get from order details
	if amount == 0 && orderDetails["purchase_units"] != nil {
		if purchaseUnits, ok := orderDetails["purchase_units"].([]interface{}); ok && len(purchaseUnits) > 0 {
			if unit, ok := purchaseUnits[0].(map[string]interface{}); ok {
				if amountObj, ok := unit["amount"].(map[string]interface{}); ok {
					if valueStr, ok := amountObj["value"].(string); ok {
						amount, _ = strconv.ParseFloat(valueStr, 64)
					} else if valueFloat, ok := amountObj["value"].(float64); ok {
						amount = valueFloat
					}
				}
			}
		}
	}

	// Get amount from transaction if still 0
	if amount == 0 {
		var transaction models.Transaction
		if err := db.DB.Where("payment_id = ? AND status = ?", orderID, "pending").First(&transaction).Error; err == nil {
			amount = transaction.Amount
			fmt.Printf("Using amount from database: %f\n", amount)
		}
	}

	fmt.Printf("Final amount determined: %f\n", amount)
	return true, amount, nil
}

// HandleWebhook processes PayPal webhook events
func (s *PayPalService) HandleWebhook(event map[string]interface{}) error {
	// Save webhook event to database for debugging/audit
	eventID, _ := event["id"].(string)
	eventType, _ := event["event_type"].(string)
	resourceType, _ := event["resource_type"].(string)

	var resourceID string
	if resource, ok := event["resource"].(map[string]interface{}); ok {
		resourceID, _ = resource["id"].(string)
	}

	// Convert event to JSON for storage
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %v", err)
	}

	webhookEvent := models.PaymentWebhookEvent{
		ID:           uuid.New().String(),
		EventId:      eventID,
		EventType:    eventType,
		ResourceType: resourceType,
		ResourceId:   resourceID,
		RawData:      string(eventJSON),
		CreatedAt:    time.Now(),
	}

	if err := db.DB.Create(&webhookEvent).Error; err != nil {
		return fmt.Errorf("failed to save webhook event: %v", err)
	}

	// Process based on event type
	switch eventType {
	case "PAYMENT.CAPTURE.COMPLETED":
		err = s.handlePaymentCompleted(event)
	case "PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.REFUNDED":
		err = s.handlePaymentFailed(event)
	}

	return err
}

// handlePaymentCompleted processes a completed payment
func (s *PayPalService) handlePaymentCompleted(event map[string]interface{}) error {
	var orderID string
	if resource, ok := event["resource"].(map[string]interface{}); ok {
		if data, ok := resource["supplementary_data"].(map[string]interface{}); ok {
			if ids, ok := data["related_ids"].(map[string]interface{}); ok {
				if id, ok := ids["order_id"].(string); ok {
					orderID = id
				} else if id, ok := ids["payment_id"].(string); ok {
					orderID = id
				}
			}
		}

		// If still no ID, try resource ID
		if orderID == "" {
			if id, ok := resource["id"].(string); ok {
				orderID = id
			}
		}
	}

	if orderID == "" {
		return fmt.Errorf("missing order ID in payment completed event")
	}

	// Find the pending transaction
	var transaction models.Transaction
	if err := db.DB.Where("payment_id = ? AND status = ?", orderID, "pending").First(&transaction).Error; err != nil {
		return fmt.Errorf("transaction not found: %v", err)
	}

	// Get user's current balance
	var user models.User
	if err := db.DB.First(&user, "id = ?", transaction.UserID).Error; err != nil {
		return fmt.Errorf("user not found: %v", err)
	}

	// Calculate new balance
	newBalance := user.Balance + transaction.Amount

	// Update user balance and transaction in a single transaction
	return db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
			return err
		}

		return tx.Model(&transaction).Updates(map[string]interface{}{
			"status":        "completed",
			"description":   "Deposit - completed (webhook)",
			"balance_after": newBalance,
		}).Error
	})
}

// handlePaymentFailed processes a failed payment
func (s *PayPalService) handlePaymentFailed(event map[string]interface{}) error {
	var orderID string
	if resource, ok := event["resource"].(map[string]interface{}); ok {
		if data, ok := resource["supplementary_data"].(map[string]interface{}); ok {
			if ids, ok := data["related_ids"].(map[string]interface{}); ok {
				if id, ok := ids["order_id"].(string); ok {
					orderID = id
				} else if id, ok := ids["payment_id"].(string); ok {
					orderID = id
				}
			}
		}

		// If still no ID, try resource ID
		if orderID == "" {
			if id, ok := resource["id"].(string); ok {
				orderID = id
			}
		}
	}

	if orderID == "" {
		return fmt.Errorf("missing order ID in payment failed event")
	}

	// Find the transaction
	var transaction models.Transaction
	if err := db.DB.Where("payment_id = ? AND status = ?", orderID, "pending").First(&transaction).Error; err != nil {
		return fmt.Errorf("transaction not found: %v", err)
	}

	// Mark as failed
	return db.DB.Model(&transaction).Updates(map[string]interface{}{
		"status":      "failed",
		"description": "Deposit - failed (webhook)",
	}).Error
}
