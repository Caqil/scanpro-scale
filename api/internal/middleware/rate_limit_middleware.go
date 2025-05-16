
// internal/middleware/rate_limit_middleware.go
package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// Simple in-memory rate limiter
type RateLimiter struct {
	limiters map[string]*rate.Limiter
	mu       sync.Mutex
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
	}
}

// GetLimiter returns a rate limiter for the given IP
func (r *RateLimiter) GetLimiter(ip string) *rate.Limiter {
	r.mu.Lock()
	defer r.mu.Unlock()

	limiter, exists := r.limiters[ip]
	if !exists {
		// Create a new limiter for this IP:
		// 100 requests per minute with burst of 20
		limiter = rate.NewLimiter(rate.Limit(100/60), 20)
		r.limiters[ip] = limiter
	}

	return limiter
}

// Clean up old limiters periodically
func (r *RateLimiter) CleanupLimiters() {
	for {
		time.Sleep(time.Hour) // Run cleanup every hour
		r.mu.Lock()
		r.limiters = make(map[string]*rate.Limiter) // Reset all limiters
		r.mu.Unlock()
	}
}

// Create a single global rate limiter
var limiter = NewRateLimiter()

// Start the cleanup goroutine
func init() {
	go limiter.CleanupLimiters()
}

// RateLimitMiddleware limits the rate of requests by IP address
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get client IP
		ip := c.ClientIP()
		if ip == "" {
			ip = "unknown"
		}

		// Get limiter for this IP
		ipLimiter := limiter.GetLimiter(ip)

		// Try to allow request
		if !ipLimiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
