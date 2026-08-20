# Alur Kerja & Standar Operasional Sistem (Workflow)
## Website Portal Informasi & Panduan Wisata Bukit Kasih Kanonang

Dokumen ini memuat panduan komprehensif mengenai seluruh alur kerja (*workflow*) sistem website **Bukit Kasih Kanonang**, mencakup alur interaksi pengguna (wisatawan & pengelola), alur autentikasi dan keamanan, alur data/API, serta standar alur kerja pengembangan perangkat lunak (*software development lifecycle*).

---

## 📑 Daftar Isi
1. [Arsitektur Sistem & Alur Komunikasi Data](#1-arsitektur-sistem--alur-komunikasi-data)
2. [Alur Kerja Wisatawan (Tourist Workflow)](#2-alur-kerja-wisatawan-tourist-workflow)
3. [Alur Kerja Pengelola / Admin (Admin Workflow)](#3-alur-kerja-pengelola--admin-admin-workflow)
4. [Alur Kerja Autentikasi & Otorisasi (Auth & RBAC)](#4-alur-kerja-autentikasi--otorisasi-auth--rbac)
5. [Alur Kerja Asisten Virtual AI (Chatbot "Kawan Kasih")](#5-alur-kerja-asisten-virtual-ai-chatbot-kawan-kasih)
6. [Matriks Endpoint API & Alur Respon](#6-matriks-endpoint-api--alur-respon)
7. [Alur Kerja Pengembangan & Rilis (Developer & Git Workflow)](#7-alur-kerja-pengembangan--rilis-developer--git-workflow)

---

## 1. Arsitektur Sistem & Alur Komunikasi Data

Sistem dibangun menggunakan pola arsitektur *Decoupled Client-Server* (Frontend SPA dan Backend RESTful API):

```mermaid
graph TD
    subgraph Client["Frontend Client (React v19 + Vite + Tailwind v4)"]
        UI[Antarmuka Pengguna / SPA]
        Ctx[AppContext & State Manager]
        LS[(Local Storage - Bookmark, Tema, Token)]
    end

    subgraph API["Backend API (Go v1.22 + Gin Gonic)"]
        Router[Gin Router & CORS]
        MW[JWT Auth & RBAC Middleware]
        Handlers[Handlers: Auth, Reviews, Inquiries, Chat]
        ORM[GORM ORM Layer]
    end

    subgraph Storage["Data Persistence"]
        DB[(MySQL / SQLite Database)]
    end

    UI <--> Ctx
    Ctx <--> LS
    Ctx <-->|HTTP REST / JSON / Bearer Token| Router
    Router --> MW
    MW --> Handlers
    Handlers --> ORM
    ORM <--> DB
```

---

## 2. Alur Kerja Wisatawan (Tourist Workflow)

Wisatawan dapat mengakses portal informasi pariwisata baik dalam status publik (tamu) maupun setelah masuk (*logged in*).

```mermaid
flowchart TD
    Start([Wisatawan Masuk Website]) --> Explore[Jelajahi Beranda, Informasi, Sejarah, & Aktivitas]
    Explore --> Map[Akses TrailMap 2.400 Anak Tangga]
    Map --> DetailPos[Klik Pos: Cek Estimasi, Kesulitan, & Tips]
    
    Explore --> Filter[Filter Aktivitas: Ziarah, Rekreasi, Budaya, Kuliner]
    Filter --> Bookmark[Simpan ke Rencana Perjalanan / Bookmark]
    Bookmark --> SaveLS[(Tersimpan di LocalStorage & Profil)]
    
    Explore --> ReviewAction{Ingin Tulis Ulasan?}
    ReviewAction -- Ya --> ModalReview[Buka Detail Aktivitas -> Tulis Ulasan & Rating]
    ModalReview --> PostReview[POST /api/reviews]
    PostReview --> SyncReview[Ulasan Tampil Real-Time]
    ReviewAction -- Tidak --> ChatAction
    
    SyncReview --> ChatAction{Ingin Tanya Bantuan?}
    ChatAction -- Tanya AI --> AIChat[Buka Widget Chatbot 'Kawan Kasih']
    AIChat --> ChatAPI[Dapatkan Respon Cepat dari AI]
    
    ChatAction -- Kontak Pengelola --> FormContact[Isi Formulir Pertanyaan / Kontak]
    FormContact --> SubmitInq[POST /api/inquiries]
    SubmitInq --> ToastNotif[Muncul Notifikasi Toast Sukses]
    ToastNotif --> CheckProfile[Pantau Status Balasan di Halaman /profile]
```

### Rincian Tahapan Wisatawan:
1. **Eksplorasi Informasi & Rute (TrailMap):** Wisatawan mempelajari 5 pos rute ikonik Bukit Kasih dengan visual interaktif dan tips keamanan.
2. **Kustomisasi Tampilan:** Beralih antara *Light Mode* dan *Dark Mode* sesuai kenyamanan mata (disimpan permanen di memori browser).
3. **Rencana Perjalanan (Itinerary Planner):** Memilih dan menandai (*bookmark*) destinasi untuk dikunjungi.
4. **Memberikan Feedback:** Memberikan rating (1-5 bintang) dan opini ulasan pada objek wisata tertentu.
5. **Mengirim Pertanyaan:** Mengisi form pesan masuk untuk ditindaklanjuti oleh pengelola wisata.

---

## 3. Alur Kerja Pengelola / Admin (Admin Workflow)

Pengelola wisata memiliki hak istimewa (*Admin Role*) untuk memantau metrik dan mengontrol konten dinamis melalui Dashboard Pengelola (`/admin`).

```mermaid
flowchart TD
    LoginAdmin[Pengelola Login dengan Akun Admin] --> AuthCheck{Validasi Token & Role Admin}
    AuthCheck -- Gagal --> Reject[Redirect / Akses Ditolak 403 Forbidden]
    AuthCheck -- Berhasil --> AdminDash[Masuk Halaman /admin]
    
    AdminDash --> Tab1[Tab 1: Ringkasan Analitik]
    AdminDash --> Tab2[Tab 2: Kelola Pengumuman Banner]
    AdminDash --> Tab3[Tab 3: Moderasi Ulasan]
    AdminDash --> Tab4[Tab 4: Respon Pesan Masuk]

    Tab2 --> PubAnnounce[Ketik & Simpan Pengumuman Baru]
    PubAnnounce --> AnnounceDB[(Database Updated)]
    AnnounceDB --> BroadcastBanner[Banner Tampil Otomatis di Beranda Wisatawan]

    Tab3 --> DeleteReview[Hapus Ulasan yang Tidak Sesuai / Spam]
    DeleteReview --> RemoveDB[(Dihapus dari Database)]

    Tab4 --> ReadInquiry[Baca Pesan Masuk Wisatawan]
    ReadInquiry --> WriteReply[Kirim Teks Balasan Pengelola]
    WriteReply --> InqDB[(Status berubah jadi 'Dijawab')]
    InqDB --> TouristProfile[Balasan Terkirim ke Profil Wisatawan]
```

---

## 4. Alur Kerja Autentikasi & Otorisasi (Auth & RBAC)

Sistem menggunakan standar autentikasi **JSON Web Token (JWT)** dengan enkripsi kata sandi menggunakan **bcrypt**.

```mermaid
sequenceDiagram
    autonumber
    actor User as Wisatawan / Admin
    participant Client as Frontend (React App)
    participant AuthAPI as API /api/auth
    participant MW as Middleware (JWT & Role)
    participant DB as Basis Data (MySQL/SQLite)

    Note over User,Client: Proses Registrasi Akun Baru
    User->>Client: Input Nama, Email, Password
    Client->>AuthAPI: POST /api/auth/register
    AuthAPI->>DB: Hash Password (bcrypt) & Simpan User (Role: Wisatawan)
    DB-->>AuthAPI: Sukses Terdaftar
    AuthAPI-->>Client: 201 Created

    Note over User,Client: Proses Login & Pembentukan Sesi
    User->>Client: Input Email & Password
    Client->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Cari User by Email
    DB-->>AuthAPI: Data User (Termasuk Hash Password)
    AuthAPI->>AuthAPI: Verifikasi Password Hash & Generate JWT Token
    AuthAPI-->>Client: 200 OK + JWT Token + Payload User
    Client->>Client: Simpan Token di LocalStorage & AppContext

    Note over Client,MW: Akses Endpoint Terproteksi
    Client->>MW: Request Header `Authorization: Bearer <Token>`
    MW->>MW: Validasi Signature & Expiration JWT
    alt Token Tidak Valid / Kadaluarsa
        MW-->>Client: 401 Unauthorized -> Auto Logout
    else Token Valid tapi Role Tidak Memadai (Wisatawan akses rute Admin)
        MW-->>Client: 403 Forbidden
    else Akses Sah
        MW->>DB: Eksekusi Operasi Data
        DB-->>Client: 200 OK (Data Dikembalikan)
    end
```

---

## 5. Alur Kerja Asisten Virtual AI (Chatbot "Kawan Kasih")

Widget asisten virtual AI terintegrasi di sudut layar untuk menjawab pertanyaan seputar sejarah, tiket, rute, dan etika wisata di Bukit Kasih Kanonang.

```mermaid
sequenceDiagram
    autonumber
    actor Wisatawan as Pengguna
    participant Widget as ChatbotWidget.jsx
    participant Backend as Backend Gin API
    participant AIHandler as Handler Chatbot (Kawan Kasih Knowledge Engine)

    Wisatawan->>Widget: Klik Widget & Ketik Pertanyaan (misal: "Berapa tiket masuk?")
    Widget->>Backend: POST /api/chat { "message": "..." } (Header Auth Token)
    Backend->>AIHandler: Proses Pembersihan Pesan & Pencocokan Konteks Pengetahuan
    Note over AIHandler: Menghubungkan konteks lokal Minahasa, data pos, tarif, & filosofi kerukunan
    AIHandler-->>Backend: Hasil Generasi Jawaban Ramah
    Backend-->>Widget: 200 OK { "reply": "..." }
    Widget-->>Wisatawan: Tampilkan Balasan Chat Interaktif
```

---

## 6. Matriks Endpoint API & Alur Respon

| Kelompok | Method | Endpoint | Tingkat Akses | Deskripsi & Dampak |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Publik | Pengecekan ketersediaan server API |
| **Auth** | `POST` | `/api/auth/register` | Publik | Pendaftaran akun wisatawan baru |
| **Auth** | `POST` | `/api/auth/login` | Publik | Validasi kredensial & penerbitan token JWT |
| **Auth** | `GET` | `/api/auth/profile` | Terautentikasi | Mengambil profil user aktif |
| **Pengumuman**| `GET` | `/api/announcements/active` | Publik | Mengambil pengumuman banner aktif |
| **Pengumuman**| `POST` | `/api/announcements` | **Admin Saja** | Menerbitkan/memperbarui pengumuman beranda |
| **Ulasan** | `GET` | `/api/reviews` | Publik | Mengambil semua ulasan wisatawan |
| **Ulasan** | `POST` | `/api/reviews` | Publik / User | Menambahkan ulasan dan rating baru |
| **Ulasan** | `DELETE`| `/api/reviews/:id` | **Admin Saja** | Menghapus ulasan yang melanggar ketentuan |
| **Pesan** | `POST` | `/api/inquiries` | Publik / User | Mengirim pesan pertanyaan dari form kontak |
| **Pesan** | `GET` | `/api/inquiries` | **Admin Saja** | Mengambil seluruh daftar pesan masuk |
| **Pesan** | `GET` | `/api/inquiries/user/:email` | Terautentikasi | Riwayat pesan berdasarkan email wisatawan |
| **Pesan** | `PUT` | `/api/inquiries/:id/reply` | **Admin Saja** | Menulis dan menyimpan balasan pesan |
| **Chatbot** | `POST` | `/api/chat` | Terautentikasi | Tanya jawab dengan AI Kawan Kasih |

---

## 7. Alur Kerja Pengembangan & Rilis (Developer & Git Workflow)

### 7.1 Setup Lingkungan Lokal (Local Setup)

```mermaid
flowchart LR
    A[Clone Repositori] --> B[Jalankan MySQL / XAMPP]
    B --> C[Backend: go run main.go]
    C --> D[Frontend: npm install && npm run dev]
    D --> E[Akses http://localhost:5173]
```

1. **Persiapan Database:**
   - Nyalakan **Apache & MySQL** di XAMPP.
   - Buat database: `bukit_kasih` pada phpMyAdmin.
2. **Menjalankan Backend (Port 8080):**
   ```bash
   cd backend
   go run main.go
   ```
3. **Menjalankan Frontend (Port 5173):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 7.2 Standar Git Branching & Commit

```mermaid
gitGraph
    commit id: "v1.0.0"
    branch develop
    checkout develop
    commit id: "setup backend"
    commit id: "setup frontend"
    branch feature/trailmap
    checkout feature/trailmap
    commit id: "feat: add 5 interactive steps"
    checkout develop
    merge feature/trailmap
    branch feature/auth-rbac
    checkout feature/auth-rbac
    commit id: "feat: jwt & admin dashboard"
    checkout develop
    merge feature/auth-rbac
    checkout main
    merge develop tag: "v1.1.0-release"
```

* **Format Pesan Commit:**
  * `feat:` Menambahkan fitur baru (contoh: `feat: integrasi chatbot ai kawan kasih`)
  * `fix:` Memperbaiki kutu/bug (contoh: `fix: perbaikan sinkronisasi state ulasan`)
  * `docs:` Perubahan dokumentasi (contoh: `docs: update workflow dan panduan instalasi`)
  * `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas.

### 7.3 Jaminan Mutu Kode (QA & Code Validation)

Sebelum melakukan build atau deployment, jalankan serangkaian validasi berikut:

1. **Pemeriksaan Linter Frontend:**
   ```bash
   cd frontend
   npm run lint
   ```
   *(Pastikan status 0 error dan 0 warning)*

2. **Pengujian Build Produksi:**
   ```bash
   cd frontend
   npm run build
   ```
   *(Memastikan bundler Vite berhasil menghasilkan artefak direktori `dist`)*

3. **Uji Ketergunaan (Usability Testing):**
   - Instrumen: *System Usability Scale (SUS)* dengan 10 butir pertanyaan terstandar.
   - Target Responden: Calon wisatawan dan pemerhati budaya (minimal 30 responden).
   - Metrik Keberhasilan: Skor SUS $\ge 70$ (Kategori *Good/Acceptable*).

---

> **Bukit Kasih Kanonang Web System** — Dikelola untuk pelestarian budaya toleransi, kenyamanan wisatawan, dan riset teknologi informasi pariwisata.
