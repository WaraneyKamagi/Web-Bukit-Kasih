package models

import "gorm.io/gorm"

type Review struct {
	gorm.Model
	ActivityID string `gorm:"not null;index" json:"activityId"`
	Author     string `gorm:"not null" json:"author"`
	Rating     int    `gorm:"not null" json:"rating"`
	Text       string `gorm:"not null" json:"text"`
	Date       string `gorm:"not null" json:"date"`
}
