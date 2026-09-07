package models

import "time"

type HermesMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Sender    string    `gorm:"not null" json:"sender"`       // "admin" or "hermes"
	Source    string    `gorm:"not null" json:"source"`       // "web" or "telegram"
	Text      string    `gorm:"type:text" json:"text"`        // text content / caption draft
	MediaURL  string    `gorm:"type:text" json:"mediaUrl"`    // image / media url
	Status    string    `gorm:"default:'sent'" json:"status"` // "sent", "draft", "approved", "published"
	CreatedAt time.Time `json:"createdAt"`
}
