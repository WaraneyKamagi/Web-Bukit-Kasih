package routes

import (
	"net/http"

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

		// Auth routes
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/register", handlers.Register)
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

		// Chatbot route
		api.POST("/chat", middleware.AuthMiddleware(), handlers.Chatbot)
	}

	return r
}
