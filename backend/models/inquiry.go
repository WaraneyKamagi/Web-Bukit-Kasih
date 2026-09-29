package models

import (
	"time"

	"gorm.io/gorm"
)

type Inquiry struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `gorm:"not null;index" json:"email"`
	Message   string         `gorm:"not null" json:"message"`
	Status    string         `gorm:"default:'Menunggu Balasan';index" json:"status"` // "Menunggu Balasan" or "Dijawab"
	Reply     *string        `json:"reply"` // Using pointer string to support null in database
	Date      string         `gorm:"not null" json:"date"`
}
