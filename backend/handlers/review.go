package handlers

import (
	"net/http"
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/gin-gonic/gin"
)

// GetReviewsByActivity retrieves all reviews for a specific activity
func GetReviewsByActivity(c *gin.Context) {
	activityID := c.Param("activityId")

	var reviews []models.Review
	if err := database.DB.Where("activity_id = ?", activityID).Order("created_at desc").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// GetAllReviews retrieves all reviews in the database (for admin moderation)
func GetAllReviews(c *gin.Context) {
	var reviews []models.Review
	if err := database.DB.Order("created_at desc").Find(&reviews).Error; err != nil {
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

	review := models.Review{
		ActivityID: input.ActivityID,
		Author:     input.Author,
		Rating:     input.Rating,
		Text:       input.Text,
		Date:       time.Now().Format("2006-01-02"),
	}

	if err := database.DB.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

// DeleteReview deletes a review (moderation)
func DeleteReview(c *gin.Context) {
	id := c.Param("id")

	var review models.Review
	if err := database.DB.First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if err := database.DB.Delete(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}
