package services

import (
	"time"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

func CreateInquiry(name, email, message string) (*models.Inquiry, error) {
	inquiry := models.Inquiry{
		Name:    name,
		Email:   email,
		Message: message,
		Status:  "Menunggu Balasan",
		Reply:   nil,
		Date:    time.Now().Format("2006-01-02"),
	}

	if err := database.DB.Create(&inquiry).Error; err != nil {
		return nil, err
	}
	return &inquiry, nil
}

func GetAllInquiries() ([]models.Inquiry, error) {
	var inquiries []models.Inquiry
	err := database.DB.Order("created_at desc").Find(&inquiries).Error
	return inquiries, err
}

func GetInquiriesByUser(email string) ([]models.Inquiry, error) {
	var inquiries []models.Inquiry
	err := database.DB.Where("email = ?", email).Order("created_at desc").Find(&inquiries).Error
	return inquiries, err
}

func ReplyInquiry(id, replyText string) (*models.Inquiry, error) {
	var inquiry models.Inquiry
	if err := database.DB.First(&inquiry, id).Error; err != nil {
		return nil, err
	}

	inquiry.Status = "Dijawab"
	inquiry.Reply = &replyText

	if err := database.DB.Save(&inquiry).Error; err != nil {
		return nil, err
	}
	return &inquiry, nil
}
