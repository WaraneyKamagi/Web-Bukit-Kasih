package models

import "time"

// Bookmark represents a tourist's saved/bookmarked activity.
// It maps the user's email to a specific activity ID.
type Bookmark struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Email      string    `gorm:"index;not null" json:"email"`
	ActivityID string    `gorm:"index;not null" json:"activityId"`
	Title      string    `gorm:"not null" json:"title"` // Storing title helps with easy dashboard analytics rendering
	CreatedAt  time.Time `json:"createdAt"`
}
