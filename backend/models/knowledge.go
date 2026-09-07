package models

import "gorm.io/gorm"

// KnowledgeDocument represents a chunk or article in the RAG knowledge base
type KnowledgeDocument struct {
	gorm.Model
	Title    string `gorm:"not null;index" json:"title"`
	Category string `gorm:"not null;index" json:"category"` // "destinasi", "sejarah", "fasilitas", "kuliner", "rute", "tips"
	Content  string `gorm:"type:text;not null" json:"content"`
	Keywords string `gorm:"type:text;index" json:"keywords"`
}
