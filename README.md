# Website Pariwisata Bukit Kasih

Sistem Minimum Viable Product (MVP) untuk platform informasi pariwisata Bukit Kasih, Kanonang. Dibangun dengan pendekatan monorepo memisahkan antara frontend (React + Vite) dan backend (Golang + Gin + GORM) dengan basis data terpusat (Supabase PostgreSQL).

## Struktur Proyek
- `frontend/` - Berisi aplikasi web React.
- `backend/` - Berisi server API Golang.

---

## 🛠 Cara Menjalankan di Lokal (Development)

### 1. Menjalankan Backend (Golang)
Buka terminal dan arahkan ke folder `backend`:
```bash
cd backend
```
Buat file `.env` berdasarkan `backend/.env.example` lalu jalankan server:
```bash
go run main.go
```
*Server akan berjalan di http://localhost:8080*

### 2. Menjalankan Frontend (React)
Buka tab terminal baru dan arahkan ke folder `frontend`:
```bash
cd frontend
```
Install dependensi dan jalankan *development server*:
```bash
npm install
npm run dev
```
*Aplikasi frontend akan berjalan di http://localhost:5173*

---

## 📝 Daftar Environment Variable

Berikut adalah daftar variabel lingkungan yang tersedia dalam sistem ini. **PENTING: Jangan pernah membagikan atau meng-commit file yang berisi rahasia ke publik.**

### Backend (`backend/.env`)
| Variabel | Sifat | Deskripsi |
| :--- | :--- | :--- |
| `DB_DRIVER` | Opsional | Driver GORM (default: `postgres`) |
| `DB_SOURCE` | **Wajib** | URL Koneksi Database PostgreSQL (Supabase) |
| `JWT_SECRET` | **Wajib** | Kunci acak rahasia untuk tanda tangan (signing) token sesi pengguna |
| `PORT` | Opsional | Port server API (default: `8080`) |
| `FRONTEND_URL` | Opsional | URL asal frontend untuk keperluan validasi CORS (default: `http://localhost:5173`) |
| `AUTO_MIGRATE` | Opsional | Set ke `true` untuk memperbarui tabel database secara otomatis saat server menyala |
| `SEED_DATA` | Opsional | Set ke `true` untuk membuat data dummy/awal ke database saat server menyala (JANGAN aktifkan di production) |
| `GIN_MODE` | Opsional | Mode jalannya Gin. Set `release` di production (default: `debug`) |
| `GROQ_API_KEY` | **Wajib** | Kunci API Groq (LLM) untuk fitur Chatbot Pintar |
| `GROQ_MODEL` | Opsional | Versi Model LLM Groq (default: `llama-3.3-70b-versatile`) |
| `TELEGRAM_BOT_TOKEN` | **Wajib** | Token bot Telegram untuk integrasi chat Admin |
| `TELEGRAM_ADMIN_CHAT_ID` | Opsional | ID Obrolan Admin di Telegram |

### Frontend (`frontend/.env`)
| Variabel | Sifat | Deskripsi |
| :--- | :--- | :--- |
| `VITE_API_URL` | Opsional | URL absolut Backend API di environment production (misal: `https://api.domain.com/api/v1`). Jika kosong, akan memakai nilai `/api/v1`. |
| `VITE_SUPABASE_URL` | Opsional | URL Proyek Supabase (digunakan untuk Realtime Subscriptions) |
| `VITE_SUPABASE_ANON_KEY` | Opsional | Anon Key Supabase (publik, aman untuk diletakkan di frontend) |

---

## 🚀 Catatan Deploy (Production)
Sistem ini telah diaudit dan disiapkan untuk kelayakan *deploy* MVP:
1. **Frontend**: Disarankan mendeploy ke **Vercel** atau **Netlify**. Jika menggunakan backend di domain/hosting yang berbeda (split-domain), **Anda wajib mengisi `VITE_API_URL` di konfigurasi hosting frontend tersebut**.
2. **Backend**: Disarankan mendeploy ke **Render** atau VPS. Pastikan *environment variable* `GIN_MODE=release` dan `AUTO_MIGRATE` dimatikan jika tabel sudah terbuat dengan benar.
3. **Database**: Cadangkan (*backup*) data secara rutin dan pastikan mengganti _password_ _default_ akun Admin apabila Anda pernah menyalakan *seed*!
