package handlers

import (
	"fmt"
	"net/http"
	"strings"

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
		Author     string `json:"author"`
		Rating     int    `json:"rating" binding:"required,min=1,max=5"`
		Text       string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data ulasan tidak valid. Pastikan rating (1-5) dan teks ulasan telah diisi."})
		return
	}

	// Security: If user is authenticated via JWT, lock author to verified userName
	authorName := strings.TrimSpace(input.Author)
	if jwtName, exists := c.Get("userName"); exists {
		if nameStr, ok := jwtName.(string); ok && strings.TrimSpace(nameStr) != "" {
			authorName = strings.TrimSpace(nameStr)
		}
	}

	if authorName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama penulis (author) tidak boleh kosong"})
		return
	}

	review, err := services.CreateReview(input.ActivityID, authorName, input.Text, input.Rating)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ulasan ke database"})
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

	adminEmail, _ := c.Get("userEmail")
	services.LogAdminAction(fmt.Sprintf("%v", adminEmail), "DELETE_REVIEW", "ReviewID: "+id, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}
