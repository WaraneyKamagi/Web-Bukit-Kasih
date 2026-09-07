package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/gin-gonic/gin"
)

// LastTelegramUpdateID tracks the last processed Telegram update
var lastTelegramUpdateID int64 = 0

// GetHermesMessages retrieves all chat messages in the shared Hermes session
func GetHermesMessages(c *gin.Context) {
	// Sync incoming updates from Telegram before returning
	syncIncomingTelegramUpdates()

	var messages []models.HermesMessage
	if err := database.DB.Order("created_at asc").Find(&messages).Error; err != nil {
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

	// 1. Save user message to database
	msg := models.HermesMessage{
		Sender:    "admin",
		Source:    "web",
		Text:      input.Text,
		Status:    "sent",
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pesan ke database"})
		return
	}

	// 2. Forward message to Telegram chat via Telegram Bot API
	go forwardToTelegram(input.Text)

	c.JSON(http.StatusOK, msg)
}

// TestHermesTelegramConnection sends a verification ping to Telegram
func TestHermesTelegramConnection(c *gin.Context) {
	botToken := config.AppConfig.TelegramBotToken
	chatID := config.AppConfig.TelegramAdminChatID

	if botToken == "" || chatID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Telegram Bot Token atau Chat ID belum dikonfigurasi"})
		return
	}

	testText := "🤖 [Bukit Kasih Web Bridge] Halo Admin! Koneksi Hermes AI Studio Web & Telegram berhasil terhubung dan tersinkronisasi."
	err := sendTelegramTextMessage(botToken, chatID, testText)
	if err != nil {
		log.Printf("❌ Gagal menghubungi Telegram: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghubungi server Telegram. Pastikan bot token dan chat ID valid."})
		return
	}

	// Save test message to shared history
	testMsg := models.HermesMessage{
		Sender:    "hermes",
		Source:    "telegram",
		Text:      testText,
		Status:    "sent",
		CreatedAt: time.Now(),
	}
	database.DB.Create(&testMsg)

	c.JSON(http.StatusOK, gin.H{
		"message": "Koneksi Telegram Hermes berhasil terverifikasi!",
		"chatId":  chatID,
	})
}

// ClearHermesMessages deletes all chat messages from the shared session table
func ClearHermesMessages(c *gin.Context) {
	if err := database.DB.Exec("DELETE FROM hermes_messages").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear messages"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Hermes chat history cleared successfully"})
}

// TelegramWebhook handles webhook updates if configured
func TelegramWebhook(c *gin.Context) {
	var update TelegramUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ignored"})
		return
	}

	processTelegramUpdate(update)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// Helper: Sends text message using Telegram Bot API
func sendTelegramTextMessage(token, chatID, text string) error {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

func forwardToTelegram(text string) {
	token := config.AppConfig.TelegramBotToken
	chatID := config.AppConfig.TelegramAdminChatID
	if token == "" || chatID == "" {
		return
	}

	err := sendTelegramTextMessage(token, chatID, text)
	if err != nil {
		log.Printf("⚠️ Gagal meneruskan pesan ke Telegram: %v", err)
	}
}

// Structs for Telegram Bot API GetUpdates
type TelegramUpdate struct {
	UpdateID int64 `json:"update_id"`
	Message  *struct {
		MessageID int64 `json:"message_id"`
		From      struct {
			ID        int64  `json:"id"`
			IsBot     bool   `json:"is_bot"`
			FirstName string `json:"first_name"`
			Username  string `json:"username"`
		} `json:"from"`
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text  string `json:"text"`
		Photo []struct {
			FileID string `json:"file_id"`
		} `json:"photo"`
		Date int64 `json:"date"`
	} `json:"message"`
}

type TelegramGetUpdatesResponse struct {
	Ok     bool             `json:"ok"`
	Result []TelegramUpdate `json:"result"`
}

func syncIncomingTelegramUpdates() {
	token := config.AppConfig.TelegramBotToken
	if token == "" {
		return
	}

	offset := lastTelegramUpdateID + 1
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&limit=20&timeout=0", token, offset)

	client := http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(apiURL)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	var getUpdatesResp TelegramGetUpdatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&getUpdatesResp); err != nil || !getUpdatesResp.Ok {
		return
	}

	for _, u := range getUpdatesResp.Result {
		if u.UpdateID > lastTelegramUpdateID {
			lastTelegramUpdateID = u.UpdateID
		}
		processTelegramUpdate(u)
	}
}

func processTelegramUpdate(u TelegramUpdate) {
	if u.Message == nil || u.Message.Text == "" {
		return
	}

	// Check if this message was sent from admin chat ID
	adminChatIDStr := config.AppConfig.TelegramAdminChatID
	adminChatID, _ := strconv.ParseInt(adminChatIDStr, 10, 64)

	if adminChatID != 0 && u.Message.Chat.ID != adminChatID {
		return // Ignore other chats
	}

	sender := "admin"
	if u.Message.From.IsBot {
		sender = "hermes"
	}

	// Prevent duplicate saving
	var count int64
	database.DB.Model(&models.HermesMessage{}).
		Where("text = ? AND sender = ?", u.Message.Text, sender).
		Count(&count)

	if count == 0 {
		msg := models.HermesMessage{
			Sender:    sender,
			Source:    "telegram",
			Text:      u.Message.Text,
			Status:    "sent",
			CreatedAt: time.Unix(u.Message.Date, 0),
		}
		database.DB.Create(&msg)
	}
}
