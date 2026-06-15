package config

import "os"

type Config struct {
	DBDriver         string
	DBSource         string
	JWTSecret        []byte
	Port             string
	GroqAPIKey       string
	GroqModel        string
	ComposioAPIKey   string
	OpenRouterAPIKey string
}

var AppConfig Config

func InitConfig() {
	AppConfig = Config{
		DBDriver:         getEnv("DB_DRIVER", "mysql"),
		DBSource:         getEnv("DB_SOURCE", "root:@tcp(127.0.0.1:3306)/bukit_kasih?charset=utf8mb4&parseTime=True&loc=Local"),
		JWTSecret:        []byte(getEnv("JWT_SECRET", "bukit-kasih-super-secret-key-12345")),
		Port:             getEnv("PORT", "8080"),
		GroqAPIKey:       getEnv("GROQ_API_KEY", "YOUR_GROQ_API_KEY"),
		GroqModel:        getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
		ComposioAPIKey:   getEnv("COMPOSIO_API_KEY", "YOUR_COMPOSIO_API_KEY"),
		OpenRouterAPIKey: getEnv("OPENROUTER_API_KEY", "YOUR_OPENROUTER_API_KEY"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
