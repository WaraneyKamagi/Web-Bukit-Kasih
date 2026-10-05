package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CSRFProtection validates custom request headers on state-changing requests (POST, PUT, DELETE, PATCH).
// Based on OWASP CSRF Prevention Cheat Sheet (Custom Request Headers technique):
// Browsers restrict cross-origin requests from setting custom headers without explicit CORS preflight permission.
func CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		// Safe HTTP methods do not alter state
		if method == http.MethodGet || method == http.MethodHead || method == http.MethodOptions {
			c.Next()
			return
		}

		// Webhooks with external secret signatures are exempt
		if c.Request.URL.Path == "/api/v1/hermes/telegram-webhook" {
			c.Next()
			return
		}

		// If authenticated via Authorization header, CSRF is inherently mitigated because browsers
		// cannot automatically attach custom Authorization headers in cross-origin form submissions.
		if authHeader := c.GetHeader("Authorization"); authHeader != "" {
			c.Next()
			return
		}

		// If request is authenticated via Cookie or mutates state, verify custom CSRF headers
		customHeader := c.GetHeader("X-Requested-With")
		csrfToken := c.GetHeader("X-CSRF-Token")

		// If cookie "token" exists and neither custom header is present, block request
		if _, err := c.Cookie("token"); err == nil {
			if customHeader == "" && csrfToken == "" {
				c.JSON(http.StatusForbidden, gin.H{
					"error": "Validasi keamanan CSRF gagal: Header keamanan X-Requested-With atau X-CSRF-Token tidak ditemukan",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
