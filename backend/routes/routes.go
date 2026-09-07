package routes

import (
	"net/http"
	"time"

	"bukit-kasih-backend/handlers"
	"bukit-kasih-backend/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter initializes the Gin engine and configures all routing groups
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Apply CORS middleware globally
	r.Use(middleware.CORSMiddleware())

	// API Routes Group
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "Bukit Kasih Backend API is running successfully!",
			})
		})

		// Sensitive auth routes with rate limiting (10 requests per minute)
		authLimiter := middleware.RateLimiter(10, 1*time.Minute)
		api.POST("/auth/login", authLimiter, handlers.Login)
		api.POST("/auth/register", authLimiter, handlers.Register)
		api.GET("/auth/profile", middleware.AuthMiddleware(), handlers.GetProfile)

		// Announcement routes
		api.GET("/announcements/active", handlers.GetActiveAnnouncement)
		api.POST("/announcements", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.UpdateAnnouncement)

		// Review routes
		api.GET("/reviews", handlers.GetAllReviews)
		api.GET("/reviews/activity/:activityId", handlers.GetReviewsByActivity)
		api.POST("/reviews", handlers.CreateReview)
		api.DELETE("/reviews/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.DeleteReview)

		// Inquiry routes
		api.GET("/inquiries", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.GetInquiries)
		api.GET("/inquiries/user/:email", middleware.AuthMiddleware(), handlers.GetInquiriesByUser)
		api.POST("/inquiries", handlers.CreateInquiry)
		api.PUT("/inquiries/:id/reply", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.ReplyInquiry)

		// Chatbot route (RAG-enhanced)
		api.POST("/chat", middleware.AuthMiddleware(), handlers.Chatbot)

		// RAG Knowledge Base routes
		api.GET("/knowledge", handlers.GetAllKnowledgeDocuments)
		api.GET("/knowledge/:id", handlers.GetKnowledgeDocumentByID)
		api.POST("/knowledge", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.CreateKnowledgeDocument)
		api.PUT("/knowledge/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.UpdateKnowledgeDocument)
		api.DELETE("/knowledge/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.DeleteKnowledgeDocument)

		// Hermes AI Shared Session routes
		api.GET("/hermes/messages", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.GetHermesMessages)
		api.POST("/hermes/send", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.SendHermesMessage)
		api.DELETE("/hermes/messages", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.ClearHermesMessages)
		api.POST("/hermes/test-connection", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.TestHermesTelegramConnection)
		api.POST("/hermes/telegram-webhook", handlers.TelegramWebhook)
	}

	return r
}
