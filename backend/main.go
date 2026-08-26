package main

import (
	"log"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Config
	config.InitConfig()

	// Initialize Database
	database.InitDB()

	// Set Gin to release mode in production, default to debug mode
	gin.SetMode(gin.DebugMode)

	r := routes.SetupRouter()

	port := config.AppConfig.Port
	if port == "" {
		port = "8080"
	}

	// Start server
	log.Printf("Server started on http://localhost:%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
