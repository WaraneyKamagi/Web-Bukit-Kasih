package middleware

import "github.com/gin-gonic/gin"

// SecurityHeadersMiddleware attaches standard OWASP security headers to all HTTP responses
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent clickjacking by forbidding embedding inside iframes
		c.Writer.Header().Set("X-Frame-Options", "DENY")

		// Prevent MIME-sniffing
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")

		// Control amount of referrer information sent with requests
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Legacy XSS protection filter
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")

		// Cross-origin isolation header
		c.Writer.Header().Set("Cross-Origin-Opener-Policy", "same-origin")

		c.Next()
	}
}
