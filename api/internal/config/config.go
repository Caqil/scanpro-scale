// internal/config/config.go
package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/Caqil/megapdf-api/internal/db"
)

// Config holds all the application configuration
type Config struct {
	Port               int
	JWTSecret          string
	TempDir            string
	UploadDir          string
	PublicDir          string
	PayPalClientID     string
	PayPalClientSecret string
	PayPalAPIBase      string
	SMTPHost           string
	SMTPPort           int
	SMTPUser           string
	SMTPPass           string
	SMTPSecure         bool
	EmailFrom          string
	ContactRecipient   string
	AppURL             string
	Debug              bool
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	port, _ := strconv.Atoi(getEnv("PORT", "8080"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	return &Config{
		Port:               port,
		JWTSecret:          getEnv("JWT_SECRET", "your-default-secret-key"),
		TempDir:            getEnv("TEMP_DIR", "temp"),
		UploadDir:          getEnv("UPLOAD_DIR", "uploads"),
		PublicDir:          getEnv("PUBLIC_DIR", "public"),
		PayPalClientID:     getEnv("PAYPAL_CLIENT_ID", ""),
		PayPalClientSecret: getEnv("PAYPAL_CLIENT_SECRET", ""),
		PayPalAPIBase:      getEnv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com"),
		SMTPHost:           getEnv("SMTP_HOST", ""),
		SMTPPort:           smtpPort,
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPass:           getEnv("SMTP_PASS", ""),
		SMTPSecure:         getEnv("SMTP_SECURE", "false") == "true",
		EmailFrom:          getEnv("EMAIL_FROM", "noreply@mega-pdf.com"),
		ContactRecipient:   getEnv("CONTACT_RECIPIENT_EMAIL", ""),
		AppURL:             getEnv("APP_URL", "http://localhost:8080"),
		Debug:              getEnv("DEBUG", "false") == "true",
	}
}

// InitDB initializes the database with the config settings
func InitDB() error {
	_, err := db.InitDB()
	return err
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetEnvAsSlice splits a comma-separated environment variable into a slice
func GetEnvAsSlice(key, defaultValue string) []string {
	value := getEnv(key, defaultValue)
	if value == "" {
		return []string{}
	}
	return strings.Split(value, ",")
}