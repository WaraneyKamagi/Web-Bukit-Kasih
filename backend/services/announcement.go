package services

import (
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

// GetActiveAnnouncement retrieves the latest active announcement
func GetActiveAnnouncement() (*models.Announcement, error) {
	var announcement models.Announcement
	err := database.DB.Where("is_active = ?", true).Order("updated_at desc").First(&announcement).Error
	if err != nil {
		return nil, err
	}
	return &announcement, nil
}

// UpdateAnnouncement deactivates previous ones and creates a new one
func UpdateAnnouncement(text string) (*models.Announcement, error) {
	// Deactivate all previous active announcements
	database.DB.Model(&models.Announcement{}).Where("is_active = ?", true).Update("is_active", false)

	if text == "" {
		return nil, nil // Or return a specific struct/nil if empty string means clearing
	}

	announcement := models.Announcement{
		Text:     text,
		IsActive: true,
	}
	
	if err := database.DB.Create(&announcement).Error; err != nil {
		return nil, err
	}

	return &announcement, nil
}
