package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/database"
	"bukit-kasih-backend/handlers"
	"bukit-kasih-backend/middleware"
	"bukit-kasih-backend/models"
	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// setupTestEnvironment initializes in-memory SQLite and returns configured Gin engine
func setupTestEnvironment(t *testing.T) *gin.Engine {
	gin.SetMode(gin.TestMode)
	middleware.ResetRateLimiter()

	// Set test config
	config.AppConfig = config.Config{
		JWTSecret: []byte("test-secret-key-12345"),
	}

	// In-memory SQLite for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}

	database.DB = db

	// Auto migrate all tables
	err = db.AutoMigrate(
		&models.User{},
		&models.Review{},
		&models.Inquiry{},
		&models.Announcement{},
		&models.HermesMessage{},
		&models.KnowledgeDocument{},
	)
	if err != nil {
		t.Fatalf("Failed to auto-migrate test database: %v", err)
	}

	// Seed test users
	hashedPasswordAdmin, _ := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	hashedPasswordWisatawan, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)

	db.Create(&models.User{
		Email:    "pengelola@bukitkasih.com",
		Name:     "Pak Kanonang (Admin)",
		Password: string(hashedPasswordAdmin),
		Role:     "Pengelola",
	})

	db.Create(&models.User{
		Email:    "wisatawan@gmail.com",
		Name:     "Budi Santoso",
		Password: string(hashedPasswordWisatawan),
		Role:     "Wisatawan",
	})

	// Seed knowledge base documents
	db.Create(&models.KnowledgeDocument{
		Title:    "Informasi Tiket dan Jam Masuk Bukit Kasih",
		Category: "destinasi",
		Content:  "Harga tiket masuk Rp 10.000 per orang di gerbang utama, buka 24 jam setiap hari.",
		Keywords: "tiket harga biaya masuk jam buka",
	})
	db.Create(&models.KnowledgeDocument{
		Title:    "Jalur Pendakian 2.400 Anak Tangga",
		Category: "rute",
		Content:  "Memiliki total 2.400 anak tangga (tangga seribu) dengan estimasi waktu 45-90 menit.",
		Keywords: "tangga anak tangga rute jalur mendaki",
	})
	db.Create(&models.KnowledgeDocument{
		Title:    "Puncak Lima Rumah Ibadah dan Toleransi",
		Category: "sejarah",
		Content:  "Simbol kerukunan dengan 5 rumah ibadah (Masjid, Katolik, Protestan, Vihara, Pura) berdiri berdampingan di puncak.",
		Keywords: "lima rumah ibadah toleransi masjid gereja pura vihara kerukunan",
	})

	// Build router
	r := gin.New()
	r.Use(gin.Recovery())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "Bukit Kasih Backend API is running successfully!"})
		})

		// Auth with rate limiter
		authLimiter := middleware.RateLimiter(20, 1*time.Minute)
		api.POST("/auth/login", authLimiter, handlers.Login)
		api.POST("/auth/register", authLimiter, handlers.Register)
		api.GET("/auth/profile", middleware.AuthMiddleware(), handlers.GetProfile)

		// Announcements
		api.GET("/announcements/active", handlers.GetActiveAnnouncement)
		api.POST("/announcements", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.UpdateAnnouncement)

		// Reviews
		api.GET("/reviews", handlers.GetAllReviews)
		api.GET("/reviews/activity/:activityId", handlers.GetReviewsByActivity)
		api.POST("/reviews", handlers.CreateReview)
		api.DELETE("/reviews/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.DeleteReview)

		// Inquiries
		api.GET("/inquiries", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.GetInquiries)
		api.GET("/inquiries/user/:email", middleware.AuthMiddleware(), handlers.GetInquiriesByUser)
		api.POST("/inquiries", handlers.CreateInquiry)
		api.PUT("/inquiries/:id/reply", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.ReplyInquiry)

		// Chatbot (RAG)
		api.POST("/chat", middleware.AuthMiddleware(), handlers.Chatbot)

		// Knowledge Base (RAG management)
		api.GET("/knowledge", handlers.GetAllKnowledgeDocuments)
		api.GET("/knowledge/:id", handlers.GetKnowledgeDocumentByID)
		api.POST("/knowledge", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.CreateKnowledgeDocument)
		api.PUT("/knowledge/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.UpdateKnowledgeDocument)
		api.DELETE("/knowledge/:id", middleware.AuthMiddleware(), middleware.AdminOnly(), handlers.DeleteKnowledgeDocument)
	}

	return r
}

