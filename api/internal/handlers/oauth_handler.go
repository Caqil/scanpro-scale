// internal/handlers/oauth_handler.go
package handlers

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"

	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

type OAuthHandler struct {
	service      *services.OAuthService
	appURL       string
	apiURL       string
	cookieDomain string
}

func NewOAuthHandler(service *services.OAuthService, appURL, apiURL string) *OAuthHandler {
	// Extract domain from appURL for cookie
	u, err := url.Parse(appURL)
	cookieDomain := ""
	if err == nil {
		cookieDomain = u.Hostname()
	}

	return &OAuthHandler{
		service:      service,
		appURL:       appURL,
		apiURL:       apiURL,
		cookieDomain: cookieDomain,
	}
}

// GoogleAuth initiates Google OAuth flow
func (h *OAuthHandler) GoogleAuth(c *gin.Context) {
	// Generate a state token
	state, err := h.service.GenerateStateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate state token",
		})
		return
	}

	// Store state in cookie for verification
	c.SetCookie(
		"oauth_state",
		state,
		3600, // 1 hour
		"/",
		h.cookieDomain,
		c.Request.TLS != nil, // Secure
		true,                 // HTTP only
	)

	// Get callback URL (can be specified or use default)
	callbackURL := c.DefaultQuery("callbackUrl", "/en/dashboard")
	c.SetCookie(
		"oauth_callback",
		callbackURL,
		3600, // 1 hour
		"/",
		h.cookieDomain,
		c.Request.TLS != nil, // Secure
		true,                 // HTTP only
	)

	// Redirect to Google OAuth URL
	authURL := h.service.GetGoogleAuthURL(state)
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GoogleCallback handles the OAuth callback from Google
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	// Get state from URL and cookie
	stateParam := c.Query("state")
	stateCookie, err := c.Cookie("oauth_state")

	// Verify state token to prevent CSRF
	if err != nil || stateParam != stateCookie {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/en/login?error=%s", h.appURL, url.QueryEscape("Invalid OAuth state")))
		return
	}

	// Clear state cookie
	c.SetCookie("oauth_state", "", -1, "/", h.cookieDomain, c.Request.TLS != nil, true)

	// Get code from URL
	code := c.Query("code")
	if code == "" {
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/en/login?error=%s", h.appURL, url.QueryEscape("No code provided")))
		return
	}

	// Exchange code for token and get user info
	result, err := h.service.HandleGoogleCallback(code)
	if err != nil {
		errorMsg := base64.URLEncoding.EncodeToString([]byte(err.Error()))
		c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s/en/login?error=%s", h.appURL, errorMsg))
		return
	}

	// Set auth token in cookie
	secure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetCookie(
		"authToken",
		result.Token,
		60*60*24*7, // 7 days
		"/",
		h.cookieDomain,
		secure,
		true,
	)

	// Get callback URL from cookie or use default
	callbackURL, err := c.Cookie("oauth_callback")
	if err != nil || callbackURL == "" {
		callbackURL = "/en/dashboard"
	}

	// Clear callback cookie
	c.SetCookie("oauth_callback", "", -1, "/", h.cookieDomain, secure, true)

	// Redirect to dashboard or callback URL
	c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s%s", h.appURL, callbackURL))
}
