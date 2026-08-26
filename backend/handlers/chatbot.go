package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
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

const SystemPrompt = `Anda adalah "Kawan Kasih", asisten pemandu wisata digital resmi untuk portal pariwisata religi dan alam Bukit Kasih Kanonang di Minahasa, Sulawesi Utara.

TUGAS UTAMA:
Membantu wisatawan menjawab pertanyaan seputar objek wisata Bukit Kasih Kanonang secara ramah, ringkas, jelas, dan akurat berdasarkan KONTEKS PENGETAHUAN RESMI yang disediakan di bawah ini.

PANDUAN PERCAKAPAN & GAYA BAHASA (SANGAT PENTING):
1. SAPAAN & PERKENALAN:
   - Jika pengguna hanya menyapa (seperti "Halo", "Hi", "Selamat pagi", "Hai"), jawablah dengan sapaan ramah dan tawarkan bantuan secara singkat (1-2 kalimat).
   - JANGAN PERNAH langsung merangkum atau menumpahkan seluruh informasi objek wisata jika pengguna hanya menyapa!
2. PROPORSI JAWABAN (CONCISENESS):
   - Jawablah HANYA apa yang secara spesifik ditanyakan pengguna. Gunakan gaya bahasa yang natural, hangat, dan mudah dipahami layaknya pemandu wisata profesional.
   - Hindari jawaban yang terlalu panjang atau bertele-tele jika pertanyaan pengguna sederhana.
3. KELUASAN & BAHASA:
   - Gunakan Bahasa Indonesia yang baik, sopan, dan bersahabat.
   - JANGAN PERNAH menyebutkan istilah teknis internal seperti "berdasarkan Knowledge Base", "data sistem", atau "sesuai instruksi". Bicaralah secara alami layaknya staf pemandu wisata sungguhan.
4. REGULASI BATASAN (GUARDRAILS):
   - Anda HANYA melayani informasi seputar Bukit Kasih Kanonang.
   - Jika pengguna menanyakan hal yang sama sekali di luar topik Bukit Kasih (seperti politik, coding/pemrograman, resep masakan daerah lain, tempat wisata di kota lain, rumus matematika, dll), tolaklah dengan sangat sopan dan arahkan kembali:
     "Maaf, saya hanya dapat memberikan informasi seputar objek wisata Bukit Kasih Kanonang. Ada yang bisa saya bantu terkait kunjungan atau fasilitas di sini?"

=== KONTEKS PENGETAHUAN RESMI BUKIT KASIH KANONANG ===
1. LOKASI & TIKET:
   - Lokasi: Desa Kanonang, Kecamatan Kawangkoan, Kabupaten Minahasa, Sulawesi Utara.
   - Tiket Masuk: Rp 10.000 per orang (pembelian di loket Gerbang Utama).
   - Jam Buka: Buka setiap hari 24 jam. Waktu terbaik berkunjung adalah pagi (06:00-09:00) atau sore hari (15:00-17:30) agar cuaca sejuk.

2. 5 POS LANDMARK UTAMA (JALUR PENDAKIAN 2.400 ANAK TANGGA):
   - Pos 1 (Gerbang Utama): Pintu masuk kawasan wisata dan loket tiket.
   - Pos 2 (Terapi Air Panas): Kolam rendam air belerang alami hangat untuk relaksasi otot kaki setelah mendaki dan bermanfaat untuk kesehatan kulit.
   - Pos 3 (Tebing Relief Wajah): Dinding tebing belerang dengan pahatan wajah leluhur Minahasa, yaitu Toar dan Limimuut.
   - Pos 4 (Monumen Salib Kasih): Salib putih megah setinggi 53 meter sebagai simbol cinta kasih dan perdamaian yang terlihat dari kejauhan.
   - Pos 5 (Puncak Lima Rumah Ibadah): Simbol utama toleransi beragama di Sulawesi Utara dengan 5 rumah ibadah (Masjid, Gereja Katolik, Gereja Protestan, Vihara, dan Pura) yang berdiri berdampingan secara damai di puncak bukit.

3. RUTE & TIPS PENDAKIAN:
   - Memiliki total 2.400 anak tangga (sering disebut tangga seribu) dengan estimasi waktu mendaki 45 menit hingga 1,5 jam.
   - Tips: Gunakan sepatu olahraga yang nyaman, bawa air minum, dan berhati-hati saat hujan karena anak tangga batu bisa licin. Tersedia shelter peristirahatan di sepanjang rute.

4. SEJARAH & NILAI TOLERANSI:
   - Didirikan pada tahun 2002 atas prakarsa Drs. Adolf Jouke Sondakh (Gubernur Sulawesi Utara saat itu).
   - 'Bukit Kasih' dibangun sebagai simbol persatuan, kerukunan, dan toleransi antarumat beragama di Tanah Minahasa.

5. FASILITAS & KULINER:
   - Fasilitas: Toilet umum, shelter/pos istirahat, sewa pakaian adat Minahasa untuk foto, dan jasa fotografer lokal cetak kilat.
   - Kuliner Lokal: Pisang goreng khas dengan sambal roa, kelapa muda segar, mie cakalang, kopi jahe, dan aneka minuman hangat.
===================================================`

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
				Content: SystemPrompt,
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
		_ = json.Unmarshal(bodyBytes, &groqErr)
		errMsg := "Terjadi kesalahan pada server AI"
		if groqErr.Error != nil {
			errMsg = groqErr.Error.Message
		}
		log.Printf("Groq API error (Status %d): %s\n", resp.StatusCode, errMsg)
		
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
	msgLower := strings.TrimSpace(strings.ToLower(message))

	// 1. Identitas Bot ("kamu siapa", "anda siapa", "siapa kamu", "nama kamu")
	if strings.Contains(msgLower, "anda siapa") || strings.Contains(msgLower, "kamu siapa") ||
		strings.Contains(msgLower, "siapa kamu") || strings.Contains(msgLower, "siapa anda") ||
		strings.Contains(msgLower, "siapa dirimu") || strings.Contains(msgLower, "nama kamu") ||
		strings.Contains(msgLower, "nama anda") || strings.Contains(msgLower, "kamu asisten apa") {
		return "Halo! Saya Kawan Kasih, asisten AI informasi resmi untuk tempat wisata religi dan alam Bukit Kasih Kanonang di Minahasa, Sulawesi Utara. Ada yang ingin Anda ketahui seputar destinasi, tiket, rute tangga seribu, atau sejarah di sini?"
	}

	// 2. Sapaan umum (Greeting)
	if msgLower == "halo" || msgLower == "hai" || msgLower == "hi" || msgLower == "hello" || msgLower == "p" ||
		strings.HasPrefix(msgLower, "halo") || strings.HasPrefix(msgLower, "hai") || strings.HasPrefix(msgLower, "hi ") ||
		strings.Contains(msgLower, "selamat pagi") || strings.Contains(msgLower, "selamat siang") ||
		strings.Contains(msgLower, "selamat sore") || strings.Contains(msgLower, "selamat malam") ||
		strings.Contains(msgLower, "apa kabar") {
		return "Halo! Saya Kawan Kasih. Ada yang bisa saya bantu terkait informasi wisata, rute pendakian 2.400 anak tangga, fasilitas, atau sejarah Bukit Kasih Kanonang?"
	}

	// 3. Tiket & Biaya Masuk
	if strings.Contains(msgLower, "tiket") || strings.Contains(msgLower, "harga") ||
		strings.Contains(msgLower, "biaya") || strings.Contains(msgLower, "tarif") ||
		strings.Contains(msgLower, "bayar") || strings.Contains(msgLower, "karcis") {
		return "Harga tiket masuk simulasi kawasan wisata religi Bukit Kasih Kanonang adalah Rp 10.000 per orang. Pembelian tiket dilakukan di pintu masuk Gerbang Utama."
	}

	// 4. Terapi Air Panas & Belerang
	if strings.Contains(msgLower, "terapi") || strings.Contains(msgLower, "air panas") ||
		strings.Contains(msgLower, "belerang") || strings.Contains(msgLower, "rendam") {
		return "Di Bukit Kasih terdapat kolam Terapi Air Panas belerang alami hangat. Sangat cocok untuk merendam kaki setelah lelah mendaki anak tangga. Berkhasiat merilekskan otot kaki dan baik untuk kesehatan kulit."
	}

	// 5. Tebing Relief Toar & Limimuut
	if strings.Contains(msgLower, "relief") || strings.Contains(msgLower, "toar") ||
		strings.Contains(msgLower, "limimuut") || strings.Contains(msgLower, "wajah leluhur") ||
		strings.Contains(msgLower, "tebing") {
		return "Destinasi Tebing Relief menampilkan pahatan wajah leluhur Minahasa, yaitu Toar dan Limimuut, pada dinding tebing batu belerang yang megah dan tinggi."
	}

	// 6. Monumen Salib Kasih
	if strings.Contains(msgLower, "salib") || strings.Contains(msgLower, "monumen") {
		return "Monumen Salib Kasih adalah salib putih raksasa setinggi 53 meter yang berdiri kokoh di kawasan Bukit Kasih sebagai simbol cinta kasih dan perdamaian."
	}

	// 7. Puncak Lima Rumah Ibadah & Toleransi
	if strings.Contains(msgLower, "rumah ibadah") || strings.Contains(msgLower, "masjid") ||
		strings.Contains(msgLower, "gereja") || strings.Contains(msgLower, "vihara") ||
		strings.Contains(msgLower, "pura") || strings.Contains(msgLower, "toleransi") ||
		strings.Contains(msgLower, "kerukunan") || strings.Contains(msgLower, "5 agama") ||
		strings.Contains(msgLower, "lima agama") {
		return "Puncak Bukit Kasih memiliki landmark 'Puncak Lima Rumah Ibadah' yang terdiri dari Masjid, Gereja Katolik, Gereja Protestan, Vihara, dan Pura yang dibangun berdampingan secara damai di puncak bukit sebagai simbol toleransi beragama di Sulawesi Utara."
	}

	// 8. Sejarah & Pendiri (Spesifik: Pendiri/Sejarah, bukan sekadar kata "siapa")
	if strings.Contains(msgLower, "sejarah") || strings.Contains(msgLower, "didirikan") ||
		strings.Contains(msgLower, "pendiri") || strings.Contains(msgLower, "pencetus") ||
		strings.Contains(msgLower, "dibangun tahun") || strings.Contains(msgLower, "siapa yang mendirikan") ||
		strings.Contains(msgLower, "siapa yang membangun") || strings.Contains(msgLower, "adolf") ||
		strings.Contains(msgLower, "sondakh") {
		return "Bukit Kasih didirikan pada tahun 2002 atas prakarsa Drs. Adolf Jouke Sondakh yang menjabat sebagai Gubernur Sulawesi Utara saat itu. Tempat ini dibangun sebagai simbol kerukunan, perdamaian, dan toleransi antarumat beragama."
	}

	// 9. Pendakian, Tangga & Rute (TrailMap)
	if strings.Contains(msgLower, "tangga") || strings.Contains(msgLower, "mendaki") ||
		strings.Contains(msgLower, "rute") || strings.Contains(msgLower, "pos") ||
		strings.Contains(msgLower, "berapa menit") || strings.Contains(msgLower, "berapa jam") ||
		strings.Contains(msgLower, "lama pendakian") || strings.Contains(msgLower, "jalur") {
		return "Untuk mendaki hingga ke puncak, Anda harus meniti total 2.400 anak tangga (tangga seribu). Pendakian memakan waktu sekitar 45 menit hingga 1,5 jam tergantung kondisi fisik. Disarankan memakai sepatu olahraga yang nyaman, membawa air minum, dan berhati-hati saat hujan karena anak tangga batu bisa licin."
	}

	// 10. Fasilitas, Istirahat & Toilet
	if strings.Contains(msgLower, "fasilitas") || strings.Contains(msgLower, "toilet") ||
		strings.Contains(msgLower, "wc") || strings.Contains(msgLower, "shelter") ||
		strings.Contains(msgLower, "pos istirahat") || strings.Contains(msgLower, "istirahat") {
		return "Fasilitas di Bukit Kasih meliputi toilet umum (di dekat gerbang masuk dan beberapa shelter), pos peristirahatan di sepanjang jalur tangga, kolam terapi air panas belerang, warung makan lokal, sewa baju adat, dan jasa foto cetak kilat."
	}

	// 11. Makanan & Kuliner
	if strings.Contains(msgLower, "makan") || strings.Contains(msgLower, "warung") ||
		strings.Contains(msgLower, "kuliner") || strings.Contains(msgLower, "pisang") ||
		strings.Contains(msgLower, "sambal roa") || strings.Contains(msgLower, "kelapa") ||
		strings.Contains(msgLower, "kopi") || strings.Contains(msgLower, "mie cakalang") {
		return "Di kawasan Bukit Kasih terdapat warung kuliner lokal yang menyajikan pisang goreng hangat dengan cocolan sambal roa khas Minahasa, kelapa muda segar, mie cakalang, kopi jahe, dan aneka minuman hangat."
	}

	// 12. Pakaian Adat & Foto
	if strings.Contains(msgLower, "pakaian") || strings.Contains(msgLower, "baju adat") ||
		strings.Contains(msgLower, "kostum") || strings.Contains(msgLower, "foto") ||
		strings.Contains(msgLower, "fotografer") || strings.Contains(msgLower, "dokumentasi") {
		return "Pengunjung dapat menyewa pakaian adat Minahasa untuk berfoto di landmark Bukit Kasih. Tersedia juga jasa fotografer lokal yang melayani cetak kilat langsung di lokasi."
	}

	// 13. Jam Buka & Waktu Berkunjung
	if strings.Contains(msgLower, "jam") || strings.Contains(msgLower, "buka") ||
		strings.Contains(msgLower, "operasional") || strings.Contains(msgLower, "tutup") ||
		strings.Contains(msgLower, "waktu terbaik") || strings.Contains(msgLower, "kapan baiknya") {
		return "Kawasan Bukit Kasih buka setiap hari 24 jam. Waktu berkunjung terbaik disarankan pada pagi hari (06:00 - 09:00) atau sore hari (15:00 - 17:30) agar cuaca sejuk dan tidak terlalu terik saat menaiki anak tangga."
	}

	// Default Constraint Response (Out of Context)
	return "Maaf, saya tidak dapat menjawab pertanyaan tersebut karena tugas saya hanya memberikan informasi seputar Bukit Kasih Kanonang berdasarkan data resmi yang tersedia."
}
