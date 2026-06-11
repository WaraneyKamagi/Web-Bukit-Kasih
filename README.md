# Portal Informasi & Panduan Wisata Bukit Kasih Kanonang

Platform digital terintegrasi untuk menyajikan informasi rute pendakian, toleransi kerukunan, ulasan wisatawan, dan asisten Q&A berbasis AI untuk objek wisata religi Bukit Kasih Kanonang, Minahasa, Sulawesi Utara.

---

## 🔑 Akun Uji Coba (Test Accounts)

Gunakan akun berikut untuk menguji sistem dengan peran (*role*) yang berbeda:

### 1. Wisatawan (Tourist)
* **Email:** `wisatawan@gmail.com`
* **Password:** `password`
* **Fitur:** Bookmark rute pariwisata, menulis ulasan, bertanya melalui formulir kontak, dan mengobrol dengan Chatbot AI "Kawan Kasih".

### 2. Pengelola Wisata (Admin/Manager)
* **Email:** `pengelola@bukitkasih.com`
* **Password:** `admin`
* **Fitur:** Dashboard ringkasan analitik, kelola pengumuman (banner dinamis), moderasi ulasan wisatawan, dan membalas pesan masuk.

---

## 🚀 Cara Menjalankan Sistem Secara Lokal

### Prasyarat
1. **Node.js** (v18 atau lebih baru)
2. **Go (Golang)** (v1.22 atau lebih baru)
3. **XAMPP / MySQL Server**:
   * Aktifkan modul **MySQL** pada XAMPP Control Panel.
   * Buat database baru bernama **`bukit_kasih`** melalui phpMyAdmin (`http://localhost/phpmyadmin`).

---

### Langkah 1: Jalankan Backend (Golang API)
Buka terminal baru di folder proyek Anda:
```bash
cd backend
go run main.go
```
*Server API akan berjalan di `http://localhost:8080`. Tabel database akan otomatis termigrasi dan di-seed.*

### Langkah 2: Jalankan Frontend (React + Vite)
Buka terminal baru lainnya di folder proyek Anda:
```bash
cd frontend
npm run dev
```
*Buka browser Anda dan masuk ke alamat yang disediakan Vite (biasanya `http://localhost:5173`).*
