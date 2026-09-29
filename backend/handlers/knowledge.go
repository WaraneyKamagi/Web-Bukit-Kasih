package handlers

import (
	"net/http"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// GetAllKnowledgeDocuments retrieves all knowledge base articles (for management & search)
func GetAllKnowledgeDocuments(c *gin.Context) {
	category := c.Query("category")

	docs, err := services.GetAllKnowledgeDocuments(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil dokumen pengetahuan"})
		return
	}

	c.JSON(http.StatusOK, docs)
}

// GetKnowledgeDocumentByID retrieves a single knowledge article
func GetKnowledgeDocumentByID(c *gin.Context) {
	id := c.Param("id")

	doc, err := services.GetKnowledgeDocumentByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dokumen pengetahuan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, doc)
}

// CreateKnowledgeDocument allows Admin to add new articles to the RAG knowledge base
func CreateKnowledgeDocument(c *gin.Context) {
	var input struct {
		Title    string `json:"title" binding:"required"`
		Category string `json:"category" binding:"required"`
		Content  string `json:"content" binding:"required"`
		Keywords string `json:"keywords"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data artikel tidak valid"})
		return
	}

	doc, err := services.CreateKnowledgeDocument(input.Title, input.Category, input.Content, input.Keywords)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan dokumen pengetahuan baru"})
		return
	}

	c.JSON(http.StatusCreated, doc)
}

// UpdateKnowledgeDocument allows Admin to update an existing article in the RAG knowledge base
func UpdateKnowledgeDocument(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Title    string `json:"title" binding:"required"`
		Category string `json:"category" binding:"required"`
		Content  string `json:"content" binding:"required"`
		Keywords string `json:"keywords"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data artikel tidak valid"})
		return
	}

	doc, err := services.UpdateKnowledgeDocument(id, input.Title, input.Category, input.Content, input.Keywords)
	if err != nil {
		// Could be not found or save error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui dokumen pengetahuan"})
		return
	}

	c.JSON(http.StatusOK, doc)
}

// DeleteKnowledgeDocument allows Admin to delete an article from the RAG knowledge base
func DeleteKnowledgeDocument(c *gin.Context) {
	id := c.Param("id")

	if err := services.DeleteKnowledgeDocument(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus dokumen pengetahuan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dokumen pengetahuan berhasil dihapus"})
}
