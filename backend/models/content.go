package models

import (
	"gorm.io/gorm"
)

type Activity struct {
	gorm.Model
	ActivityID  string `gorm:"uniqueIndex;not null" json:"id"` // e.g. "act1"
	Title       string `gorm:"not null" json:"title"`
	Location    string `json:"location"`
	Description string `gorm:"type:text" json:"description"`
	ImageURL    string `gorm:"type:text" json:"image"`
	Categories  string `json:"categories"` // comma separated for simplicity in SQLite/Postgres
	Hours       string `json:"hours"`
	Meta        string `json:"meta"`
	IsFav       bool   `json:"isFav"`
	Difficulty  string `json:"difficulty"`
	Tips        string `gorm:"type:text" json:"tips"`
}

type Destination struct {
	gorm.Model
	Title             string `gorm:"not null" json:"title"`
	ImageURL          string `gorm:"type:text" json:"image"`
	AltText           string `json:"altText"`
	DetailsTitle      string `json:"detailsTitle"`
	DetailsText       string `gorm:"type:text" json:"detailsText"`
	DetailsTips       string `gorm:"type:text" json:"detailsTips"`
	DetailsHours      string `json:"detailsHours"`
	DetailsDifficulty string `json:"detailsDifficulty"`
}
