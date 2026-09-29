package handlers

import (
	"net/http"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// GetActiveAnnouncement retrieves the currently active announcement
func GetActiveAnnouncement(c *gin.Context) {
	announcement, err := services.GetActiveAnnouncement()
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

	_, err := services.UpdateAnnouncement(input.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create announcement"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Announcement updated successfully",
		"announcement": input.Text,
	})
}