func performRequest(r http.Handler, method, path string, body interface{}, token string) *httptest.ResponseRecorder {
	var reqBody []byte
	if body != nil {
		reqBody, _ = json.Marshal(body)
	}

	req, _ := http.NewRequest(method, path, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// 1. UNIT & INTEGRATION: Health Check
func TestHealthCheck(t *testing.T) {
	r := setupTestEnvironment(t)

	w := performRequest(r, "GET", "/api/health", nil, "")
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp["status"] != "ok" {
		t.Errorf("Expected status 'ok', got %v", resp["status"])
	}
}

// 2. UNIT & INTEGRATION: Authentication & Registration (Positive & Negative Cases)
func TestAuthRegisterAndLogin(t *testing.T) {
	r := setupTestEnvironment(t)

	// Scenario: Successful registration
	regPayload := map[string]string{
		"name":     "Wisatawan Baru",
		"email":    "baru@example.com",
		"password": "secretpassword",
	}
	w := performRequest(r, "POST", "/api/auth/register", regPayload, "")
	if w.Code != http.StatusCreated {
		t.Errorf("Expected 201 on valid register, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Scenario Fail: Duplicate email registration
	wDup := performRequest(r, "POST", "/api/auth/register", regPayload, "")
	if wDup.Code != http.StatusConflict {
		t.Errorf("Expected 409 on duplicate register, got %d", wDup.Code)
	}

	// Scenario Fail: Password too short (< 6 chars)
	invalidReg := map[string]string{
		"name":     "Short Pass",
		"email":    "short@example.com",
		"password": "123",
	}
	wShort := performRequest(r, "POST", "/api/auth/register", invalidReg, "")
	if wShort.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 on short password, got %d", wShort.Code)
	}

	// Scenario: Successful login
	loginPayload := map[string]string{
		"email":    "baru@example.com",
		"password": "secretpassword",
	}
	wLogin := performRequest(r, "POST", "/api/auth/login", loginPayload, "")
	if wLogin.Code != http.StatusOK {
		t.Errorf("Expected 200 on valid login, got %d", wLogin.Code)
	}

	var loginResp map[string]interface{}
	json.Unmarshal(wLogin.Body.Bytes(), &loginResp)
	token, ok := loginResp["token"].(string)
	if !ok || token == "" {
		t.Errorf("Expected valid JWT token in login response")
	}

	// Scenario Fail: Wrong password
	wrongLogin := map[string]string{
		"email":    "baru@example.com",
		"password": "wrongpassword",
	}
	wWrong := performRequest(r, "POST", "/api/auth/login", wrongLogin, "")
	if wWrong.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 on wrong password, got %d", wWrong.Code)
	}
}

// 3. UNIT & INTEGRATION: Authorization & RBAC (AdminOnly & Protected Routes)
func TestRBACAndAuthorization(t *testing.T) {
	r := setupTestEnvironment(t)

	// Login as Wisatawan
	wLoginWis := performRequest(r, "POST", "/api/auth/login", map[string]string{
		"email":    "wisatawan@gmail.com",
		"password": "password",
	}, "")
	if wLoginWis.Code != http.StatusOK {
		t.Fatalf("Wisatawan login failed with status %d: %s", wLoginWis.Code, wLoginWis.Body.String())
	}
	var respWis map[string]interface{}
	json.Unmarshal(wLoginWis.Body.Bytes(), &respWis)
	tokenWis := respWis["token"].(string)

	// Login as Admin
	wLoginAdm := performRequest(r, "POST", "/api/auth/login", map[string]string{
		"email":    "pengelola@bukitkasih.com",
		"password": "admin",
	}, "")
	if wLoginAdm.Code != http.StatusOK {
		t.Fatalf("Admin login failed with status %d: %s", wLoginAdm.Code, wLoginAdm.Body.String())
	}
	var respAdm map[string]interface{}
	json.Unmarshal(wLoginAdm.Body.Bytes(), &respAdm)
	tokenAdm := respAdm["token"].(string)

	// Scenario Fail: Access protected route without token
	wNoToken := performRequest(r, "GET", "/api/auth/profile", nil, "")
	if wNoToken.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 when no token is provided, got %d", wNoToken.Code)
	}

	// Scenario Fail: Access protected route with invalid token
	wInvalidToken := performRequest(r, "GET", "/api/auth/profile", nil, "invalid.token.string")
	if wInvalidToken.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 when invalid token is provided, got %d", wInvalidToken.Code)
	}

	// Scenario: Wisatawan accesses profile
	wWisProfile := performRequest(r, "GET", "/api/auth/profile", nil, tokenWis)
	if wWisProfile.Code != http.StatusOK {
		t.Errorf("Expected 200 when Wisatawan accesses profile, got %d", wWisProfile.Code)
	}

	// Scenario Fail: Wisatawan attempts to update Announcement (Admin route) -> 403 Forbidden
	wWisAnnounce := performRequest(r, "POST", "/api/announcements", map[string]string{
		"text": "Pengumuman Palsu",
	}, tokenWis)
	if wWisAnnounce.Code != http.StatusForbidden {
		t.Errorf("Expected 403 when Wisatawan accesses Admin route, got %d", wWisAnnounce.Code)
	}

	// Scenario Success: Admin updates Announcement -> 200 OK
	wAdmAnnounce := performRequest(r, "POST", "/api/announcements", map[string]string{
		"text": "Pengumuman Resmi Pengelola",
	}, tokenAdm)
	if wAdmAnnounce.Code != http.StatusOK {
		t.Errorf("Expected 200 when Admin accesses Admin route, got %d", wAdmAnnounce.Code)
	}
}

