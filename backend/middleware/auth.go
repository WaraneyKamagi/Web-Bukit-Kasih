package middleware

import (
	"net/http"
	"strings"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/services"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the JWT token in Authorization header or HttpOnly cookie (Hybrid approach)
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Format header Authorization tidak valid"})
				c.Abort()
				return
			}
		}

		// Fallback to HttpOnly cookie if header is not present (transparent dual-token)
		if tokenString == "" {
			if cookieToken, err := c.Cookie("token"); err == nil && cookieToken != "" {
				tokenString = cookieToken
			}
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token otorisasi diperlukan"})
			c.Abort()
			return
		}

		claims := &services.Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return config.AppConfig.JWTSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau telah kedaluwarsa"})
			c.Abort()
			return
		}

		// Save user details in Gin context
		c.Set("userEmail", claims.Email)
		c.Set("userName", claims.Name)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

// AdminOnly restricts access to admin (Pengelola) role only
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != "Pengelola" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Hanya pengelola yang diizinkan"})
			c.Abort()
			return
		}
		c.Next()
	}
}
