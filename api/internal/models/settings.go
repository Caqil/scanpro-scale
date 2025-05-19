// internal/models/settings.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// Setting model for database
type Setting struct {
	ID          string `gorm:"primaryKey;type:varchar(100)"`
	Category    string `gorm:"index;type:varchar(50)"`  // e.g., "general", "api", "email", "security", "pricing"
	Key         string `gorm:"index;type:varchar(100)"` // Setting key
	Value       string `gorm:"type:text"`               // JSON value
	Description string `gorm:"type:text"`               // Optional description
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// SettingsMap represents a map of settings that can be stored as JSON
type SettingsMap map[string]interface{}

// Value implements the driver.Valuer interface for settings map
func (sm SettingsMap) Value() (driver.Value, error) {
	return json.Marshal(sm)
}

// Scan implements the sql.Scanner interface for settings map
func (sm *SettingsMap) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, &sm)
}
