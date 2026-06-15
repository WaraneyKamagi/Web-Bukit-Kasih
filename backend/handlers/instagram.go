package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

	"github.com/gin-gonic/gin"
)

type InstagramRequest struct {
	Type     string `json:"type" binding:"required"`      // "announcement", "review", or "custom"
	ID       uint   `json:"id"`                           // ID of the announcement or review (if applicable)
	Prompt   string `json:"prompt"`                       // Custom instructions (optional)
	Caption  string `json:"caption"`                      // The approved caption (sent during publish)
	ImageURL string `json:"imageUrl"`                     // Optional image URL for posting
	Action   string `json:"action" binding:"required"`    // "generate" or "publish"
}

type OpenRouterMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenRouterRequest struct {
	Model    string              `json:"model"`
	Messages []OpenRouterMessage `json:"messages"`
}

type OpenRouterResponse struct {
	Choices []struct {
		Message OpenRouterMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// Default public image URL for Bukit Kasih when none is provided
const DefaultBukitKasihImage = "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=1200&q=80"

// PublishToInstagram handles AI caption generation and Composio Instagram posting
func PublishToInstagram(c *gin.Context) {
	// Double check admin role (extra safety layer)
	role, exists := c.Get("userRole")
	if !exists || role != "Pengelola" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Hanya pengelola yang dapat mempublikasikan ke Instagram"})
		return
	}

	var req InstagramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input tidak valid"})
		return
	}

	openRouterKey := config.AppConfig.OpenRouterAPIKey
	composioKey := config.AppConfig.ComposioAPIKey

	// Check if keys are missing or contain placeholders -> Use Simulator
	isSimulated := openRouterKey == "" || strings.Contains(openRouterKey, "YOUR_") || openRouterKey == "your_openrouter_api_key" ||
		composioKey == "" || strings.Contains(composioKey, "YOUR_") || composioKey == "your_composio_api_key"

	if req.Action == "generate" {
		var contentToProcess string

		// Fetch content based on Type
		switch req.Type {
		case "announcement":
			var announcement models.Announcement
			var err error
			if req.ID > 0 {
				err = database.DB.First(&announcement, req.ID).Error
			} else {
				// Fallback to the latest active announcement
				err = database.DB.Where("is_active = ?", true).Order("updated_at desc").First(&announcement).Error
			}

			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Pengumuman tidak ditemukan"})
				return
			}
			contentToProcess = fmt.Sprintf("PENGUMUMAN PENTING: %s", announcement.Text)

		case "review":
			var review models.Review
			if err := database.DB.First(&review, req.ID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Ulasan tidak ditemukan"})
				return
			}
			contentToProcess = fmt.Sprintf("Ulasan dari %s (Rating: %d/5): %s", review.Author, review.Rating, review.Text)

		case "custom":
			contentToProcess = req.Prompt
			if strings.TrimSpace(contentToProcess) == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Prompt kustom tidak boleh kosong"})
				return
			}

		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe konten tidak dikenal"})
			return
		}

		// Handle generation simulation
		if isSimulated {
			generatedCaption := runCaptionSimulator(req.Type, contentToProcess, req.Prompt)
			c.JSON(http.StatusOK, gin.H{
				"caption": generatedCaption,
				"source":  "simulated",
			})
			return
		}

		// Generate caption using OpenRouter (Step 3.7 Flash:Free)
		generatedCaption, err := generateCaptionWithOpenRouter(openRouterKey, contentToProcess, req.Prompt)
		if err != nil {
			// Fallback to simulator on API failure
			fmt.Printf("OpenRouter API failure: %v. Falling back to simulator.\n", err)
			generatedCaption = runCaptionSimulator(req.Type, contentToProcess, req.Prompt)
			c.JSON(http.StatusOK, gin.H{
				"caption": generatedCaption,
				"source":  "simulated_fallback",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"caption": generatedCaption,
			"source":  "openrouter_api",
		})
		return

	} else if req.Action == "publish" {
		if strings.TrimSpace(req.Caption) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Caption tidak boleh kosong untuk dipublikasikan"})
			return
		}

		imageURL := req.ImageURL
		if strings.TrimSpace(imageURL) == "" {
			imageURL = DefaultBukitKasihImage
		}

		// Handle publish simulation
		if isSimulated {
			time.Sleep(1500 * time.Millisecond) // Simulate network delay
			c.JSON(http.StatusOK, gin.H{
				"message": "Postingan simulasi berhasil dipublikasikan ke Instagram!",
				"source":  "simulated",
				"post": gin.H{
					"caption":   req.Caption,
					"image_url": imageURL,
				},
			})
			return
		}

		// Publish post via Composio REST API
		err := publishToInstagramViaComposio(composioKey, req.Caption, imageURL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal memposting ke Instagram via Composio: %v", err)})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Konten berhasil dipublikasikan ke feed Instagram Anda!",
			"source":  "composio_api",
		})
		return

	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Aksi tidak dikenal"})
		return
	}
}

