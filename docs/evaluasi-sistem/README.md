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
3. **Database Supabase (PostgreSQL Cloud)**:
   * Proyek database Supabase aktif.
   * Kredensial URL koneksi sudah terkonfigurasi di file `backend/.env`.

---

### Langkah 1: Konfigurasi & Jalankan Backend (Golang API + Supabase)
1. Salin konfigurasi environment di folder `backend`:
   * Buat/buka file `backend/.env` dan pastikan `DB_SOURCE` mengarah ke Supabase Anda:
   ```env
   DB_DRIVER=postgres
   DB_SOURCE=postgresql://postgres.dskntyudaqxqextacdls:[YOUR_PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   PORT=8080
   ```
2. Jalankan server backend:
   ```bash
   cd backend
   go run main.go
   ```
   *Server API akan berjalan di `http://localhost:8080`. Seluruh tabel skema (`users`, `reviews`, `inquiries`, `announcements`) akan otomatis ter-migrasi dan di-seed di Supabase Cloud.*

---

### Langkah 2: Jalankan Frontend (React + Vite)
Buka terminal baru lainnya di folder proyek Anda:
```bash
cd frontend
npm install
npm run dev
```
*Buka browser Anda dan masuk ke alamat yang disediakan Vite (biasanya `http://localhost:5173`).*
