# 🛠️ 02. Daftar Tech Stack & Versi
## Sistem Informasi Pariwisata Bukit Kasih Kanonang & AI Assistant Hub

Dokumen ini memuat rincian lengkap seluruh teknologi, runtime, pustaka (*libraries*), dan *third-party services* yang digunakan beserta nomor versinya.

---

### 1. Frontend Technology Stack

| Komponen / Library | Versi | Kategori | Deskripsi Kegunaan |
|:---|:---:|:---|:---|
| **Node.js** | `>= 20.x` | Runtime | Lingkungan runtime JavaScript untuk pengembangan & proses *bundling*. |
| **React** | `^19.2.6` | UI Library | Framework komponen utama antarmuka pengguna (*declarative reactive UI*). |
| **React DOM** | `^19.2.6` | Web Renderer | Renderer DOM virtual untuk aplikasi web React. |
| **Vite** | `^8.0.12` | Build Tool & Bundler | Build tool generasi baru dengan HMR kilat dan optimasi output (Rollup-based). |
| **React Router DOM** | `^7.17.0` | Routing Engine | Pengelola perutean sisi klien (*Single Page Application / SPA client-side routing*). |
| **Tailwind CSS** | `^4.3.0` | Styling Framework | Utility-first CSS framework dengan token Material Design 3. |
| **@tailwindcss/vite** | `^4.3.0` | Vite Plugin | Integrasi langsung Tailwind CSS engine ke pipeline Vite. |
| **@supabase/supabase-js** | `^2.112.4` | Client SDK | SDK resmi Supabase untuk langganan *Realtime WebSocket channel*. |
| **Google Fonts (Plus Jakarta Sans)** | `v3.x` | Typography | Font tipografi modern untuk kenyamanan keterbacaan (*readability*). |
| **Google Material Symbols** | `Outlined` | Iconography | Pustaka ikon standar antarmuka pengguna. |

---

### 2. Backend Technology Stack

| Pustaka / Modul | Versi | Kategori | Deskripsi Kegunaan |
|:---|:---:|:---|:---|
| **Go (Golang)** | `1.25.6` | Core Language | Bahasa pemrograman inti backend bertipe data statis dengan konkurensi tinggi. |
| **Gin Gonic (`gin-gonic/gin`)** | `v1.12.0` | Web Framework | Framework HTTP berkecepatan tinggi dengan alokasi memori minimal. |
| **GORM (`gorm.io/gorm`)** | `v1.31.2` | ORM Engine | Object-Relational Mapping untuk transaksi data aman dan parameterized queries. |
| **GORM Postgres Driver** | `v1.6.2` | DB Driver | Driver PostgreSQL resmi untuk koneksi ke cluster Supabase via PgBouncer. |
| **GORM SQLite Driver (`glebarez/sqlite`)** | `v1.11.0` | In-Memory DB Driver | Driver SQLite pure-Go untuk isolasi automated unit & integration testing. |
| **JWT (`golang-jwt/jwt/v5`)** | `v5.3.1` | Authentication | Pustaka penandatanganan dan validasi JSON Web Tokens (HS256). |
| **Bcrypt (`golang.org/x/crypto`)** | `v0.48.0` | Cryptography | Algoritma hashing kata sandi satu arah dengan salt dinamis. |
| **Godotenv (`joho/godotenv`)** | `v1.5.1` | Config Loader | Pemuat variabel lingkungan dari file `.env`. |

---

### 3. Database & Cloud Infrastructure

| Layanan / Komponen | Provider / Stack | Detail Konfigurasi |
|:---|:---|:---|
| **Primary Database** | **Supabase PostgreSQL** | PostgreSQL 15.x berbasis Cloud AWS (Region: ap-northeast-1). |
| **Connection Pooler** | **PgBouncer** | Port 6543, Transaction mode, SSL Mode Required (`PreferSimpleProtocol: true`). |
| **Realtime Engine** | **Supabase Realtime** | WebSocket Pub/Sub untuk sinkronisasi broadcast pengumuman secara instan. |
| **Local Broadcast** | **HTML5 BroadcastChannel API** | Sinkronisasi multi-tab lokal tanpa latensi jaringan. |

---

### 4. AI Models & External Integrations

| Layanan / API | Model / Versi | Protokol | Fungsi Utama |
|:---|:---|:---:|:---|
| **Groq AI Cloud** | `llama-3.3-70b-versatile` | HTTPS REST | Mesin pemrosesan bahasa alami (LLM) untuk asisten virtual *Kawan Kasih*. |
| **Telegram Bot API** | API Bot Platform (`@HermesBKUK_bot`) | HTTPS JSON | Kanal komunikasi asisten pemasaran *Hermes AI* dengan pengelola. |
| **Composio Core** | Composio Tool Router | REST API | Penghubung AI Agent dengan Instagram Graph API untuk publikasi konten. |
| **Meta Graph API** | Instagram Graph API v18.0+ | OAuth 2.0 / REST | Eksekusi penerbitan postingan visual ke akun Instagram resmi Bukit Kasih. |
