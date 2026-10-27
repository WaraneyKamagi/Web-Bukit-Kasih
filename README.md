# Website Pariwisata Religi & Alam Bukit Kasih Kanonang

Platform sistem informasi dan layanan pariwisata terpadu untuk kawasan wisata religi Bukit Kasih, Kanonang, Minahasa, Sulawesi Utara. Sistem dibangun menggunakan arsitektur monorepo yang memisahkan aplikasi web frontend (*Single Page Application*), backend RESTful API, dan basis data cloud terpusat.

* **Domain Resmi Produksi:** [https://bukitkasihkanonang.my.id/](https://bukitkasihkanonang.my.id/)
* **Status Keamanan:** 🟢 **Grade A+ (Maksimal)** di [SecurityHeaders.com](https://securityheaders.com) & 100/100 Kepatuhan OWASP
* **Autentikasi:** Dual-Session (JWT + HttpOnly Cookie) & **Google OAuth 2.0 (Google Identity Services)**

---

## 📂 Struktur Repositori

```text
Bukit-Kasih/
├── frontend/          # Aplikasi web React 19 + Vite + Tailwind CSS
├── backend/           # Server RESTful API Golang (Gin Framework + GORM)
├── docs/              # Dokumentasi teknis terpadu & laporan sistem
│   ├── KEAMANAN_DAN_INFRASTRUKTUR.md   # Audit OWASP (10 Kategori), SSL, Domain & Nginx CSP
│   ├── SISTEM_AI.md                    # Sistem Generative AI, Reels Maker & Kebijakan Data
│   └── CHANGELOG_27_OKTOBER_2026.md    # Catatan rilis Google OAuth 2.0 & VPS Deployment
└── README.md          # Panduan utama proyek
```

---

## 📚 Indeks Dokumentasi Sistem (`docs/`)

Seluruh dokumentasi telah diringkas dan dikelompokkan ke dalam folder `docs/`:

1. 🛡️ **[Dokumentasi Keamanan & Infrastruktur](docs/KEAMANAN_DAN_INFRASTRUKTUR.md)**
   * Hasil audit kepatuhan 10 kategori OWASP (peningkatan dari 48% ke 100%).
   * Panduan konfigurasi Domain DNS dan sertifikat SSL Let's Encrypt.
   * Template Nginx Security Headers (CSP Grade A+, HSTS Preload, X-Frame-Options).
   * Standar Operasional Prosedur (SOP) Disaster Recovery database Supabase.

2. 🤖 **[Dokumentasi Sistem AI & Otomasi Konten](docs/SISTEM_AI.md)**
   * Knowledge Base "Buku Pintar" Bukit Kasih.
   * Mesin Reels generator video vertikal 9:16 via FFmpeg.
   * Pemantau destinasi otomatis (cronjob) dengan koneksi database read-only.
   * Kebijakan keamanan data Zero-Access PII untuk menjaga privasi pengguna.

3. 🚀 **[Changelog Rilis Terbaru](docs/CHANGELOG_27_OKTOBER_2026.md)**
   * Integrasi Google OAuth 2.0 (Google Identity Services) untuk pendaftaran & login wisatawan.
   * Penghapusan komponen visual mock "Live Banner Simulation" pada dashboard admin.
   * Resolusi encoding karakter khusus `@` (`%40`) pada connection string Supabase.

---

## 🛠️ Panduan Menjalankan Sistem di Lokal (Development)

### 1. Menjalankan Backend (Golang)
Buka terminal dan arahkan ke folder `backend`:
```bash
cd backend
```
Salin template konfigurasi:
```bash
cp .env.example .env
```
Sesuaikan nilai `DATABASE_URL` di file `.env`, lalu jalankan server:
```bash
go run main.go
```
*Server API aktif di: `http://localhost:8080`*

### 2. Menjalankan Frontend (React)
Buka terminal baru dan arahkan ke folder `frontend`:
```bash
cd frontend
```
Install dependensi dan jalankan server pengembangan:
```bash
npm install
npm run dev
```
*Aplikasi frontend aktif di: `http://localhost:5173`*

---

## ⚙️ Ringkasan Variabel Lingkungan (Environment Variables)

### Backend (`backend/.env`)
| Variabel | Sifat | Deskripsi |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Wajib** | Connection string pooler Supabase PostgreSQL |
| `JWT_SECRET` | **Wajib** | Kunci kriptografi penandatanganan token JWT |
| `GOOGLE_CLIENT_ID` | **Wajib** | OAuth 2.0 Client ID dari Google Cloud Console |
| `PORT` | Opsional | Port server API (default: `8080`) |
| `GIN_MODE` | Opsional | Mode Gin (`debug` untuk lokal, `release` untuk produksi) |
| `GROQ_API_KEY` | Opsional | Kunci API Groq LLM untuk chatbot interaktif |
| `TELEGRAM_BOT_TOKEN` | Opsional | Token bot Telegram integrasi notifikasi admin |

### Frontend (`frontend/.env`)
| Variabel | Sifat | Deskripsi |
| :--- | :---: | :--- |
| `VITE_GOOGLE_CLIENT_ID` | **Wajib** | Client ID Google Identity Services untuk web |
| `VITE_SUPABASE_URL` | Opsional | URL Supabase project untuk sinkronisasi realtime |
| `VITE_SUPABASE_ANON_KEY`| Opsional | Anon Key publik Supabase |

---

## 🚀 Deployment Produksi (VPS Ubuntu)
* **Web Server & Reverse Proxy:** Nginx 1.24+ (port 80 & 443)
* **Process Manager:** Systemd service (`bukitkasih.service`)
* **Arsitektur Binary:** Linux AMD64 (`$env:GOOS = "linux"; $env:GOARCH = "amd64"`)
