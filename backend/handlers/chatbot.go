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

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type GroqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type GroqRequest struct {
	Model    string        `json:"model"`
	Messages []GroqMessage `json:"messages"`
}

type GroqChoice struct {
	Message GroqMessage `json:"message"`
}

type GroqResponse struct {
	Choices []GroqChoice `json:"choices"`
	Error   *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

const KnowledgeBase = `
KNOWLEDGE BASE BUKIT KASIH KANONANG:

1. Destinasi & Landmark Utama:
- Gerbang Utama: Pintu masuk utama kawasan wisata religi Bukit Kasih di Desa Kanonang, Kecamatan Kawangkoan, Kabupaten Minahasa, Sulawesi Utara. Harga tiket masuk simulasi adalah Rp 10.000 per orang.
- Terapi Air Panas: Kolam air belerang alami hangat untuk merendam kaki setelah lelah mendaki anak tangga. Bermanfaat merilekskan otot kaki dan menyembuhkan penyakit kulit.
- Tebing Relief Wajah: Pahatan relief batu wajah leluhur Minahasa, yaitu Toar dan Limimuut, di dinding tebing batu belerang yang megah.
- Monumen Salib Kasih: Salib putih raksasa setinggi 53 meter yang berdiri kokoh dan terlihat dari kejauhan sebagai simbol cinta kasih.
- Puncak Lima Rumah Ibadah: Simbol utama toleransi antarumat beragama di Sulawesi Utara. Terdiri dari lima rumah ibadah (Masjid, Gereja Katolik, Gereja Protestan, Vihara, dan Pura) yang dibangun berdampingan secara damai di puncak bukit.

2. Sejarah & Konsep Toleransi:
- Didirikan pada tahun 2002 atas prakarsa Drs. Adolf Jouke Sondakh (Gubernur Sulawesi Utara saat itu) sebagai simbol kerukunan, perdamaian, dan toleransi antarumat beragama.
- Nama 'Bukit Kasih' melambangkan tempat di mana orang-orang dari berbagai latar belakang agama dapat berkumpul, berdoa, bermeditasi, dan hidup berdampingan secara damai.

3. Informasi Pendakian & Rute (TrailMap):
- Wisatawan harus menaiki total 2.400 anak tangga (sering disebut tangga seribu) untuk mengelilingi seluruh jalur pendakian hingga ke puncak.
- Jalur memiliki tingkat kesulitan sedang-tinggi. Wisatawan disarankan istirahat di shelter/pos yang disediakan jika merasa lelah.
- Estimasi waktu mendaki penuh: 45 menit hingga 1,5 jam tergantung kondisi fisik.
- Tips: Gunakan sepatu olahraga yang nyaman, bawa air minum, dan berhati-hati saat hujan karena anak tangga batu bisa licin.

4. Fasilitas & Layanan Tambahan:
- Kolam air panas belerang alami (untuk terapi kaki).
- Toilet umum di dekat pintu masuk dan shelter peristirahatan di sepanjang rute tangga.
- Warung kuliner lokal menyajikan kuliner khas Minahasa (pisang goreng dengan sambal roa, kelapa muda segar, mie cakalang, kopi jahe).
- Jasa sewa pakaian adat Minahasa dan jasa fotografer lokal cetak kilat untuk dokumentasi.
- Jam Operasional: Buka setiap hari 24 jam. Waktu terbaik berkunjung adalah pagi (06:00-09:00) atau sore hari (15:00-17:30) agar tidak terlalu terik.
`

const SystemPrompt = `Anda adalah Kawan Kasih, AI Chatbot Asisten Informasi resmi untuk tempat wisata religi dan alam Bukit Kasih Kanonang di Minahasa, Sulawesi Utara.
Tugas Anda adalah melayani wisatawan dengan ramah, komunikatif, dan membantu mereka mendapatkan informasi yang akurat seputar Bukit Kasih.

ATURAN DAN BATASAN KETAT:
1. Jawab pertanyaan HANYA berdasarkan data fakta yang tertulis di bagian KNOWLEDGE BASE di bawah ini.
2. JANGAN PERNAH membuat-buat informasi baru, berhalusinasi, atau berspekulasi di luar KNOWLEDGE BASE (misalnya mengarang harga tiket baru, menambah pos fiktif, dll).
3. Jika wisatawan menanyakan hal di luar pariwisata Bukit Kasih Kanonang atau tidak tercantum dalam KNOWLEDGE BASE (seperti topik politik, resep masakan, pemrograman, sejarah tempat lain, atau rekomendasi hotel luar daerah), Anda HARUS menjawab dengan sopan: "Maaf, saya tidak dapat menjawab pertanyaan tersebut karena tugas saya hanya memberikan informasi seputar Bukit Kasih Kanonang berdasarkan data resmi yang tersedia."
4. Selalu gunakan Bahasa Indonesia yang sopan dan bersahabat.`

// Chatbot handles requests from logged-in tourists for information about Bukit Kasih
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

	apiKey := config.AppConfig.GroqAPIKey
	model := config.AppConfig.GroqModel
	if model == "" {
		model = "llama-3.3-70b-versatile"
	}

	// If API Key is empty or placeholder, fallback to the simulator
	if apiKey == "" || strings.Contains(apiKey, "YOUR_") || apiKey == "gsk_placeholder" {
		responseMsg := runChatbotSimulator(userMsg)
		c.JSON(http.StatusOK, gin.H{"reply": responseMsg, "source": "simulated"})
		return
	}

	// Prepare payload for Groq (OpenAI-compatible)
	groqReq := GroqRequest{
		Model: model,
		Messages: []GroqMessage{
			{
				Role:    "system",
				Content: fmt.Sprintf("%s\n\n%s", SystemPrompt, KnowledgeBase),
			},
			{
				Role:    "user",
				Content: userMsg,
			},
		},
	}

	payloadBytes, err := json.Marshal(groqReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses payload pesan"})
		return
	}

	// Call Groq API
	client := &http.Client{Timeout: 15 * time.Second}
	httpReq, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat koneksi ke server AI"})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(httpReq)
	if err != nil {
		// Fallback to simulator on network failure
		responseMsg := runChatbotSimulator(userMsg)
		c.JSON(http.StatusOK, gin.H{"reply": responseMsg, "source": "simulated_fallback"})
		return
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca balasan dari server AI"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		// If API returns an error, fallback to simulator
		var groqErr GroqResponse
		json.Unmarshal(bodyBytes, &groqErr)
		errMsg := "Terjadi kesalahan pada server AI"
		if groqErr.Error != nil {
			errMsg = groqErr.Error.Message
		}
		fmt.Printf("Groq API error (Status %d): %s\n", resp.StatusCode, errMsg)
		
		responseMsg := runChatbotSimulator(userMsg)
		c.JSON(http.StatusOK, gin.H{"reply": responseMsg, "source": "simulated_fallback"})
		return
	}

	var groqResp GroqResponse
	if err := json.Unmarshal(bodyBytes, &groqResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses respon JSON AI"})
		return
	}

	if len(groqResp.Choices) == 0 {
		responseMsg := runChatbotSimulator(userMsg)
		c.JSON(http.StatusOK, gin.H{"reply": responseMsg, "source": "simulated_fallback"})
		return
	}

	replyText := groqResp.Choices[0].Message.Content
	c.JSON(http.StatusOK, gin.H{"reply": replyText, "source": "groq_api"})
}

