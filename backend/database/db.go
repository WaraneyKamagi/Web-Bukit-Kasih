package database

import (
	"log"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/models"

	"golang.org/x/crypto/bcrypt"
	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB initializes database and runs auto migrations
func InitDB() {
	var err error
	if config.AppConfig.DBDriver == "mysql" {
		DB, err = gorm.Open(mysql.Open(config.AppConfig.DBSource), &gorm.Config{})
	} else {
		DB, err = gorm.Open(sqlite.Open(config.AppConfig.DBSource), &gorm.Config{})
	}

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Printf("Database connection established successfully using %s driver.\n", config.AppConfig.DBDriver)

	// Run migrations
	err = DB.AutoMigrate(
		&models.User{},
		&models.Review{},
		&models.Inquiry{},
		&models.Announcement{},
	)
	if err != nil {
		log.Fatalf("AutoMigration failed: %v", err)
	}

	log.Println("Database schemas auto-migrated successfully.")

	// Seed initial data
	seedUsers()
	seedReviews()
	seedInquiries()
	seedAnnouncements()
}

func hashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}
	return string(bytes)
}

func seedUsers() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		users := []models.User{
			{
				Email:    "wisatawan@gmail.com",
				Name:     "Budi Santoso",
				Password: hashPassword("password"),
				Role:     "Wisatawan",
			},
			{
				Email:    "pengelola@bukitkasih.com",
				Name:     "Pak Kanonang (Admin)",
				Password: hashPassword("admin"),
				Role:     "Pengelola",
			},
		}

		for _, u := range users {
			DB.Create(&u)
		}
		log.Println("Seeded default users (Wisatawan and Pengelola) successfully.")
	}
}

func seedReviews() {
	var count int64
	DB.Model(&models.Review{}).Count(&count)
	if count == 0 {
		reviews := []models.Review{
			{
				ActivityID: "act1",
				Author:     "Budi Santoso",
				Rating:     5,
				Text:       "Melihat lima tempat ibadah berdampingan di puncak bukit memberikan kedamaian spiritual yang luar biasa.",
				Date:       "2026-06-05",
			},
			{
				ActivityID: "act3",
				Author:     "Christian W.",
				Rating:     4,
				Text:       "Sangat menikmati kolam terapi air belerang setelah mendaki tangga seribu. Kaki jadi rileks kembali.",
				Date:       "2026-06-07",
			},
		}

		for _, r := range reviews {
			DB.Create(&r)
		}
		log.Println("Seeded initial reviews successfully.")
	}
}

func seedInquiries() {
	var count int64
	DB.Model(&models.Inquiry{}).Count(&count)
	if count == 0 {
		replyText := "Secara umum aman jika dalam pengawasan ketat orang tua, namun disarankan untuk berhenti beristirahat di beberapa shelter pos yang tersedia. Jangan dipaksakan mendaki sampai puncak jika anak kelelahan."
		inquiries := []models.Inquiry{
			{
				Name:    "Budi Santoso",
				Email:   "wisatawan@gmail.com",
				Message: "Apakah tangga seribu aman dinaiki anak-anak berusia 7 tahun?",
				Status:  "Dijawab",
				Reply:   &replyText,
				Date:    "2026-06-08",
			},
			{
				Name:    "Siti Rahma",
				Email:   "siti@yahoo.com",
				Message: "Berapa harga sewa pakaian adat Minahasa dan bagaimana memesan jasa foto cetak kilat?",
				Status:  "Menunggu Balasan",
				Reply:   nil,
				Date:    "2026-06-09",
			},
		}

		for _, i := range inquiries {
			DB.Create(&i)
		}
		log.Println("Seeded initial inquiries successfully.")
	}
}

func seedAnnouncements() {
	var count int64
	DB.Model(&models.Announcement{}).Count(&count)
	if count == 0 {
		announcement := models.Announcement{
			Text:     "Pemberitahuan: Jalur tangga seribu saat ini beroperasi penuh. Mohon berhati-hati saat hujan karena jalur agak licin.",
			IsActive: false,
		}
		DB.Create(&announcement)
		log.Println("Seeded default announcement successfully.")
	}
}
