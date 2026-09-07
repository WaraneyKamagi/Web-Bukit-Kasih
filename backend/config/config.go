package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBDriver             string
	DBSource             string
	JWTSecret            []byte
	Port                 string
	GroqAPIKey           string
	GroqModel            string
	ComposioAPIKey       string
	OpenRouterAPIKey     string
	TelegramBotToken     string
	TelegramAdminChatID string
}

var AppConfig Config

func InitConfig() {
	// Load .env file if available
	_ = godotenv.Load()

	AppConfig = Config{
		DBDriver:             getEnv("DB_DRIVER", "postgres"),
		DBSource:             getEnv("DB_SOURCE", "postgresql://postgres.dskntyudaqxqextacdls:[YOUR_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"),
		JWTSecret:            []byte(getEnv("JWT_SECRET", "bukit-kasih-super-secret-key-12345")),
		Port:                 getEnv("PORT", "8080"),
		GroqAPIKey:           getEnv("GROQ_API_KEY", "YOUR_GROQ_API_KEY"),
		GroqModel:            getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
		ComposioAPIKey:       getEnv("COMPOSIO_API_KEY", "YOUR_COMPOSIO_API_KEY"),
		OpenRouterAPIKey:     getEnv("OPENROUTER_API_KEY", "YOUR_OPENROUTER_API_KEY"),
		TelegramBotToken:     getEnv("TELEGRAM_BOT_TOKEN", "8640822059:AAHMxGufIc33Im4Y9FnH2iygGHEZWEncA-M"),
		TelegramAdminChatID: getEnv("TELEGRAM_ADMIN_CHAT_ID", "8638663050"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

