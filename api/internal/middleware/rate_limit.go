
package middleware

import (
    "github.com/gin-gonic/gin"
    "golang.org/x/time/rate"
    "net/http"
    "sync"
)

// RateLimiter manages rate limiting per IP
type RateLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.Mutex
}

func NewRateLimiter() *RateLimiter {
    return &RateLimiter{
        limiters: make(map[string]*rate.Limiter),
        mu:       sync.Mutex{},
    }
}

func (rl *RateLimiter) getLimiter(ip string) *rate.Limiter {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    limiter, exists := rl.limiters[ip]
    if !exists {
        limiter = rate.NewLimiter(1, 5) // 1 request per second, burst of 5
        rl.limiters[ip] = limiter
    }
    return limiter
}

// RateLimitMiddleware applies rate limiting
func RateLimitMiddleware() gin.HandlerFunc {
    rl := NewRateLimiter()
    return func(c *gin.Context) {
        limiter := rl.getLimiter(c.ClientIP())
        if !limiter.Allow() {
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }
        c.Next()
    }
}
