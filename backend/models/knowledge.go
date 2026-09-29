package models

import (
	"time"

	"gorm.io/gorm"
)

// KnowledgeDocument represents a chunk or article in the RAG knowledge base
type KnowledgeDocument struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Title     string         `gorm:"not null;index" json:"title"`
	Category  string         `gorm:"not null;index" json:"category"` // "destinasi", "sejarah", "fasilitas", "kuliner", "rute", "tips"
	Content   string         `gorm:"type:text;not null" json:"content"`
	Keywords  string         `gorm:"type:text;index" json:"keywords"`
}