// generateCaptionWithOpenRouter calls the OpenRouter API with stepfun/step-3.7-flash:free model
func generateCaptionWithOpenRouter(apiKey, content, customInstructions string) (string, error) {
	systemPrompt := "Anda adalah Hermes, AI Agent Humas & Asisten Copywriter resmi untuk wisata religi Bukit Kasih Kanonang, Minahasa, Sulawesi Utara.\n" +
		"Tugas Anda adalah menulis caption Instagram yang menarik, ramah, interaktif, dan persuasif berdasarkan konten yang diberikan.\n" +
		"Gunakan Bahasa Indonesia yang sopan dan bersahabat. Selalu tambahkan emoji yang relevan dan hashtag seperti #BukitKasih #Kanonang #ReligiMinahasa #WonderfulIndonesia.\n" +
		"Jika ada instruksi tambahan kustom dari admin, harap patuhi instruksi tersebut."

	userPrompt := fmt.Sprintf("Konten Asli:\n%s\n\nInstruksi Tambahan Admin: %s\n\nBuatlah caption Instagram terbaik:", content, customInstructions)

	payload := OpenRouterRequest{
		Model: "stepfun/step-3.7-flash:free",
		Messages: []OpenRouterMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("HTTP-Referer", "http://localhost:8080")
	req.Header.Set("X-Title", "Bukit Kasih Admin Agent")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		var openRouterErr OpenRouterResponse
		json.Unmarshal(bodyBytes, &openRouterErr)
		errMsg := "Terjadi kesalahan di server OpenRouter"
		if openRouterErr.Error != nil {
			errMsg = openRouterErr.Error.Message
		}
		return "", fmt.Errorf("openrouter status %d: %s", resp.StatusCode, errMsg)
	}

	var openRouterResp OpenRouterResponse
	if err := json.Unmarshal(bodyBytes, &openRouterResp); err != nil {
		return "", err
	}

	if len(openRouterResp.Choices) == 0 {
		return "", fmt.Errorf("tidak ada pilihan jawaban dari server OpenRouter")
	}

	return strings.TrimSpace(openRouterResp.Choices[0].Message.Content), nil
}

