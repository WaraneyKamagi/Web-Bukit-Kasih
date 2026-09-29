package services

import (
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

func GetAllKnowledgeDocuments(category string) ([]models.KnowledgeDocument, error) {
	var docs []models.KnowledgeDocument
	query := database.DB.Order("created_at desc")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	err := query.Find(&docs).Error
	return docs, err
}

func GetKnowledgeDocumentByID(id string) (*models.KnowledgeDocument, error) {
	var doc models.KnowledgeDocument
	err := database.DB.First(&doc, id).Error
	return &doc, err
}

func CreateKnowledgeDocument(title, category, content, keywords string) (*models.KnowledgeDocument, error) {
	doc := models.KnowledgeDocument{
		Title:    title,
		Category: category,
		Content:  content,
		Keywords: keywords,
	}

	err := database.DB.Create(&doc).Error
	return &doc, err
}

func UpdateKnowledgeDocument(id, title, category, content, keywords string) (*models.KnowledgeDocument, error) {
	var doc models.KnowledgeDocument
	if err := database.DB.First(&doc, id).Error; err != nil {
		return nil, err
	}

	doc.Title = title
	doc.Category = category
	doc.Content = content
	doc.Keywords = keywords

	err := database.DB.Save(&doc).Error
	return &doc, err
}

func DeleteKnowledgeDocument(id string) error {
	var doc models.KnowledgeDocument
	if err := database.DB.First(&doc, id).Error; err != nil {
		return err
	}

	return database.DB.Delete(&doc).Error
}
