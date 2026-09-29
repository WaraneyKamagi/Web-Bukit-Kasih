package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

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

	// 2. Validate file type (basic validation based on extension)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya format .jpg, .jpeg, .png, dan .webp yang diizinkan"})
		return
	}

	// 3. Ensure "uploads" directory exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		err := os.MkdirAll(uploadDir, os.ModePerm)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori upload pada server"})
			return
		}
	}

	// 4. Generate unique filename (timestamp + original extension)
	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)
	filepathToSave := filepath.Join(uploadDir, filename)

	// 5. Save the file
	if err := c.SaveUploadedFile(file, filepathToSave); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Gagal menyimpan file: %v", err)})
		return
	}

	// 6. Return the access URL
	// E.g., if backend is running on http://localhost:8080, image will be available at /uploads/filename
	// We'll return just the relative path. Frontend/backend can construct full URL if needed,
	// but standard practice is returning the relative URL so it works behind reverse proxies.
	fileURL := fmt.Sprintf("/uploads/%s", filename)

	c.JSON(http.StatusOK, gin.H{
		"message": "Gambar berhasil diunggah",
		"url":     fileURL,
	})
}
