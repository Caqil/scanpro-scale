
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID                  string            `gorm:"primaryKey;type:varchar(100)" json:"id"`
    Name                string            `gorm:"type:varchar(255)" json:"name"`
    Email               string            `gorm:"unique;type:varchar(255)" json:"email"`
    EmailVerified       *time.Time        `gorm:"type:datetime" json:"emailVerified"`
    Image               string            `gorm:"type:varchar(255)" json:"image"`
    Password            string            `gorm:"type:varchar(255)" json:"password"`
    Role                string            `gorm:"type:varchar(50);default:'user'" json:"role"`
    CreatedAt           time.Time         `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt           time.Time         `gorm:"autoUpdateTime" json:"updatedAt"`
    VerificationToken   string            `gorm:"type:varchar(255)" json:"verificationToken"`
    IsEmailVerified     bool              `gorm:"default:false" json:"isEmailVerified"`
    Balance             float64           `gorm:"default:0" json:"balance"`
    FreeOperationsReset time.Time         `gorm:"type:datetime;default:current_timestamp" json:"freeOperationsReset"`
    FreeOperationsUsed  int               `gorm:"default:0" json:"freeOperationsUsed"`
    Accounts            []Account         `gorm:"foreignKey:UserID" json:"accounts"`
    ApiKeys             []ApiKey          `gorm:"foreignKey:UserID" json:"apiKeys"`
    Sessions            []Session         `gorm:"foreignKey:UserID" json:"sessions"`
    Transactions        []Transaction     `gorm:"foreignKey:UserID" json:"transactions"`
    UsageStats          []UsageStats      `gorm:"foreignKey:UserID" json:"usageStats"`
}

type Transaction struct {
    ID           string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    UserID       string    `gorm:"type:varchar(100)" json:"userId"`
    Amount       float64   `json:"amount"`
    BalanceAfter float64   `json:"balanceAfter"`
    Description  string    `gorm:"type:varchar(255)" json:"description"`
    PaymentID    string    `gorm:"type:varchar(100)" json:"paymentId"`
    Status       string    `gorm:"type:varchar(50);default:'completed'" json:"status"`
    CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
    User         User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
}

type Account struct {
    ID                string `gorm:"primaryKey;type:varchar(100)" json:"id"`
    UserID            string `gorm:"type:varchar(100)" json:"userId"`
    Type              string `gorm:"type:varchar(50)" json:"type"`
    Provider          string `gorm:"type:varchar(50)" json:"provider"`
    ProviderAccountID string `gorm:"type:varchar(100)" json:"providerAccountId"`
    RefreshToken      string `gorm:"type:varchar(255)" json:"refreshToken"`
    AccessToken       string `gorm:"type:varchar(255)" json:"accessToken"`
    ExpiresAt         int    `json:"expiresAt"`
    TokenType         string `gorm:"type:varchar(50)" json:"tokenType"`
    Scope             string `gorm:"type:varchar(255)" json:"scope"`
    IDToken           string `gorm:"type:varchar(255)" json:"idToken"`
    SessionState      string `gorm:"type:varchar(255)" json:"sessionState"`
    User              User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
    gorm.Model
}

type Session struct {
    ID           string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    SessionToken string    `gorm:"unique;type:varchar(255)" json:"sessionToken"`
    UserID       string    `gorm:"type:varchar(100)" json:"userId"`
    Expires      time.Time `json:"expires"`
    User         User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
}

type UsageStats struct {
    ID        string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    UserID    string    `gorm:"type:varchar(100)" json:"userId"`
    Operation string    `gorm:"type:varchar(100)" json:"operation"`
    Count     int       `gorm:"default:0" json:"count"`
    Date      time.Time `json:"date"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
    User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
    gorm.Model
}

type VerificationToken struct {
    Identifier string    `gorm:"type:varchar(255)" json:"identifier"`
    Token      string    `gorm:"unique;type:varchar(255)" json:"token"`
    Expires    time.Time `json:"expires"`
    gorm.Model
}

type ApiKey struct {
    ID          string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    UserID      string    `gorm:"type:varchar(100)" json:"userId"`
    Name        string    `gorm:"type:varchar(255)" json:"name"`
    Key         string    `gorm:"unique;type:varchar(255)" json:"key"`
    Permissions []string  `gorm:"type:text;serializer:json" json:"permissions"`
    LastUsed    *time.Time `gorm:"type:datetime" json:"lastUsed"`
    ExpiresAt   *time.Time `gorm:"type:datetime" json:"expiresAt"`
    CreatedAt   time.Time  `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updatedAt"`
    User        User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user"`
}

type PasswordResetToken struct {
    ID        string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    Email     string    `gorm:"type:varchar(255)" json:"email"`
    Token     string    `gorm:"unique;type:varchar(255)" json:"token"`
    Expires   time.Time `json:"expires"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type PaymentWebhookEvent struct {
    ID           string    `gorm:"primaryKey;type:varchar(100)" json:"id"`
    EventID      string    `gorm:"unique;type:varchar(100)" json:"eventId"`
    EventType    string    `gorm:"type:varchar(100)" json:"eventType"`
    ResourceType string    `gorm:"type:varchar(100)" json:"resourceType"`
    ResourceID   string    `gorm:"type:varchar(100)" json:"resourceId"`
    Status       string    `gorm:"type:varchar(50);default:'processed'" json:"status"`
    RawData      string    `gorm:"type:text" json:"rawData"`
    ProcessedAt  time.Time `gorm:"type:datetime;default:current_timestamp" json:"processedAt"`
    CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
