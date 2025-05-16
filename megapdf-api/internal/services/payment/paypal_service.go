package billing

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"megapdf-api/internal/config"
)

// PayPalService handles PayPal integration
type PayPalService struct {
	clientID     string
	clientSecret string
	isSandbox    bool
}

// NewPayPalService creates a new PayPal service
func NewPayPalService(cfg *config.BillingConfig) *PayPalService {
	return &PayPalService{
		clientID:     cfg.PayPalClientID,
		clientSecret: cfg.PayPalClientSecret,
		isSandbox:    cfg.PayPalSandbox,
	}
}

// PayPalAccessToken represents a PayPal access token
type PayPalAccessToken struct {
	Token     string
	TokenType string
	ExpiresIn int
	ExpiresAt time.Time
}

// PayPalOrder represents a PayPal order
type PayPalOrder struct {
	ID          string
	Status      string
	Links       []PayPalLink
	ApprovalURL string
}

// PayPalLink represents a link in a PayPal order
type PayPalLink struct {
	Href   string `json:"href"`
	Rel    string `json:"rel"`
	Method string `json:"method"`
}

// getBaseURL returns the base URL for PayPal API calls
func (s *PayPalService) getBaseURL() string {
	if s.isSandbox {
		return "https://api-m.sandbox.paypal.com"
	}
	return "https://api-m.paypal.com"
}

// getAccessToken gets a PayPal access token
func (s *PayPalService) getAccessToken() (*PayPalAccessToken, error) {
	url := s.getBaseURL() + "/v1/oauth2/token"

	// Create basic auth header
	auth := base64.StdEncoding.EncodeToString([]byte(s.clientID + ":" + s.clientSecret))

	// Create request
	req, err := http.NewRequest("POST", url, bytes.NewBufferString("grant_type=client_credentials"))
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", "Basic "+auth)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get access token: %s", body)
	}

	// Parse response
	var result struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return &PayPalAccessToken{
		Token:     result.AccessToken,
		TokenType: result.TokenType,
		ExpiresIn: result.ExpiresIn,
		ExpiresAt: time.Now().Add(time.Duration(result.ExpiresIn) * time.Second),
	}, nil
}

// CreateOrder creates a PayPal order
func (s *PayPalService) CreateOrder(ctx context.Context, amount float64, description string) (*PayPalOrder, error) {
	// Get access token
	token, err := s.getAccessToken()
	if err != nil {
		return nil, err
	}

	// Create order
	url := s.getBaseURL() + "/v2/checkout/orders"

	// Create request body
	requestBody := map[string]interface{}{
		"intent": "CAPTURE",
		"purchase_units": []map[string]interface{}{
			{
				"amount": map[string]interface{}{
					"currency_code": "USD",
					"value":         fmt.Sprintf("%.2f", amount),
				},
				"description": description,
			},
		},
		"application_context": map[string]interface{}{
			"return_url": "https://example.com/success",
			"cancel_url": "https://example.com/cancel",
		},
	}

	// Convert to JSON
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	// Create request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("%s %s", token.TokenType, token.Token))

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Check status code
	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create order: %s", body)
	}

	// Parse response
	var result struct {
		ID     string `json:"id"`
		Status string `json:"status"`
		Links  []struct {
			Href   string `json:"href"`
			Rel    string `json:"rel"`
			Method string `json:"method"`
		} `json:"links"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	// Get approval URL
	var approvalURL string
	for _, link := range result.Links {
		if link.Rel == "approve" {
			approvalURL = link.Href
			break
		}
	}

	if approvalURL == "" {
		return nil, errors.New("approval URL not found")
	}

	return &PayPalOrder{
		ID:          result.ID,
		Status:      result.Status,
		Links:       []PayPalLink{},
		ApprovalURL: approvalURL,
	}, nil
}

// CaptureOrder captures a PayPal order
func (s *PayPalService) CaptureOrder(ctx context.Context, orderID string) (bool, float64, error) {
	// Get access token
	token, err := s.getAccessToken()
	if err != nil {
		return false, 0, err
	}

	// Capture order
	url := s.getBaseURL() + "/v2/checkout/orders/" + orderID + "/capture"

	// Create request
	req, err := http.NewRequest("POST", url, bytes.NewBufferString(""))
	if err != nil {
		return false, 0, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("%s %s", token.TokenType, token.Token))

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, 0, err
	}

	// Check status code
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return false, 0, fmt.Errorf("failed to capture order: %s", body)
	}

	// Parse response
	var result struct {
		Status        string `json:"status"`
		PurchaseUnits []struct {
			Payments struct {
				Captures []struct {
					Amount struct {
						Value string `json:"value"`
					} `json:"amount"`
				} `json:"captures"`
			} `json:"payments"`
		} `json:"purchase_units"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return false, 0, err
	}

	if result.Status != "COMPLETED" {
		return false, 0, fmt.Errorf("order not completed: %s", result.Status)
	}

	// Get amount
	if len(result.PurchaseUnits) == 0 ||
		len(result.PurchaseUnits[0].Payments.Captures) == 0 {
		return true, 0, nil
	}

	amountStr := result.PurchaseUnits[0].Payments.Captures[0].Amount.Value
	amount, err := parseFloat(amountStr)
	if err != nil {
		return true, 0, nil
	}

	return true, amount, nil
}

// GetOrderDetails gets details of a PayPal order
func (s *PayPalService) GetOrderDetails(ctx context.Context, orderID string) (bool, float64, error) {
	// Get access token
	token, err := s.getAccessToken()
	if err != nil {
		return false, 0, err
	}

	// Get order details
	url := s.getBaseURL() + "/v2/checkout/orders/" + orderID

	// Create request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, 0, err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("%s %s", token.TokenType, token.Token))

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, 0, err
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return false, 0, fmt.Errorf("failed to get order details: %s", body)
	}

	// Parse response
	var result struct {
		Status        string `json:"status"`
		PurchaseUnits []struct {
			Amount struct {
				Value string `json:"value"`
			} `json:"amount"`
		} `json:"purchase_units"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return false, 0, err
	}

	// Check if completed
	completed := result.Status == "COMPLETED" || result.Status == "APPROVED"

	// Get amount
	if len(result.PurchaseUnits) == 0 {
		return completed, 0, nil
	}

	amountStr := result.PurchaseUnits[0].Amount.Value
	amount, err := parseFloat(amountStr)
	if err != nil {
		return completed, 0, nil
	}

	return completed, amount, nil
}

// Helper to parse float
func parseFloat(s string) (float64, error) {
	var f float64
	_, err := fmt.Sscanf(s, "%f", &f)
	return f, err
}
