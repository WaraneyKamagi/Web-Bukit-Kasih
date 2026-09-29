package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBDriver            string
	DBSource            string
	JWTSecret           []byte
	Port                string
	GroqAPIKey          string
	GroqModel           string
	TelegramBotToken    string
	TelegramAdminChatID string
}

var AppConfig Config

func InitConfig() {
	// Load .env file if available (ignore error as it might not exist in production if using system env vars)
	_ = godotenv.Load()

	dbSource := getEnv("DB_SOURCE", "")
	if dbSource == "" {
		log.Fatal("Kritis: Variabel DB_SOURCE belum diatur di file .env")
	}

	jwtSecret := getEnv("JWT_SECRET", "")
	if jwtSecret == "" {
		log.Fatal("Kritis: Variabel JWT_SECRET belum diatur di file .env")
	}

	groqAPIKey := getEnv("GROQ_API_KEY", "")
	if groqAPIKey == "" {
		log.Fatal("Kritis: Variabel GROQ_API_KEY belum diatur di file .env")
	}

	telegramBotToken := getEnv("TELEGRAM_BOT_TOKEN", "")
	if telegramBotToken == "" {
		log.Fatal("Kritis: Variabel TELEGRAM_BOT_TOKEN belum diatur di file .env")
	}

	AppConfig = Config{
		DBDriver:            getEnv("DB_DRIVER", "postgres"),
		DBSource:            dbSource,
		JWTSecret:           []byte(jwtSecret),
		Port:                getEnv("PORT", "8080"),
		GroqAPIKey:          groqAPIKey,
		GroqModel:           getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
		TelegramBotToken:    telegramBotToken,
		TelegramAdminChatID: getEnv("TELEGRAM_ADMIN_CHAT_ID", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
