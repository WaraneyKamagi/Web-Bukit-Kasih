package handlers

import (
	"net/http"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

type ToggleBookmarkRequest struct {
	ActivityID string `json:"activityId" binding:"required"`
	Title      string `json:"title"`
}

// ToggleBookmark adds or removes a bookmark for the current user
func ToggleBookmark(c *gin.Context) {
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userEmail := email.(string)

	var req ToggleBookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	if req.Title == "" {
		req.Title = "Aktivitas Wisata"
	}

	status, err := services.ToggleBookmark(userEmail, req.ActivityID, req.Title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan bookmark"})
		return
	}

	if status == "removed" {
		c.JSON(http.StatusOK, gin.H{"status": "removed", "message": "Bookmark dihapus"})
	} else {
		c.JSON(http.StatusOK, gin.H{"status": "added", "message": "Bookmark ditambahkan"})
	}
}

// GetBookmarkStats returns aggregated bookmark statistics for the admin dashboard
func GetBookmarkStats(c *gin.Context) {
	stats, err := services.GetBookmarkStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil statistik"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetUserBookmarks returns all bookmarked activity IDs for the current user
func GetUserBookmarks(c *gin.Context) {
	email, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userEmail := email.(string)

	activityIDs, err := services.GetUserBookmarks(userEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil bookmark"})
		return
	}

	c.JSON(http.StatusOK, activityIDs)
}
