package services

import (
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

func GetReviewsByActivity(activityID string) ([]models.Review, error) {
	var reviews []models.Review
	err := database.DB.Where("activity_id = ?", activityID).Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func GetAllReviews() ([]models.Review, error) {
	var reviews []models.Review
	err := database.DB.Order("created_at desc").Find(&reviews).Error
	return reviews, err
}

func CreateReview(activityID, author, text string, rating int) (*models.Review, error) {
	review := models.Review{
		ActivityID: activityID,
		Author:     author,
		Rating:     rating,
		Text:       text,
		Date:       time.Now().Format("2006-01-02"),
	}

	if err := database.DB.Create(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func DeleteReview(id string) error {
	var review models.Review
	if err := database.DB.First(&review, id).Error; err != nil {
		return err // Not found
	}
	return database.DB.Delete(&review).Error
}
