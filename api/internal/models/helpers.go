// internal/models/helpers.go
package models

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// GenerateID generates a new UUID string for database records
func GenerateID() string {
	return uuid.New().String()
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// ComparePasswords compares a hashed password with a plaintext password
func ComparePasswords(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// TimePtr returns a pointer to a time.Time value
func TimePtr(t time.Time) *time.Time {
	return &t
}

// StringPtr returns a pointer to a string value
func StringPtr(s string) *string {
	return &s
}

// IntPtr returns a pointer to an int value
func IntPtr(i int) *int {
	return &i
}

// GetFirstDayOfMonth returns the first day of the month for the given date string
func GetFirstDayOfMonth(dateStr string) time.Time {
	t, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		t = time.Now().UTC()
	}

	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
}

// GetLastDayOfMonth returns the last day of the month for the given date string
func GetLastDayOfMonth(dateStr string) time.Time {
	t, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		t = time.Now().UTC()
	}

	// Go to the first day of next month, then subtract one day
	nextMonth := t.AddDate(0, 1, 0)
	firstOfNextMonth := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
	lastDayOfMonth := firstOfNextMonth.AddDate(0, 0, -1)

	return lastDayOfMonth
}

// ParseDate parses a date string in RFC3339 format
func ParseDate(dateStr string) time.Time {
	t, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		return time.Now().UTC()
	}
	return t
}

// FormatDate formats a time.Time as an RFC3339 string
func FormatDate(t time.Time) string {
	return t.Format(time.RFC3339)
}

// ConvertJSONArray converts between JSON string arrays and Go string slices
// This is useful for storing arrays in SQLite
func ConvertJSONArray(jsonArray string) []string {
	if jsonArray == "" {
		return []string{}
	}

	// Remove brackets and split by commas
	trimmed := strings.TrimPrefix(strings.TrimSuffix(jsonArray, "]"), "[")
	if trimmed == "" {
		return []string{}
	}

	// Split by comma and remove quotes
	parts := strings.Split(trimmed, ",")
	result := make([]string, len(parts))

	for i, part := range parts {
		// Remove quotes and trim spaces
		result[i] = strings.Trim(strings.TrimSpace(part), "\"'")
	}

	return result
}

// ConvertToJSONArray converts a string slice to a JSON array string
func ConvertToJSONArray(slice []string) string {
	if len(slice) == 0 {
		return "[]"
	}

	// Quote each element
	quoted := make([]string, len(slice))
	for i, s := range slice {
		quoted[i] = fmt.Sprintf("\"%s\"", s)
	}

	// Join with commas and add brackets
	return "[" + strings.Join(quoted, ",") + "]"
}

// GetNow returns the current time in UTC
func GetNow() time.Time {
	return time.Now().UTC()
}

// GetCurrentDateString returns the current date as an RFC3339 string
func GetCurrentDateString() string {
	return time.Now().UTC().Format(time.RFC3339)
}

// GetTimestamp returns the current Unix timestamp
func GetTimestamp() int64 {
	return time.Now().UTC().Unix()
}

// FormatTimeForDisplay formats a time.Time for display
func FormatTimeForDisplay(t time.Time) string {
	return t.Format("January 2, 2006 15:04:05 MST")
}

// DateForDisplay formats a time.Time as a simple date
func DateForDisplay(t time.Time) string {
	return t.Format("2006-01-02")
}
