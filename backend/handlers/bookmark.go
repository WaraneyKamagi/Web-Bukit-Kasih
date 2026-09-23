package handlers

import (
	"net/http"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/gin-gonic/gin"
)

type ToggleBookmarkRequest struct {
	ActivityID string `json:"activityId" binding:"required"`
	Title      string `json:"title" binding:"required"`
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

	var existingBookmark models.Bookmark
	// Check if it exists
	result := database.DB.Where("email = ? AND activity_id = ?", userEmail, req.ActivityID).First(&existingBookmark)

	if result.RowsAffected > 0 {
		// It exists, so we remove it (toggle off)
		database.DB.Delete(&existingBookmark)
		c.JSON(http.StatusOK, gin.H{"status": "removed", "message": "Bookmark dihapus"})
	} else {
		// It doesn't exist, create it (toggle on)
		newBookmark := models.Bookmark{
			Email:      userEmail,
			ActivityID: req.ActivityID,
			Title:      req.Title,
		}
		database.DB.Create(&newBookmark)
		c.JSON(http.StatusOK, gin.H{"status": "added", "message": "Bookmark ditambahkan"})
	}
}

// BookmarkStat represents the aggregated result for the dashboard
type BookmarkStat struct {
	Name    string `json:"name"`
	Count   int    `json:"count"`
	Percent int    `json:"percent"`
	Color   string `json:"color"`
}

// GetBookmarkStats returns aggregated bookmark statistics for the admin dashboard
func GetBookmarkStats(c *gin.Context) {
	// Query to group by activity_id and title, order by count descending
	type Result struct {
		Title string
		Count int
	}

	var results []Result
	database.DB.Model(&models.Bookmark{}).
		Select("title, count(*) as count").
		Group("title").
		Order("count desc").
		Limit(4).
		Scan(&results)

	// Colors to match the original mock UI
	colors := []string{"bg-primary", "bg-emerald-500", "bg-amber-500", "bg-purple-500"}

	// Find the max count to calculate percentage relative to the most popular
	maxCount := 1
	if len(results) > 0 && results[0].Count > 0 {
		maxCount = results[0].Count
	}

	var stats []BookmarkStat
	for i, r := range results {
		percent := (r.Count * 100) / maxCount
		// Default base percentage just in case there's only 1 click so it doesn't look empty
		if r.Count > 0 && percent < 10 {
			percent = 10
		}
		
		color := "bg-primary"
		if i < len(colors) {
			color = colors[i]
		}

		stats = append(stats, BookmarkStat{
			Name:    r.Title,
			Count:   r.Count,
			Percent: percent,
			Color:   color,
		})
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

	var bookmarks []models.Bookmark
	database.DB.Where("email = ?", userEmail).Find(&bookmarks)

	// Return an array of activity IDs for easy frontend matching
	var activityIDs []string
	for _, b := range bookmarks {
		activityIDs = append(activityIDs, b.ActivityID)
	}

	if activityIDs == nil {
		activityIDs = []string{}
	}

	c.JSON(http.StatusOK, activityIDs)
}
