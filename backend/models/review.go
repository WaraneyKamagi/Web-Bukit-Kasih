package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"-"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	ActivityID string         `gorm:"not null;index" json:"activityId"`
	Author     string         `gorm:"not null" json:"author"`
	Rating     int            `gorm:"not null" json:"rating"`
	Text       string         `gorm:"not null" json:"text"`
	Date       string         `gorm:"not null" json:"date"`
}
