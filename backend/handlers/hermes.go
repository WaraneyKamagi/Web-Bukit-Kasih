package handlers

import (
	"net/http"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// GetHermesMessages retrieves all chat messages in the shared Hermes session
func GetHermesMessages(c *gin.Context) {
	messages, err := services.GetHermesMessages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Hermes messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

// SendHermesMessage sends a message from the Web console to the Telegram session
func SendHermesMessage(c *gin.Context) {
	var input struct {
		Text string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Teks pesan tidak boleh kosong"})
		return
	}

	msg, err := services.SendHermesMessage(input.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesan ke database"})
		return
	}

	c.JSON(http.StatusOK, msg)
}

// TestHermesTelegramConnection sends a verification ping to Telegram
func TestHermesTelegramConnection(c *gin.Context) {
	chatID, err := services.TestHermesTelegramConnection()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Koneksi Telegram Hermes berhasil terverifikasi!",
		"chatId":  chatID,
	})
}

// ClearHermesMessages deletes all chat messages from the shared session table
func ClearHermesMessages(c *gin.Context) {
	if err := services.ClearHermesMessages(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear messages"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Hermes chat history cleared successfully"})
}

// TelegramWebhook handles webhook updates if configured
func TelegramWebhook(c *gin.Context) {
	var update services.TelegramUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ignored"})
		return
	}

	services.ProcessTelegramUpdateWebhook(update)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
