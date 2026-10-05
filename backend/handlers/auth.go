package handlers

import (
	"net/http"
	"os"
	"strings"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// Login authenticates credentials and returns a JWT token
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input format tidak valid"})
		return
	}

	tokenString, user, err := services.Login(input.Email, input.Password)
	if err != nil {
		services.LogAuthFailure(input.Email, c.ClientIP(), c.Request.UserAgent(), err.Error())
		if err.Error() == "Email atau password salah!" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		}
		return
	}

	services.LogAuthSuccess(user.Email, user.Role, c.ClientIP(), c.Request.UserAgent())

	// Set HttpOnly cookie for transparent dual-token session security (OWASP A2, A3, D2)
	isSecure := os.Getenv("GIN_MODE") == "release" || os.Getenv("ENV") == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", tokenString, 86400, "/", "", isSecure, true)

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"email": user.Email,
			"name":  user.Name,
			"role":  user.Role,
		},
	})
}

// GetProfile returns the details of the currently authenticated user
func GetProfile(c *gin.Context) {
	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak ditemukan"})
		return
	}

	user, err := services.GetProfile(userEmail.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"email": user.Email,
		"name":  user.Name,
		"role":  user.Role,
	})
}

// Register handles tourist registration
func Register(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input tidak valid (Password minimal 6 karakter)"})
		return
	}

	err := services.Register(input.Name, input.Email, input.Password)
	if err != nil {
		services.LogSecurityWarning("REGISTER_FAIL", c.ClientIP(), "Email: "+input.Email+" ("+err.Error()+")")
		if strings.Contains(err.Error(), "terdaftar") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan akun baru"})
		}
		return
	}

	services.LogAuthSuccess(input.Email, "Wisatawan", c.ClientIP(), "Registered New Account")

	c.JSON(http.StatusCreated, gin.H{"message": "Akun berhasil didaftarkan! Silakan masuk."})
}

// Logout clears the authentication cookie (OWASP A5)
func Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil logout"})
}
