package handlers

import (
	"net/http"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/gin-gonic/gin"
)

// GetActiveAnnouncement retrieves the currently active announcement
func GetActiveAnnouncement(c *gin.Context) {
	var announcement models.Announcement
	// Find the latest active announcement
	err := database.DB.Where("is_active = ?", true).Order("updated_at desc").First(&announcement).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"announcement": nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"announcement": announcement.Text,
	})
}

// UpdateAnnouncement creates or updates the active announcement
func UpdateAnnouncement(c *gin.Context) {
	var input struct {
		Text string `json:"text"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Deactivate all previous active announcements
	database.DB.Model(&models.Announcement{}).Where("is_active = ?", true).Update("is_active", false)

	// Create new active announcement if text is not empty
	if input.Text != "" {
		announcement := models.Announcement{
			Text:     input.Text,
			IsActive: true,
		}
		if err := database.DB.Create(&announcement).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create announcement"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Announcement updated successfully",
		"announcement": input.Text,
	})
}
