package handlers

import (
	"net/http"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// GetReviewsByActivity retrieves all reviews for a specific activity
func GetReviewsByActivity(c *gin.Context) {
	activityID := c.Param("activityId")

	reviews, err := services.GetReviewsByActivity(activityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// GetAllReviews retrieves all reviews in the database (for admin moderation)
func GetAllReviews(c *gin.Context) {
	reviews, err := services.GetAllReviews()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// CreateReview saves a new review
func CreateReview(c *gin.Context) {
	var input struct {
		ActivityID string `json:"activityId" binding:"required"`
		Author     string `json:"author" binding:"required"`
		Rating     int    `json:"rating" binding:"required,min=1,max=5"`
		Text       string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review, err := services.CreateReview(input.ActivityID, input.Author, input.Text, input.Rating)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// DeleteReview deletes a review (moderation)
func DeleteReview(c *gin.Context) {
	id := c.Param("id")

	err := services.DeleteReview(id)
	if err != nil {
		// Depending on error type, might be NotFound or InternalServer
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}
