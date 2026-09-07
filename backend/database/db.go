package database

import (
	"log"
	"time"

	"bukit-kasih-backend/config"
	"bukit-kasih-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB initializes database and runs auto migrations
func InitDB() {
	var err error
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  config.AppConfig.DBSource,
		PreferSimpleProtocol: true, // Disables prepared statements cache for Supabase PgBouncer pooler
	}), &gorm.Config{})

	if err != nil {
		log.Fatalf("Failed to connect to Supabase database: %v", err)
	}

	// Configure connection pooling
	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(1 * time.Hour)
		sqlDB.SetConnMaxIdleTime(15 * time.Minute)
		log.Println("Database connection pool configured successfully (MaxIdle: 10, MaxOpen: 100).")
	}

	log.Println("Database connection to Supabase established successfully.")

	// Run migrations
	err = DB.AutoMigrate(
		&models.User{},
		&models.Review{},
		&models.Inquiry{},
		&models.Announcement{},
		&models.HermesMessage{},
		&models.KnowledgeDocument{},
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
	seedKnowledgeDocuments()
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

func seedKnowledgeDocuments() {
	var count int64
	DB.Model(&models.KnowledgeDocument{}).Count(&count)
	if count == 0 {
		docs := []models.KnowledgeDocument{
			{
				Title:    "Informasi Lokasi, Tiket Masuk, dan Jam Operasional Bukit Kasih",
				Category: "destinasi",
				Content:  "Bukit Kasih terletak di Desa Kanonang, Kecamatan Kawangkoan, Kabupaten Minahasa, Provinsi Sulawesi Utara (sekitar 55 km ke arah selatan dari Kota Manado atau 15 menit dari pusat Kota Kawangkoan). Tiket masuk adalah Rp 10.000 per orang yang dapat dibeli di loket pintu gerbang utama. Objek wisata ini buka setiap hari selama 24 jam penuh. Waktu kunjungan terbaik adalah pagi hari pukul 06:00 - 09:00 atau sore hari pukul 15:00 - 17:30 agar cuaca sejuk dan pemandangan kawah belerang serta pegunungan terlihat jelas.",
				Keywords: "lokasi tiket harga masuk karcis jam buka operasional alamat desa kanonang kawangkoan minahasa manado rute jam berapa",
			},
			{
				Title:    "Panduan Jalur Pendakian 2.400 Anak Tangga (Tangga Seribu)",
				Category: "rute",
				Content:  "Jalur utama mengitari kawasan Bukit Kasih memiliki total 2.400 anak tangga bertingkat (sering dikenal dengan sebutan tangga seribu). Durasi pendakian dari pos gerbang bawah hingga ke puncak lima rumah ibadah dan monumen salib berkisar antara 45 menit hingga 1,5 jam tergantung stamina fisik pengunjung. Di sepanjang lintasan tangga tersedia 4 shelter pos istirahat beratap. Tips keselamatan: gunakan sepatu kets/olahraga yang tidak licin, bawa botol air minum isi ulang, dan berhati-hati saat hujan karena permukaan tangga batu rentan licin.",
				Keywords: "tangga anak tangga 2400 2.400 tangga seribu rute jalur mendaki trekking stamina pos istirahat shelter tips sepatu aman",
			},
			{
				Title:    "Puncak Lima Rumah Ibadah: Simbol Kerukunan Antarumat Beragama",
				Category: "sejarah",
				Content:  "Puncak Lima Rumah Ibadah adalah ikon utama Bukit Kasih Kanonang yang melambangkan toleransi dan kerukunan sejati masyarakat Sulawesi Utara dengan semboyan 'Torang Samua Basudara'. Di puncak bukit ini, berdiri berdampingan secara harmonis lima bangunan tempat ibadah resmi di Indonesia: Masjid, Gereja Katolik, Gereja Protestan, Vihara, dan Pura. Pengunjung dari berbagai latar belakang agama dapat beribadah dan berdoa dengan tenang di tengah panorama alam pegunungan yang asri.",
				Keywords: "lima rumah ibadah masjid gereja katolik protestan vihara pura toleransi kerukunan torang samua basudara agama puncak",
			},
			{
				Title:    "Monumen Salib Kasih 53 Meter & Filosofi Perdamaian",
				Category: "destinasi",
				Content:  "Monumen Salib Kasih adalah struktur monumen salib raksasa berwarna putih setinggi 53 meter yang berdiri kokoh di punggung bukit. Salib ini dapat dilihat dari kejauhan melintasi lembah Kawangkoan. Dibangun sebagai simbol kasih tanpa batas, pengorbanan, dan pesan perdamaian universal bagi seluruh umat manusia tanpa memandang perbedaan suku maupun kepercayaan.",
				Keywords: "salib monumen salib kasih 53 meter putih lambang damai cinta kasih simbol puncak",
			},
			{
				Title:    "Kawah Belerang Alami dan Kolam Terapi Rendam Air Panas",
				Category: "fasilitas",
				Content:  "Di lereng bawah Bukit Kasih terdapat kawah belerang vulkanik alami yang masih aktif dengan asap belerang yang mengepul. Air hangat yang mengalir dari sumber mata air panas alami ini dialirkan ke kolam terapi rendam kaki air panas belerang. Aktivitas ini sangat digemari wisatawan setelah menuruni anak tangga karena kandungan mineral belerang terbukti merelaksasi otot kaki yang lelah, memperlancar sirkulasi darah, dan menyehatkan kulit.",
				Keywords: "belerang kawah air panas terapi rendam kaki kolam hangat relaksasi kesehatan kulit sulfur pos 2",
			},
			{
				Title:    "Tebing Relief Wajah Leluhur Minahasa Toar dan Lumimuut",
				Category: "sejarah",
				Content:  "Tebing Relief menampilkan dua pahatan wajah berukuran raksasa pada dinding tebing batu belerang alami setinggi puluhan meter. Relief ini menggambarkan sosok Toar dan Lumimuut, tokoh legendaris leluhur nenek moyang suku Minahasa. Konon menurut cerita rakyat, kawasan perbukitan belerang Kanonang ini adalah tempat bermukim dan pertemuan awal Toar dan Lumimuut.",
				Keywords: "relief tebing toar lumimuut nenek moyang leluhur suku minahasa ukiran pahatan wajah batu mitologi legenda pos 3",
			},
			{
				Title:    "Fasilitas Wisata, Sewa Pakaian Adat Minahasa, & Jasa Foto Kilat",
				Category: "fasilitas",
				Content:  "Kawasan Bukit Kasih dilengkapi berbagai fasilitas penunjang wisata: area parkir kendaraan luas, toilet umum di pos gerbang dan shelter, gazebo istirahat, kios suvenir khas Minahasa, serta persewaan pakaian adat tradisional Minahasa (lengkap dengan aksesoris mahkota dan hiasan pedang kayu) untuk berfoto. Terdapat pula fotografer lokal profesional yang melayani pemotretan dengan layanan cetak foto kilat berbingkai langsung jadi di tempat.",
				Keywords: "fasilitas toilet parkir gazebo suvenir sewa baju adat pakaian adat minahasa foto cetak kilat fotografer tarif",
			},
			{
				Title:    "Kuliner Khas: Pisang Goreng Sambal Roa, Mie Cakalang, & Kopi Jahe",
				Category: "kuliner",
				Content:  "Di deretan warung kuliner tradisional Bukit Kasih, wisatawan dapat menikmati hidangan khas pegunungan: pisang goreng sepatu renyah yang dicocol sambal roa pedas gurih, mie cakalang hangat, jagung rebus, kelapa muda segar, dan kopi jahe / saraba panas yang nikmat disantap di tengah hembusan angin sejuk pegunungan Minahasa.",
				Keywords: "kuliner makan warung pisang goreng sambal roa mie cakalang kelapa muda kopi jahe saraba minuman makanan khas",
			},
			{
				Title:    "Sejarah Pendirian Bukit Kasih Kanonang oleh Gubernur A.J. Sondakh",
				Category: "sejarah",
				Content:  "Bukit Kasih Kanonang diresmikan dan mulai dibangun pada tahun 2002 pada era kepemimpinan Gubernur Sulawesi Utara Drs. Adolf Jouke Sondakh. Latar belakang pembangunannya didorong oleh komitmen pemerintah daerah dan para tokoh agama untuk mempertegas identitas Sulawesi Utara sebagai wilayah percontohan harmoni, persatuan, dan perdamaian beragama di Indonesia.",
				Keywords: "sejarah pendiri pencetus tahun 2002 adolf jouke sondakh aj sondakh gubernur sulawesi utara latar belakang asal usul",
			},
			{
				Title:    "Panduan Transportasi dan Akses Menuju Bukit Kasih",
				Category: "tips",
				Content:  "Akses menuju Bukit Kasih dapat ditempuh menggunakan kendaraan pribadi (mobil/motor) maupun transportasi umum. Dari Bandara Sam Ratulangi / Kota Manado, rute perjalanan melewati Kota Tomohon - Kawangkoan (Desa Kanonang) dengan waktu tempuh sekitar 1,5 hingga 2 jam perjalanan beraspal mulus. Tersedia papan penunjuk arah yang jelas di jalan raya utama Kawangkoan.",
				Keywords: "transportasi rute jalan akses kendaraan mobil motor angkutan umum manado tomohon bandara kawangkoan petunjuk arah",
			},
		}

		for _, doc := range docs {
			DB.Create(&doc)
		}
		log.Println("Seeded initial RAG knowledge documents (10 articles) successfully.")
	}
}
