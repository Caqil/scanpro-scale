// internal/models/settings.go
package models

import (
	"time"
)

// Setting represents a system setting
type Setting struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Category    string    `json:"category" gorm:"index"`
	Key         string    `json:"key" gorm:"index"`
	Value       string    `json:"value" gorm:"type:text"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// DefaultSettings returns a map of all default settings by category
func DefaultSettings() map[string]map[string]interface{} {
	return map[string]map[string]interface{}{
		"general": {
			"siteName":                 "MegaPDF",
			"siteDescription":          "Professional PDF tools and API services",
			"maintenanceMode":          false,
			"registrationEnabled":      true,
			"requireEmailVerification": true,
			"appUrl":                   "http://localhost:3000",
			"apiUrl":                   "http://localhost:8080",
			"debug":                    false,
		},
		"security": {
			"jwtSecret":                "your-default-secret-key", // Should be changed in production
			"passwordMinLength":        8,
			"passwordRequireUppercase": true,
			"passwordRequireNumbers":   true,
			"passwordRequireSymbols":   false,
			"sessionTimeout":           24,
			"maxLoginAttempts":         5,
			"corsAllowedOrigins":       "*",
		},
		"email": {
			"emailProvider": "smtp",
			"fromEmail":     "noreply@mega-pdf.com",
			"fromName":      "MegaPDF",
			"smtpHost":      "",
			"smtpPort":      587,
			"smtpUser":      "",
			"smtpPassword":  "",
			"smtpSecure":    false,
		},
		"payment": {
			"paypalClientId":     "",
			"paypalClientSecret": "",
			"paypalApiBase":      "https://api-m.sandbox.paypal.com",
		},
		"api": {
			"defaultRateLimit": 100,
			"maxFileSize":      50,
			"apiTimeout":       30,
			"loggingEnabled":   true,
			"logLevel":         "info",
		},
		"database": {
			"dbHost":            "localhost",
			"dbPort":            3306,
			"dbName":            "megapdf",
			"dbUser":            "root",
			"dbPassword":        "",
			"dbCharset":         "utf8mb4",
			"dbCollation":       "utf8mb4_unicode_ci",
			"dbTimezone":        "UTC",
			"dbMaxIdleConns":    10,
			"dbMaxOpenConns":    100,
			"dbConnMaxLifetime": "1h",
		},
		"oauth": {
			"googleClientId":     "",
			"googleClientSecret": "",
			"oauthRedirectUrl":   "http://localhost:8080/api/auth/google/callback",
		},
		"storage": {
			"tempDir":     "temp",
			"uploadDir":   "uploads",
			"publicDir":   "public",
			"storagePath": "./storage",
		},
		"pricing": {
			"operationCost":         0.005,
			"freeOperationsMonthly": 500,
		},
	}
}
