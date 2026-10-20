package services

import (
	"fmt"
	"strings"
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

// GetReviewsByActivity mengambil ulasan publik untuk suatu aktivitas (hanya ulasan VISIBLE).
func GetReviewsByActivity(activityID string) ([]models.Review, error) {
	var reviews []models.Review
	err := database.DB.Where("activity_id = ? AND (status IS NULL OR status = '' OR status = 'VISIBLE')", activityID).
		Order("created_at desc").
		Find(&reviews).Error
	return reviews, err
}

// GetAllReviews mengambil semua ulasan (termasuk yang HIDDEN) untuk kebutuhan moderasi pengelola.
func GetAllReviews() ([]models.Review, error) {
	var reviews []models.Review
	err := database.DB.Order("created_at desc").Find(&reviews).Error
	for i := range reviews {
		if reviews[i].Status == "" {
			reviews[i].Status = "VISIBLE"
		}
	}
	return reviews, err
}

// CreateReview menyimpan ulasan baru dengan auto-filtering kata kasar (profanity detection).
func CreateReview(activityID, author, text string, rating int) (*models.Review, error) {
	initialStatus := "VISIBLE"
	isProfane, word := CheckProfanity(text)
	if isProfane {
		initialStatus = "HIDDEN"
		LogAdminAction("SYSTEM_MODERATOR", "AUTO_FLAGGED_REVIEW", fmt.Sprintf("Author: %s, Word: %s", author, word), "127.0.0.1")
	}

	review := models.Review{
		ActivityID: activityID,
		Author:     author,
		Rating:     rating,
		Text:       text,
		Date:       time.Now().Format("2006-01-02"),
		Status:     initialStatus,
	}

	if err := database.DB.Create(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

// UpdateReviewStatus mengubah status moderasi ulasan (VISIBLE / HIDDEN).
func UpdateReviewStatus(id string, status string) (*models.Review, error) {
	var review models.Review
	if err := database.DB.First(&review, id).Error; err != nil {
		return nil, err
	}

	upperStatus := strings.ToUpper(strings.TrimSpace(status))
	if upperStatus != "VISIBLE" && upperStatus != "HIDDEN" {
		return nil, fmt.Errorf("status tidak valid (hanya 'VISIBLE' atau 'HIDDEN')")
	}

	review.Status = upperStatus
	if err := database.DB.Save(&review).Error; err != nil {
		return nil, err
	}

	return &review, nil
}

// DeleteReview menghapus ulasan dari database (soft-delete / hard-delete GORM).
func DeleteReview(id string) error {
	var review models.Review
	if err := database.DB.First(&review, id).Error; err != nil {
		return err // Not found
	}
	return database.DB.Delete(&review).Error
}
