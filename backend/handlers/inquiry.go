package handlers

import (
	"net/http"
	"strings"
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	inquiry := models.Inquiry{
		Name:    input.Name,
		Email:   input.Email,
		Message: input.Message,
		Status:  "Menunggu Balasan",
		Reply:   nil,
		Date:    time.Now().Format("2006-01-02"),
	}

	if err := database.DB.Create(&inquiry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save inquiry"})
		return
	}

	c.JSON(http.StatusCreated, inquiry)
}

// GetInquiries retrieves all inquiries (for admin dashboard)
func GetInquiries(c *gin.Context) {
	var inquiries []models.Inquiry
	if err := database.DB.Order("created_at desc").Find(&inquiries).Error; err != nil {
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

	var inquiries []models.Inquiry
	if err := database.DB.Where("email = ?", email).Order("created_at desc").Find(&inquiries).Error; err != nil {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var inquiry models.Inquiry
	if err := database.DB.First(&inquiry, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inquiry not found"})
		return
	}

	// Update status and reply
	inquiry.Status = "Dijawab"
	inquiry.Reply = &input.Reply

	if err := database.DB.Save(&inquiry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reply"})
		return
	}

	c.JSON(http.StatusOK, inquiry)
}
