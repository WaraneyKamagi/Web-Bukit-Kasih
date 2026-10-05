package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"bukit-kasih-backend/services"

	"github.com/gin-gonic/gin"
)

// CreateInquiry submits a new visitor contact question
func CreateInquiry(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required"`
		Email   string `json:"email" binding:"required,email"`
		Message string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input pesan tidak valid. Pastikan semua kolom terisi dengan benar."})
		return
	}

	inquiry, err := services.CreateInquiry(input.Name, input.Email, input.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save inquiry"})
		return
	}

	c.JSON(http.StatusCreated, inquiry)
}

// GetInquiries retrieves all inquiries (for admin dashboard)
func GetInquiries(c *gin.Context) {
	inquiries, err := services.GetAllInquiries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inquiries"})
		return
	}

	c.JSON(http.StatusOK, inquiries)
}

// GetInquiriesByUser retrieves inquiries filtered by user email (for tourist profile)
func GetInquiriesByUser(c *gin.Context) {
	email := c.Param("email")

	// Security check: Only the owner of the email or an admin/pengelola can see these inquiries
	currentUserEmail, exists := c.Get("userEmail")
	currentRole, roleExists := c.Get("userRole")

	emailStr, ok := currentUserEmail.(string)
	isOwner := exists && ok && strings.EqualFold(emailStr, email)
	isAdmin := roleExists && currentRole == "Pengelola"

	if !isOwner && !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda tidak memiliki wewenang melihat data ini"})
		return
	}

	inquiries, err := services.GetInquiriesByUser(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user inquiries"})
		return
	}

	c.JSON(http.StatusOK, inquiries)
}

// ReplyInquiry updates an inquiry with a reply from the admin
func ReplyInquiry(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		Reply string `json:"reply" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format balasan tidak valid. Pesan balasan wajib diisi."})
		return
	}

	inquiry, err := services.ReplyInquiry(id, input.Reply)
	if err != nil {
		// Could be not found or save error, assuming simple err response here
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reply or inquiry not found"})
		return
	}

	adminEmail, _ := c.Get("userEmail")
	services.LogAdminAction(fmt.Sprintf("%v", adminEmail), "REPLY_INQUIRY", "InquiryID: "+id, c.ClientIP())

	c.JSON(http.StatusOK, inquiry)
}
