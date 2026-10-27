package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"golang.org/x/crypto/bcrypt"
)

// GoogleTokenInfo represents the payload returned by Google tokeninfo API
type GoogleTokenInfo struct {
	Iss           string `json:"iss"`
	Sub           string `json:"sub"`
	Azp           string `json:"azp"`
	Aud           string `json:"aud"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Exp           string `json:"exp"`
	Error         string `json:"error_description"`
}

// VerifyGoogleToken validates an ID token against Google's tokeninfo API
func VerifyGoogleToken(idToken string) (*GoogleTokenInfo, error) {
	if strings.TrimSpace(idToken) == "" {
		return nil, errors.New("Token Google tidak boleh kosong")
	}

	expectedClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if expectedClientID == "" {
		expectedClientID = "726409863841-su32unr1cp0ocnrmfmm3mna07so5se03.apps.googleusercontent.com"
	}

	client := &http.Client{Timeout: 10 * time.Second}
	verifyURL := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	resp, err := client.Get(verifyURL)
	if err != nil {
		return nil, fmt.Errorf("Gagal menghubungi server verifikasi Google: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("Token Google tidak valid atau telah kedaluwarsa")
	}

	var tokenInfo GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&tokenInfo); err != nil {
		return nil, errors.New("Gagal membaca respons verifikasi Google")
	}

	// Verify Issuer
	if tokenInfo.Iss != "accounts.google.com" && tokenInfo.Iss != "https://accounts.google.com" {
		return nil, errors.New("Issuer token Google tidak sah")
	}

	// Verify Audience matches our Google Client ID
	if tokenInfo.Aud != expectedClientID {
		return nil, errors.New("Audience token Google tidak cocok dengan Client ID aplikasi")
	}

	// Verify Email is present and verified
	if tokenInfo.Email == "" {
		return nil, errors.New("Email tidak ditemukan pada akun Google")
	}
	if tokenInfo.EmailVerified != "true" {
		return nil, errors.New("Email Google Anda belum terverifikasi")
	}

	return &tokenInfo, nil
}

// GoogleLogin authenticates or automatically registers a user using Google OAuth
func GoogleLogin(idToken string) (string, *models.User, error) {
	tokenInfo, err := VerifyGoogleToken(idToken)
	if err != nil {
		return "", nil, err
	}

	var user models.User
	result := database.DB.Where("email = ?", tokenInfo.Email).First(&user)

	if result.Error != nil {
		// User does not exist, auto-register as Wisatawan
		displayName := tokenInfo.Name
		if displayName == "" {
			displayName = tokenInfo.Email
		}

		// Generate random secure password hash to satisfy GORM NOT NULL constraint
		randomSecret := fmt.Sprintf("oauth_google_%s_%d", tokenInfo.Sub, time.Now().UnixNano())
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomSecret), bcrypt.DefaultCost)
		if err != nil {
			return "", nil, errors.New("Gagal mengamankan kredensial akun baru")
		}

		user = models.User{
			Name:     displayName,
			Email:    tokenInfo.Email,
			Password: string(hashedPassword),
			Role:     "Wisatawan",
		}

		if err := database.DB.Create(&user).Error; err != nil {
			return "", nil, errors.New("Gagal mendaftarkan akun Google baru ke database")
		}
	}

	// Generate standard Bukit Kasih JWT token for session
	tokenString, err := GenerateJWT(user.Email, user.Name, user.Role)
	if err != nil {
		return "", nil, errors.New("Gagal menerbitkan token sesi pengguna")
	}

	return tokenString, &user, nil
}
