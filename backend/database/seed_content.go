package database

import (
	"log"
	"bukit-kasih-backend/models" // Assuming standard Go module path, will fix if needed
)

func seedActivities() {
	var count int64
	DB.Model(&models.Activity{}).Count(&count)
	if count == 0 {
		activities := []models.Activity{
			{
				ActivityID:  "act1",
				Title:       "Ziarah Harmoni Kebersamaan",
				Location:    "Puncak Bukit Kasih, Kanonang",
				Description: "Merenungkan nilai-nilai kedamaian, persatuan, dan toleransi beragama di lima tempat ibadah resmi yang berdiri berdampingan secara harmonis di atas puncak tertinggi Bukit Kasih.",
				ImageURL:    "/src/assets/ibadah.png",
				Categories:  "Ziarah",
				Hours:       "Buka Setiap Hari | 08:00 - 18:00 WITA",
				Meta:        "Ziarah Utama",
				IsFav:       true,
				Difficulty:  "Tinggi (Jalur menanjak 2.400 anak tangga)",
				Tips:        "Kenakan pakaian sopan saat berkunjung. Anda dipersilakan masuk dan berdoa sesuai dengan keyakinan masing-masing.",
			},
			{
				ActivityID:  "act2",
				Title:       "Mendaki Tangga Seribu",
				Location:    "Tangga Kasih, Bukit Kasih",
				Description: "Uji fisik Anda dengan mendaki jalur melingkar tangga beton yang mengelilingi perbukitan belerang. Menyuguhkan pemandangan menakjubkan dari ketinggian.",
				ImageURL:    "/src/assets/salib.png",
				Categories:  "Ziarah, Rekreasi",
				Hours:       "Akses 24 Jam (Disarankan siang hari)",
				Meta:        "Kegiatan Fisik",
				IsFav:       false,
				Difficulty:  "Sedang-Tinggi (2.400 anak tangga)",
				Tips:        "Bawa botol minum isi ulang untuk menjaga hidrasi. Ada beberapa pos perhentian (gazebo) untuk beristirahat di sepanjang tangga.",
			},
			{
				ActivityID:  "act3",
				Title:       "Terapi Air Belerang Alami",
				Location:    "Kawah Belerang, Lembah Bukit",
				Description: "Rendam kaki Anda di kolam air hangat alami yang kaya mineral belerang langsung dari kawah gunung. Sangat berkhasiat meringankan kelelahan otot kaki setelah berjalan jauh.",
				ImageURL:    "/src/assets/belerang.png",
				Categories:  "Rekreasi",
				Hours:       "Buka Setiap Hari | 08:00 - 17:30 WITA",
				Meta:        "Terapi Kesehatan",
				IsFav:       true,
				Difficulty:  "Mudah (Di kaki bukit dekat gerbang masuk)",
				Tips:        "Bawa handuk kecil sendiri dari rumah. Tarif rendam kaki sangat terjangkau dan langsung dibayarkan ke pengelola lokal.",
			},
			{
				ActivityID:  "act4",
				Title:       "Relief Sejarah Toar Lumimuut",
				Location:    "Dinding Bukit Belerang",
				Description: "Menyaksikan dan mempelajari legenda nenek moyang suku Minahasa, Toar dan Lumimuut, yang dipahat dengan rapi di lereng tebing bukit belerang vulkanik.",
				ImageURL:    "/src/assets/relief.png",
				Categories:  "Budaya",
				Hours:       "Buka Setiap Hari | 08:00 - 18:00 WITA",
				Meta:        "Edukasi Budaya",
				IsFav:       false,
				Difficulty:  "Sedang (Sekitar 500 anak tangga)",
				Tips:        "Aroma belerang di sini bisa cukup menyengat saat angin berembus. Bawa masker jika Anda sensitif terhadap aroma belerang.",
			},
			{
				ActivityID:  "act5",
				Title:       "Kuliner Kopi & Biapong Kawangkoan",
				Location:    "Sekitar Kawasan Wisata",
				Description: "Menikmati kelezatan legendaris Kopi Susu Kawangkoan tradisional berpadu dengan Biapong (Bakpao khas Minahasa) hangat yang manis atau gurih setelah puas menjelajah bukit.",
				ImageURL:    "https://lh3.googleusercontent.com/aida-public/AB6AXuByW9AKaOIs_Raw1bhXbrdRmOG_4Q_86r_uwDXQEQFQDmquCtEJ8g9RGZxVC_gMRoDdutKjjryd40NjKjiW1Z8ZWtSUSghZ6o7Ws7CaAnCFVmfrrWBawrLSZpGaNqbjk3TyyYskEgXWWuTODR4BtPvCID6iGnywmV6em3m9Tg_TkqbsI5fig6wtli7Nbi5092GtEkjTXJr0iI22fMujfuiyKjEpHU_otz70kcByZfh3STRtBua5yET8bVBDuRfmPW9V7v0QJAbq4bk",
				Categories:  "Kuliner",
				Hours:       "Warung Buka 07:00 - 20:00 WITA",
				Meta:        "Kuliner Khas",
				IsFav:       true,
				Difficulty:  "Sangat Mudah (Di warung-warung sekitar)",
				Tips:        "Biapong temo (isi kacang merah) dan biapong daging sangat lezat disajikan selagi hangat bersama kopi susu lokal.",
			},
			{
				ActivityID:  "act6",
				Title:       "Rebus Telur Kawah Belerang",
				Location:    "Kawah Panas Bumi, Lembah",
				Description: "Rasakan pengalaman menyenangkan merebus telur mentah secara langsung di dalam aliran air kawah panas bumi belerang yang mendidih secara alami.",
				ImageURL:    "/src/assets/belerang.png",
				Categories:  "Rekreasi, Kuliner",
				Hours:       "Buka Setiap Hari | 08:00 - 17:00 WITA",
				Meta:        "Aktivitas Unik",
				IsFav:       false,
				Difficulty:  "Mudah",
				Tips:        "Pedagang lokal menjual telur ayam mentah lengkap dengan wadah jaring kecilnya. Cukup celupkan selama 5-10 menit untuk mendapatkan telur rebus belerang setengah matang yang lezat.",
			},
			{
				ActivityID:  "act7",
				Title:       "Foto Pakaian Adat Minahasa",
				Location:    "Pintu Masuk & Spot Foto Utama",
				Description: "Kenakan pakaian adat kebesaran suku Minahasa dan berfotolah dengan latar belakang pemandangan tebing belerang yang eksotis dan berasap kabut.",
				ImageURL:    "/src/assets/relief.png",
				Categories:  "Budaya",
				Hours:       "Tersedia 08:30 - 17:30 WITA",
				Meta:        "Kenangan Lokal",
				IsFav:       false,
				Difficulty:  "Sangat Mudah",
				Tips:        "Jasa foto cetak kilat lokal tersedia dengan harga terjangkau. Hasil foto biasanya dicetak langsung dan dapat dibawa pulang sebagai cinderamata.",
			},
		}

		for _, a := range activities {
			DB.Create(&a)
		}
		log.Println("Seeded initial activities successfully.")
	}
}

