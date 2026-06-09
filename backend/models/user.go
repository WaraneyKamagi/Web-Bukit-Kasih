package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Name     string `gorm:"not null" json:"name"`
	Password string `gorm:"not null" json:"-"` // Hide password in JSON responses
	Role     string `gorm:"not null" json:"role"` // "Wisatawan" or "Pengelola"
}
