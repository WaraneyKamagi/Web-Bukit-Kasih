package models

import "gorm.io/gorm"

type Announcement struct {
	gorm.Model
	Text     string `gorm:"not null" json:"text"`
	IsActive bool   `gorm:"not null;index" json:"isActive"`
}
