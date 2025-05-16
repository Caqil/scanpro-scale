// internal/api/middleware/rate_limiter.go
package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"

	"megapdf-api/internal/utils/response"
)

// RateLimiter is a simple rate limiting middleware
type RateLimiter struct {
	mu           sync.Mutex
	ipLimits     map[string]int       // Requests per IP
	ipTimestamp  map[string]time.Time // Last request timestamp per IP
	keyLimits    map[string]int       // Requests per API key
	keyTimestamp map[string]time.Time // Last request timestamp per API key
	ipWindow     time.Duration        // Time window for IP limits
	keyWindow    time.Duration        // Time window for API key limits
	ipMaxReqs    int                  // Max requests per IP per window
	keyMaxReqs   int                  // Max requests per API key per window
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(ipMax, keyMax int, ipWindowSeconds, keyWindowSeconds int) *RateLimiter {
	return &RateLimiter{
		ipLimits:     make(map[string]int),
		ipTimestamp:  make(map[string]time.Time),
		keyLimits:    make(map[string]int),
		keyTimestamp: make(map[string]time.Time),
		ipWindow:     time.Duration(ipWindowSeconds) * time.Second,
		keyWindow:    time.Duration(keyWindowSeconds) * time.Second,
		ipMaxReqs:    ipMax,
		keyMaxReqs:   keyMax,
	}
}

// Middleware returns a Gin middleware function
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get client IP
		clientIP := c.ClientIP()

		// Get API key if present
		apiKey := c.GetHeader("x-api-key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		rl.mu.Lock()
		defer rl.mu.Unlock()

		now := time.Now()

		// Check IP rate limit
		lastIPTime, ipExists := rl.ipTimestamp[clientIP]
		if ipExists {
			// If window has passed, reset counter
			if now.Sub(lastIPTime) > rl.ipWindow {
				rl.ipLimits[clientIP] = 1
				rl.ipTimestamp[clientIP] = now
			} else {
				// Increment counter
				rl.ipLimits[clientIP]++

				// If limit exceeded, return error
				if rl.ipLimits[clientIP] > rl.ipMaxReqs {
					response.Error(c, http.StatusTooManyRequests, "Rate limit exceeded")
					c.Abort()
					return
				}
			}
		} else {
			// First request from this IP
			rl.ipLimits[clientIP] = 1
			rl.ipTimestamp[clientIP] = now
		}

		// If API key is present, also check API key rate limit
		if apiKey != "" {
			lastKeyTime, keyExists := rl.keyTimestamp[apiKey]
			if keyExists {
				// If window has passed, reset counter
				if now.Sub(lastKeyTime) > rl.keyWindow {
					rl.keyLimits[apiKey] = 1
					rl.keyTimestamp[apiKey] = now
				} else {
					// Increment counter
					rl.keyLimits[apiKey]++

					// If limit exceeded, return error
					if rl.keyLimits[apiKey] > rl.keyMaxReqs {
						response.Error(c, http.StatusTooManyRequests, "API key rate limit exceeded")
						c.Abort()
						return
					}
				}
			} else {
				// First request with this API key
				rl.keyLimits[apiKey] = 1
				rl.keyTimestamp[apiKey] = now
			}
		}

		// Clean up old entries periodically
		if now.Second()%10 == 0 {
			go rl.cleanup()
		}

		c.Next()
	}
}

// Cleanup removes expired entries from the maps
func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	// Clean up IP entries
	for ip, timestamp := range rl.ipTimestamp {
		if now.Sub(timestamp) > rl.ipWindow {
			delete(rl.ipLimits, ip)
			delete(rl.ipTimestamp, ip)
		}
	}

	// Clean up API key entries
	for key, timestamp := range rl.keyTimestamp {
		if now.Sub(timestamp) > rl.keyWindow {
			delete(rl.keyLimits, key)
			delete(rl.keyTimestamp, key)
		}
	}

	log.Debug().
		Int("ipEntries", len(rl.ipLimits)).
		Int("keyEntries", len(rl.keyLimits)).
		Msg("Rate limiter cleanup performed")
}
