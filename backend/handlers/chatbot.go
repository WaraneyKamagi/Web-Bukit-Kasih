package handlers

import (
	"log"
	"net/http"
	"strings"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

// Chatbot handles requests from logged-in tourists for information about Bukit Kasih using RAG
func Chatbot(c *gin.Context) {
	// Verify user role
	role, exists := c.Get("userRole")
	if !exists || role != "Wisatawan" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Chatbot ini hanya tersedia untuk wisatawan"})
		return
	}

	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input pesan tidak valid"})
		return
	}

	userMsg := strings.TrimSpace(req.Message)
	if userMsg == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesan tidak boleh kosong"})
		return
	}

	reply, source, citations, err := services.ProcessChat(userMsg)
	if err != nil {
		log.Printf("[CHATBOT ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses pesan chatbot. Silakan coba beberapa saat lagi."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reply":     reply,
		"source":    source,
		"citations": citations,
	})
}