// 4. UNIT & INTEGRATION: Input Validation & Business Logic (Review & Inquiry)
func TestReviewAndInquiryValidation(t *testing.T) {
	r := setupTestEnvironment(t)

	// Scenario Fail: Rating out of bounds (> 5)
	invalidReview := map[string]interface{}{
		"activityId": "act1",
		"author":     "Budi",
		"rating":     10, // Invalid rating
		"text":       "Bagus sekali",
	}
	wRevInvalid := performRequest(r, "POST", "/api/reviews", invalidReview, "")
	if wRevInvalid.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for rating out of bounds, got %d", wRevInvalid.Code)
	}

	// Scenario Success: Valid review
	validReview := map[string]interface{}{
		"activityId": "act1",
		"author":     "Budi",
		"rating":     5,
		"text":       "Pemandangan sangat indah!",
	}
	wRevValid := performRequest(r, "POST", "/api/reviews", validReview, "")
	if wRevValid.Code != http.StatusCreated {
		t.Errorf("Expected 201 for valid review, got %d", wRevValid.Code)
	}

	// Scenario Fail: Invalid email format in Inquiry
	invalidInquiry := map[string]string{
		"name":    "Joko",
		"email":   "not-an-email",
		"message": "Halo apakah buka?",
	}
	wInqInvalid := performRequest(r, "POST", "/api/inquiries", invalidInquiry, "")
	if wInqInvalid.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid email, got %d", wInqInvalid.Code)
	}
}

// 5. NEGATIVE SCENARIO TEST: Rate Limiting Enforcement
func TestRateLimiterEnforcement(t *testing.T) {
	gin.SetMode(gin.TestMode)
	middleware.ResetRateLimiter()

	r := gin.New()
	r.Use(middleware.RateLimiter(3, 1*time.Minute))
	r.GET("/test-limit", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"msg": "success"})
	})

	// Requests 1, 2, 3 should succeed
	for i := 1; i <= 3; i++ {
		w := performRequest(r, "GET", "/test-limit", nil, "")
		if w.Code != http.StatusOK {
			t.Errorf("Request %d expected 200, got %d", i, w.Code)
		}
	}

	// Request 4 should be throttled (429 Too Many Requests)
	wBlocked := performRequest(r, "GET", "/test-limit", nil, "")
	if wBlocked.Code != http.StatusTooManyRequests {
		t.Errorf("Request 4 expected 429 Too Many Requests, got %d", wBlocked.Code)
	}
}