// publishToInstagramViaComposio triggers Composio's execute action REST API
func publishToInstagramViaComposio(apiKey, caption, imageURL string) error {
	// Step 1: Create Media Container
	containerPayload := map[string]interface{}{
		"action": "INSTAGRAM_CREATE_MEDIA_CONTAINER",
		"parameters": map[string]interface{}{
			"image_url": imageURL,
			"caption":   caption,
		},
	}

	containerBytes, err := json.Marshal(containerPayload)
	if err != nil {
		return err
	}

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("POST", "https://backend.composio.dev/api/v3/actions/execute", bytes.NewBuffer(containerBytes))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	containerBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("composio create container status %d: %s", resp.StatusCode, string(containerBody))
	}

	var containerResult struct {
		Success    bool                   `json:"success"`
		Data       map[string]interface{} `json:"data"`
		Error      string                 `json:"error"`
	}

	if err := json.Unmarshal(containerBody, &containerResult); err != nil {
		return err
	}

	if !containerResult.Success || containerResult.Error != "" {
		return fmt.Errorf("composio create container error: %s", containerResult.Error)
	}

	// Retrieve Creation ID from the result parameters
	// The response structure typically contains parameters returned by the tool execution
	var creationID string
	if idVal, exists := containerResult.Data["id"]; exists {
		creationID = fmt.Sprintf("%v", idVal)
	} else if idVal, exists := containerResult.Data["creation_id"]; exists {
		creationID = fmt.Sprintf("%v", idVal)
	} else {
		// Fallback to parsing container result parameters if nested
		return fmt.Errorf("tidak berhasil mendapatkan Creation ID dari Composio. Respon: %s", string(containerBody))
	}

	// Step 2: Publish prepared Media Container
	publishPayload := map[string]interface{}{
		"action": "INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH",
		"parameters": map[string]interface{}{
			"creation_id": creationID,
		},
	}

	publishBytes, err := json.Marshal(publishPayload)
	if err != nil {
		return err
	}

	reqPublish, err := http.NewRequest("POST", "https://backend.composio.dev/api/v3/actions/execute", bytes.NewBuffer(publishBytes))
	if err != nil {
		return err
	}

	reqPublish.Header.Set("Content-Type", "application/json")
	reqPublish.Header.Set("x-api-key", apiKey)

	respPublish, err := client.Do(reqPublish)
	if err != nil {
		return err
	}
	defer respPublish.Body.Close()

	publishBody, err := io.ReadAll(respPublish.Body)
	if err != nil {
		return err
	}

	if respPublish.StatusCode != http.StatusOK {
		return fmt.Errorf("composio publish status %d: %s", respPublish.StatusCode, string(publishBody))
	}

	var publishResult struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
	}

	if err := json.Unmarshal(publishBody, &publishResult); err != nil {
		return err
	}

	if !publishResult.Success || publishResult.Error != "" {
		return fmt.Errorf("composio publish error: %s", publishResult.Error)
	}

	return nil
}

// runCaptionSimulator is the fallback generator mimicking Hermes Agent's output style
func runCaptionSimulator(contentType, content, customPrompt string) string {
	var sb strings.Builder

	if contentType == "announcement" {
		sb.WriteString("📢 PENGUMUMAN PENTING BUKIT KASIH KANONANG 📢\n\n")
		sb.WriteString("Halo Kawan Kasih! Kami ingin menyampaikan informasi penting terkait kenyamanan kunjungan Anda:\n\n")
		// Clean prefix if any
		cleanContent := strings.TrimPrefix(content, "PENGUMUMAN PENTING: ")
		sb.WriteString(fmt.Sprintf("👉 \"%s\"\n\n", cleanContent))
		sb.WriteString("Mari kita bersama-sama menjaga ketertiban, kebersihan, serta nilai toleransi beragama di kawasan Bukit Kasih. Tetap berhati-hati dalam perjalanan ya! 🏔️✨\n\n")
	} else if contentType == "review" {
		sb.WriteString("✨ APA KATA MEREKA TENTANG BUKIT KASIH? ✨\n\n")
		sb.WriteString("Senang sekali rasanya melihat wisatawan pulang dengan kenangan indah. Berikut testimoni jujur dari salah satu pengunjung setia kami:\n\n")
		sb.WriteString(fmt.Sprintf("💬 %s\n\n", content))
		sb.WriteString("Ingin merasakan sendiri sejuknya udara pegunungan dan indahnya toleransi beragama di Puncak Bukit Kasih? Yuk, rencanakan liburan akhir pekan Anda bersama keluarga sekarang! 🌅⛪🕌🛕\n\n")
	} else {
		sb.WriteString("✨ KABAR TERBARU DARI BUKIT KASIH KANONANG ✨\n\n")
		sb.WriteString(content)
		sb.WriteString("\n\nMari berkunjung dan temukan kedamaian di Bukit Kasih Minahasa! 🌄💚\n\n")
	}

	if customPrompt != "" {
		sb.WriteString(fmt.Sprintf("(Catatan AI Agent: Caption disesuaikan dengan fokus \"%s\")\n\n", customPrompt))
	}

	sb.WriteString("#BukitKasih #Kanonang #Minahasa #Toleransi #WonderfulIndonesia #SulawesiUtara #ReligiMinahasa #AIAgentHermes")

	return sb.String()
}
