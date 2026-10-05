package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bukit-kasih-backend/handlers"
	"bukit-kasih-backend/middleware"
	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

func performRawRequest(r http.Handler, req *http.Request) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func setupSessionTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(gin.Recovery())

	api := r.Group("/api/v1")
	api.Use(middleware.CSRFProtection())
	{
		api.POST("/auth/logout", handlers.Logout)
		api.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"email": c.GetString("userEmail"),
				"role":  c.GetString("userRole"),
			})
		})
		api.POST("/mutate", middleware.AuthMiddleware(), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "mutated"})
		})
	}

	return r
}

func TestSessionAndCSRFProtection(t *testing.T) {
	_ = setupTestEnvironment(t)
	r := setupSessionTestRouter()

	// 1. Generate test token
	tokenString, _, err := services.Login("wisatawan@gmail.com", "password")
	if err != nil {
		t.Fatalf("Failed to login test user: %v", err)
	}

	// 2. Test Cookie Fallback Authentication (Dual-Token)
	reqCookie, _ := http.NewRequest("GET", "/api/v1/protected", nil)
	reqCookie.AddCookie(&http.Cookie{
		Name:    "token",
		Value:   tokenString,
		Expires: time.Now().Add(1 * time.Hour),
	})

	wCookie := performRawRequest(r, reqCookie)
	if wCookie.Code != http.StatusOK {
		t.Errorf("Expected 200 via cookie authentication, got %d", wCookie.Code)
	}

	// 3. Test CSRF Protection: Cookie Auth on Mutating Route WITHOUT CSRF Header -> Expected 403 Forbidden
	reqMutateNoCSRF, _ := http.NewRequest("POST", "/api/v1/mutate", nil)
	reqMutateNoCSRF.AddCookie(&http.Cookie{
		Name:  "token",
		Value: tokenString,
	})

	wMutateNoCSRF := performRawRequest(r, reqMutateNoCSRF)
	if wMutateNoCSRF.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden without CSRF header, got %d", wMutateNoCSRF.Code)
	}

	// 4. Test CSRF Protection: Cookie Auth on Mutating Route WITH X-Requested-With Header -> Expected 200 OK
	reqMutateWithHeader, _ := http.NewRequest("POST", "/api/v1/mutate", nil)
	reqMutateWithHeader.AddCookie(&http.Cookie{
		Name:  "token",
		Value: tokenString,
	})
	reqMutateWithHeader.Header.Set("X-Requested-With", "XMLHttpRequest")

	wMutateWithHeader := performRawRequest(r, reqMutateWithHeader)
	if wMutateWithHeader.Code != http.StatusOK {
		t.Errorf("Expected 200 OK with X-Requested-With header, got %d", wMutateWithHeader.Code)
	}

	// 5. Test CSRF Protection: Cookie Auth on Mutating Route WITH X-CSRF-Token Header -> Expected 200 OK
	reqMutateWithCSRFToken, _ := http.NewRequest("POST", "/api/v1/mutate", nil)
	reqMutateWithCSRFToken.AddCookie(&http.Cookie{
		Name:  "token",
		Value: tokenString,
	})
	reqMutateWithCSRFToken.Header.Set("X-CSRF-Token", "BK-CSRF-SECURE-V1")

	wMutateWithCSRFToken := performRawRequest(r, reqMutateWithCSRFToken)
	if wMutateWithCSRFToken.Code != http.StatusOK {
		t.Errorf("Expected 200 OK with X-CSRF-Token header, got %d", wMutateWithCSRFToken.Code)
	}

	// 6. Test Logout: Clears Cookie
	reqLogout, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
	wLogout := performRawRequest(r, reqLogout)
	if wLogout.Code != http.StatusOK {
		t.Errorf("Expected 200 OK on logout, got %d", wLogout.Code)
	}

	cookies := wLogout.Result().Cookies()
	var tokenCookie *http.Cookie
	for _, c := range cookies {
		if c.Name == "token" {
			tokenCookie = c
			break
		}
	}
	if tokenCookie == nil || tokenCookie.MaxAge >= 0 {
		t.Errorf("Expected token cookie to be expired (MaxAge < 0)")
	}
}