func seedDestinations() {
	var count int64
	DB.Model(&models.Destination{}).Count(&count)
	if count == 0 {
		destinations := []models.Destination{
			{
				Title:             "Rumah Ibadah",
				ImageURL:          "/src/assets/ibadah.png",
				AltText:           "Lima tempat ibadah berdampingan di puncak bukit",
				DetailsTitle:      "Puncak Harmoni: Lima Rumah Ibadah Berdampingan",
				DetailsText:       "Terletak di puncak tertinggi Bukit Kasih, area ini menghadirkan lima tempat ibadah dari lima agama resmi di Indonesia (Gereja Protestan, Gereja Katolik, Vihara, Pura, dan Masjid) yang berdiri berdampingan secara damai. Ini adalah simbol toleransi nyata kerukunan umat beragama di Sulawesi Utara yang terwujud dalam satu kawasan spiritual melingkar.",
				DetailsTips:       "Harap menjaga ketenangan dan menghormati peziarah yang sedang beribadah. Lepaskan alas kaki di batas suci tempat ibadah yang ditentukan.",
				DetailsHours:      "Buka Setiap Hari (08:00 - 18:00 WITA)",
				DetailsDifficulty: "Tinggi (~2.400 anak tangga)",
			},
			{
				Title:             "Salib Kasih",
				ImageURL:          "/src/assets/salib.png",
				AltText:           "Monumen Salib putih setinggi 22 meter di puncak bukit",
				DetailsTitle:      "Monumen Salib Kasih Raksasa",
				DetailsText:       "Sebuah monumen salib putih megah setinggi 22 meter yang berdiri kokoh menghadap langsung ke arah lembah Minahasa. Monumen ini melambangkan cinta kasih universal dan perdamaian abadi. Dari ketinggian ini, pengunjung dapat menikmati panorama alam pegunungan Minahasa yang sejuk dan berselimut kabut.",
				DetailsTips:       "Tempat yang sangat indah untuk menikmati pemandangan matahari terbenam. Siapkan kamera Anda untuk sudut foto lanskap yang dramatis.",
				DetailsHours:      "Buka Setiap Hari (08:00 - 18:00 WITA)",
				DetailsDifficulty: "Sedang-Tinggi (~1.200 anak tangga)",
			},
			{
				Title:             "Relief Leluhur",
				ImageURL:          "/src/assets/relief.png",
				AltText:           "Relief Toar dan Lumimuut yang diukir di lereng belerang",
				DetailsTitle:      "Pahatan Sejarah: Relief Toar dan Lumimuut",
				DetailsText:       "Dinding tebing batu belerang alami yang diukir membentuk wajah leluhur legendaris suku Minahasa, Toar dan Lumimuut. Karya seni pahat ini menceritakan kisah awal mula peradaban suku Minahasa dan menjadi warisan budaya penting bagi warga lokal. Lokasinya yang berasap belerang menambah keunikan eksotis tebing ini.",
				DetailsTips:       "Uap belerang di sekitar relief bisa cukup pekat. Pengunjung dengan riwayat asma atau masalah pernapasan dianjurkan memakai masker pelindung.",
				DetailsHours:      "Buka Setiap Hari (08:00 - 18:00 WITA)",
				DetailsDifficulty: "Sedang (~500 anak tangga)",
			},
			{
				Title:             "Pemandian Air Panas",
				ImageURL:          "/src/assets/belerang.png",
				AltText:           "Kolam terapi air panas belerang alami",
				DetailsTitle:      "Terapi Alami: Pemandian Air Hangat Belerang",
				DetailsText:       "Terletak di bagian lembah dekat kawah, kolam pemandian air hangat ini mengandung kadar belerang alami yang berkhasiat untuk menyegarkan otot-otot kaki yang letih setelah mendaki tangga seribu. Aliran air hangat ini dialirkan langsung dari mata air kawah vulkanik aktif di sekitarnya.",
				DetailsTips:       "Bawa handuk cadangan. Anda juga dapat mencoba keunikan merebus telur mentah di kawah mendidih alami bersama pedagang lokal di sekitar kolam.",
				DetailsHours:      "Buka Setiap Hari (08:00 - 18:00 WITA)",
				DetailsDifficulty: "Mudah (Akses langsung dekat pintu masuk)",
			},
		}
		for _, d := range destinations {
			DB.Create(&d)
		}
		log.Println("Seeded initial destinations successfully.")
	}
}
