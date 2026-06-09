package models

import "gorm.io/gorm"

type Inquiry struct {
	gorm.Model
	Name    string  `gorm:"not null" json:"name"`
	Email   string  `gorm:"not null" json:"email"`
	Message string  `gorm:"not null" json:"message"`
	Status  string  `gorm:"default:'Menunggu Balasan'" json:"status"` // "Menunggu Balasan" or "Dijawab"
	Reply   *string `json:"reply"` // Using pointer string to support null in database
	Date    string  `gorm:"not null" json:"date"`
}
