package services

import (
	"errors"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

func Login(email, password string) (string, *models.User, error) {
	var user models.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return "", nil, errors.New("Email atau password salah!")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("Email atau password salah!")
	}

	tokenString, err := GenerateJWT(user.Email, user.Name, user.Role)
	if err != nil {
		return "", nil, err
	}

	return tokenString, &user, nil
}

// GenerateJWT creates a signed JWT token for the user session
func GenerateJWT(email, name, role string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Email: email,
		Name:  name,
		Role:  role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(config.AppConfig.JWTSecret)
}

func GetProfile(email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func Register(name, email, password string) error {
	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
		return errors.New("Email ini sudah terdaftar!")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create user (always Wisatawan)
	newUser := models.User{
		Email:    email,
		Name:     name,
		Password: string(hashedPassword),
		Role:     "Wisatawan",
	}

	return database.DB.Create(&newUser).Error
}