// runChatbotSimulator is a keyword-matching fallback router that strictly follows our knowledge base constraints
func runChatbotSimulator(message string) string {
	msgLower := strings.ToLower(message)

	// Check if greeting
	if msgLower == "halo" || msgLower == "hi" || msgLower == "hello" || msgLower == "p" || strings.Contains(msgLower, "selamat") {
		return "Halo! Saya Kawan Kasih, asisten informasi pariwisata Bukit Kasih Kanonang. Ada yang bisa saya bantu terkait destinasi, rute pendakian, sejarah, atau fasilitas di sini?"
	}

	// 1. Landmark & Destinations
	if strings.Contains(msgLower, "tiket") || strings.Contains(msgLower, "harga") || strings.Contains(msgLower, "masuk") || strings.Contains(msgLower, "bayar") {
		return "Harga tiket masuk simulasi kawasan wisata religi Bukit Kasih Kanonang adalah Rp 10.000 per orang. Pembelian dilakukan di pintu masuk Gerbang Utama."
	}
	if strings.Contains(msgLower, "terapi") || strings.Contains(msgLower, "air panas") || strings.Contains(msgLower, "belerang") || strings.Contains(msgLower, "rendam") {
		return "Di Bukit Kasih terdapat kolam Terapi Air Panas belerang alami hangat. Sangat cocok untuk merendam kaki setelah lelah mendaki anak tangga. Berkhasiat merilekskan otot kaki dan baik untuk kesehatan kulit."
	}
	if strings.Contains(msgLower, "relief") || strings.Contains(msgLower, "wajah") || strings.Contains(msgLower, "leluhur") || strings.Contains(msgLower, "toar") || strings.Contains(msgLower, "limimuut") {
		return "Destinasi Tebing Relief menampilkan pahatan wajah leluhur Minahasa, yaitu Toar dan Limimuut, pada dinding tebing batu belerang yang megah dan tinggi."
	}
	if strings.Contains(msgLower, "salib") || strings.Contains(msgLower, "monumen salib") {
		return "Monumen Salib Kasih adalah salib putih raksasa setinggi 53 meter yang berdiri kokoh di kawasan Bukit Kasih sebagai simbol cinta kasih dan perdamaian."
	}
	if strings.Contains(msgLower, "rumah ibadah") || strings.Contains(msgLower, "masjid") || strings.Contains(msgLower, "gereja") || strings.Contains(msgLower, "vihara") || strings.Contains(msgLower, "pura") || strings.Contains(msgLower, "toleransi") || strings.Contains(msgLower, "ibadah") {
		return "Puncak Bukit Kasih memiliki Landmark 'Puncak Lima Rumah Ibadah' yang terdiri dari Masjid, Gereja Katolik, Gereja Protestan, Vihara, dan Pura yang dibangun berdampingan. Tempat ini merupakan simbol kerukunan umat beragama yang damai di Sulawesi Utara."
	}

	// 2. Sejarah
	if strings.Contains(msgLower, "sejarah") || strings.Contains(msgLower, "kapan") || strings.Contains(msgLower, "didirikan") || strings.Contains(msgLower, "siapa") || strings.Contains(msgLower, "mendirikan") || strings.Contains(msgLower, "pencetus") {
		return "Bukit Kasih didirikan pada tahun 2002 atas prakarsa Drs. Adolf Jouke Sondakh yang menjabat sebagai Gubernur Sulawesi Utara saat itu. Tempat ini dibangun sebagai wujud simbol kerukunan, perdamaian, dan toleransi antar umat beragama."
	}

	// 3. Pendakian & Rute
	if strings.Contains(msgLower, "tangga") || strings.Contains(msgLower, "anak tangga") || strings.Contains(msgLower, "mendaki") || strings.Contains(msgLower, "rute") || strings.Contains(msgLower, "pos") || strings.Contains(msgLower, "berapa menit") || strings.Contains(msgLower, "lama") {
		return "Untuk mendaki hingga ke puncak, Anda harus meniti total 2.400 anak tangga (tangga seribu). Pendakian memakan waktu sekitar 45 menit hingga 1,5 jam tergantung kondisi fisik Anda. Sangat disarankan memakai sepatu olahraga yang nyaman, membawa air minum, dan berhati-hati karena tangga bisa licin saat hujan."
	}

	// 4. Fasilitas & Operasional
	if strings.Contains(msgLower, "fasilitas") || strings.Contains(msgLower, " toilet") || strings.Contains(msgLower, "shelter") || strings.Contains(msgLower, "istirahat") {
		return "Fasilitas di Bukit Kasih meliputi toilet umum (di dekat gerbang masuk dan beberapa pos), shelter peristirahatan di sepanjang rute tangga seribu, kolam terapi air panas belerang, warung makan, sewa pakaian adat, serta fotografer cetak kilat."
	}
	if strings.Contains(msgLower, "makan") || strings.Contains(msgLower, "warung") || strings.Contains(msgLower, "kuliner") || strings.Contains(msgLower, "pisang") || strings.Contains(msgLower, "kelapa") || strings.Contains(msgLower, "kopi") {
		return "Di kawasan Bukit Kasih terdapat deretan warung kuliner lokal yang menyajikan pisang goreng hangat dengan cocolan sambal roa khas Minahasa, kelapa muda segar, mie cakalang, kopi jahe, dan berbagai teh hangat."
	}
	if strings.Contains(msgLower, "pakaian") || strings.Contains(msgLower, "baju adat") || strings.Contains(msgLower, "foto") || strings.Contains(msgLower, "dokumentasi") {
		return "Pengunjung dapat menyewa pakaian adat Minahasa untuk berfoto di landmark Bukit Kasih. Tersedia juga jasa fotografer lokal yang melayani cetak kilat di tempat."
	}
	if strings.Contains(msgLower, "jam") || strings.Contains(msgLower, "buka") || strings.Contains(msgLower, "operasional") || strings.Contains(msgLower, "kapan terbaik") {
		return "Kawasan Bukit Kasih buka setiap hari selama 24 jam. Waktu berkunjung terbaik disarankan pada pagi hari (06:00 - 09:00) atau sore hari (15:00 - 17:30) agar cuaca tidak terlalu terik dan Anda bisa mendaki dengan nyaman."
	}

	// Default Constraint Response (Out of Context)
	return "Maaf, saya tidak dapat menjawab pertanyaan tersebut karena tugas saya hanya memberikan informasi seputar Bukit Kasih Kanonang berdasarkan data resmi yang tersedia."
}
