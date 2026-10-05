package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// HTTPSRedirectMiddleware redirects non-HTTPS requests to HTTPS in production environments
func HTTPSRedirectMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only enforce in production/release mode to avoid interfering with local development
		if os.Getenv("GIN_MODE") == "release" || os.Getenv("ENV") == "production" {
			// Check standard reverse proxy headers (Render, Heroku, Cloudflare, etc.)
			if proto := c.GetHeader("X-Forwarded-Proto"); proto == "http" {
				targetURL := "https://" + c.Request.Host + c.Request.RequestURI
				c.Redirect(http.StatusMovedPermanently, targetURL)
				c.Abort()
				return
			}
		}
		c.Next()
	}
}
