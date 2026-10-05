package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// UploadImage handles single file upload
func UploadImage(c *gin.Context) {
	// 1. Get the file from form-data
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak ada file gambar yang diunggah"})
		return
	}

	// 2. Validate file size (max 5 MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file terlalu besar. Maksimal 5 MB."})
		return
	}

	// 3. Validate file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya format .jpg, .jpeg, .png, dan .webp yang diizinkan"})
		return
	}

	// 4. Validate MIME magic bytes to ensure file is genuinely an image
	openedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca berkas gambar"})
		return
	}
	defer openedFile.Close()

	buffer := make([]byte, 512)
	n, _ := openedFile.Read(buffer)
	mimeType := http.DetectContentType(buffer[:n])
	if !strings.HasPrefix(mimeType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Konten berkas tidak valid sebagai gambar"})
		return
	}

	// 5. Ensure "uploads" directory exists with secure permissions (0755)
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		err := os.MkdirAll(uploadDir, 0755)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori upload pada server"})
			return
		}
	}

	// 6. Generate unique filename (timestamp + original extension)
	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)
	filepathToSave := filepath.Join(uploadDir, filename)

	// 7. Save the file
	if err := c.SaveUploadedFile(file, filepathToSave); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan berkas ke server"})
		return
	}

	// 6. Return the access URL
	// E.g., if backend is running on http://localhost:8080, image will be available at /uploads/filename
	// We'll return just the relative path. Frontend/backend can construct full URL if needed,
	// but standard practice is returning the relative URL so it works behind reverse proxies.
	fileURL := fmt.Sprintf("/uploads/%s", filename)

	adminEmail, _ := c.Get("userEmail")
	services.LogAdminAction(fmt.Sprintf("%v", adminEmail), "UPLOAD_IMAGE", filename, c.ClientIP())

	c.JSON(http.StatusOK, gin.H{
		"message": "Gambar berhasil diunggah",
		"url":     fileURL,
	})
}
