package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientRecord struct {
	count     int
	lastReset time.Time
}

var (
	clients   = make(map[string]*clientRecord)
	rateMutex sync.Mutex
)

// RateLimiter creates an in-memory IP-based rate limiter
// maxRequests: maximum allowed requests per window
// window: time duration for the rate limit window
func RateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rateMutex.Lock()
		defer rateMutex.Unlock()

		now := time.Now()
		record, exists := clients[ip]

		if !exists || now.Sub(record.lastReset) > window {
			clients[ip] = &clientRecord{
				count:     1,
				lastReset: now,
			}
			c.Next()
			return
		}

		if record.count >= maxRequests {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Terlalu banyak permintaan. Silakan coba beberapa saat lagi.",
			})
			c.Abort()
			return
		}

		record.count++
		c.Next()
	}
}

// ResetRateLimiter resets rate limiter storage (useful for unit/integration tests)
func ResetRateLimiter() {
	rateMutex.Lock()
	defer rateMutex.Unlock()
	clients = make(map[string]*clientRecord)
}
