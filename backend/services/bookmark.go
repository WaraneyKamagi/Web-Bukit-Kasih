package services

import (
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

// BookmarkStat represents the aggregated result for the dashboard
type BookmarkStat struct {
	Name    string `json:"name"`
	Count   int    `json:"count"`
	Percent int    `json:"percent"`
	Color   string `json:"color"`
}

// ToggleBookmark toggles a bookmark state
func ToggleBookmark(userEmail, activityID, title string) (string, error) {
	var existingBookmark models.Bookmark
	result := database.DB.Where("email = ? AND activity_id = ?", userEmail, activityID).First(&existingBookmark)

	if result.RowsAffected > 0 {
		// It exists, so we remove it
		if err := database.DB.Delete(&existingBookmark).Error; err != nil {
			return "", err
		}
		return "removed", nil
	}
	
	// It doesn't exist, create it
	newBookmark := models.Bookmark{
		Email:      userEmail,
		ActivityID: activityID,
		Title:      title,
	}
	if err := database.DB.Create(&newBookmark).Error; err != nil {
		return "", err
	}
	return "added", nil
}

// GetBookmarkStats returns aggregated statistics
func GetBookmarkStats() ([]BookmarkStat, error) {
	type Result struct {
		Title string
		Count int
	}

	var results []Result
	err := database.DB.Model(&models.Bookmark{}).
		Select("title, count(*) as count").
		Group("title").
		Order("count desc").
		Limit(4).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	colors := []string{"bg-primary", "bg-emerald-500", "bg-amber-500", "bg-purple-500"}

	maxCount := 1
	if len(results) > 0 && results[0].Count > 0 {
		maxCount = results[0].Count
	}

	var stats []BookmarkStat
	for i, r := range results {
		percent := (r.Count * 100) / maxCount
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

	return stats, nil
}

// GetUserBookmarks retrieves an array of activity IDs
func GetUserBookmarks(email string) ([]string, error) {
	var bookmarks []models.Bookmark
	err := database.DB.Where("email = ?", email).Find(&bookmarks).Error
	if err != nil {
		return nil, err
	}

	var activityIDs []string
	for _, b := range bookmarks {
		activityIDs = append(activityIDs, b.ActivityID)
	}
	
	if activityIDs == nil {
		activityIDs = []string{}
	}

	return activityIDs, nil
}
