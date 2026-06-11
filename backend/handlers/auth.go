package handlers

import (
	"net/http"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

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

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	// Generate JWT Token (Expires in 24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Email: user.Email,
		Name:  user.Name,
		Role:  user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(config.AppConfig.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"email": user.Email,
			"name":  user.Name,
			"role":  user.Role,
		},
	}	)
}

// GetProfile returns the details of the currently authenticated user
func GetProfile(c *gin.Context) {
	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak ditemukan"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", userEmail).First(&user).Error; err != nil {
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

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email ini sudah terdaftar!"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password"})
		return
	}

	// Create user (always Wisatawan)
	newUser := models.User{
		Email:    input.Email,
		Name:     input.Name,
		Password: string(hashedPassword),
		Role:     "Wisatawan",
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan akun baru"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Akun berhasil didaftarkan! Silakan masuk."})
}