// 6. RAG SEMANTIC RETRIEVAL & CHATBOT TESTS
func TestRAGSemanticRetrievalAndChatbot(t *testing.T) {
	r := setupTestEnvironment(t)

	// Login as Wisatawan
	wLoginWis := performRequest(r, "POST", "/api/auth/login", map[string]string{
		"email":    "wisatawan@gmail.com",
		"password": "password",
	}, "")
	var respWis map[string]interface{}
	json.Unmarshal(wLoginWis.Body.Bytes(), &respWis)
	tokenWis := respWis["token"].(string)

	// Login as Admin
	wLoginAdm := performRequest(r, "POST", "/api/auth/login", map[string]string{
		"email":    "pengelola@bukitkasih.com",
		"password": "admin",
	}, "")
	var respAdm map[string]interface{}
	json.Unmarshal(wLoginAdm.Body.Bytes(), &respAdm)
	tokenAdm := respAdm["token"].(string)

	// 1. Direct Service Test: RAG Semantic Context Retrieval
	docs, contextStr := services.RetrieveRelevantContext("Berapa harga tiket masuk dan jam operasional?", 3)
	if len(docs) == 0 {
		t.Errorf("Expected RAG service to retrieve relevant documents for ticket query")
	}
	if docs[0].Category != "destinasi" {
		t.Errorf("Expected top retrieved doc category to be 'destinasi', got '%s'", docs[0].Category)
	}
	if contextStr == "" {
		t.Errorf("Expected non-empty RAG context string")
	}

	// 2. Chatbot Endpoint Test with RAG
	wChat := performRequest(r, "POST", "/api/chat", map[string]string{
		"message": "Berapa jumlah anak tangga menuju puncak?",
	}, tokenWis)
	if wChat.Code != http.StatusOK {
		t.Errorf("Expected 200 from RAG Chatbot, got %d. Body: %s", wChat.Code, wChat.Body.String())
	}
	var chatResp map[string]interface{}
	json.Unmarshal(wChat.Body.Bytes(), &chatResp)
	if chatResp["reply"] == nil || chatResp["reply"] == "" {
		t.Errorf("Expected reply from RAG Chatbot")
	}
	citations, ok := chatResp["citations"].([]interface{})
	if !ok || len(citations) == 0 {
		t.Errorf("Expected citations in RAG Chatbot response")
	}

	// 3. Admin adds a new Knowledge Document dynamically (testing dynamic RAG extension)
	newArticle := map[string]string{
		"title":    "Festival Seni Budaya Minahasa di Bukit Kasih",
		"category": "sejarah",
		"content":  "Setiap bulan Juli diadakan festival tari Kabasaran dan musik Kolintang di pelataran Monumen Kasih.",
		"keywords": "festival budaya tari kabasaran kolintang juli pentas",
	}
	wCreateDoc := performRequest(r, "POST", "/api/knowledge", newArticle, tokenAdm)
	if wCreateDoc.Code != http.StatusCreated {
		t.Errorf("Expected 201 on create knowledge document, got %d", wCreateDoc.Code)
	}

	// 4. Query RAG with newly added festival topic
	newDocs, _ := services.RetrieveRelevantContext("Kapan ada pentas tari kabasaran dan festival kolintang?", 2)
	if len(newDocs) == 0 || newDocs[0].Title != "Festival Seni Budaya Minahasa di Bukit Kasih" {
		t.Errorf("Expected RAG to immediately retrieve dynamically added festival document")
	}

	// 5. Tourist cannot delete knowledge document (RBAC check)
	wDelWis := performRequest(r, "DELETE", "/api/knowledge/1", nil, tokenWis)
	if wDelWis.Code != http.StatusForbidden {
		t.Errorf("Expected 403 when Tourist attempts to delete knowledge document, got %d", wDelWis.Code)
	}
}
