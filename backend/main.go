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

	// Start server on port 8080
	log.Println("Server started on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
