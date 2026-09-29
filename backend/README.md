# Bukit Kasih API Backend

Proyek ini adalah backend (Go + Gin + GORM) untuk platform web Bukit Kasih, terhubung ke Supabase (PostgreSQL).

## Prasyarat
- Go 1.20 atau lebih baru.
- Akun Supabase (untuk database).
- Akun Groq API & Telegram Bot (untuk fitur Chatbot / Hermes AI).

## Setup Lokal

1. Salin file contoh environment variable:
   - Buat file `.env` di folder `backend/` dan sesuaikan isinya berdasarkan `backend/.env.example`.
2. Jalankan server:
   ```bash
   cd backend
   go run main.go
   ```

## Catatan Deployment
- **Supabase**: Pastikan Anda membuat tabel yang sesuai. Anda dapat mengatur `AUTO_MIGRATE=true` di env untuk pertama kali agar backend membuat tabel otomatis, lalu matikan kembali.
- **Port**: Aplikasi secara bawaan akan menggunakan port `8080`, namun server hosting biasanya mengatur `PORT` secara dinamis, pastikan membaca nilai ini.
- **Produksi**: Tidak ada perintah *build* khusus yang diwajibkan selain kompilasi biasa (`go build -o server main.go`).
