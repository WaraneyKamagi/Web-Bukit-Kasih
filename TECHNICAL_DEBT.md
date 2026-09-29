# Daftar Utang Teknis (Technical Debt)

Dokumen ini berisi catatan mengenai keputusan arsitektur dan teknis yang diambil demi kecepatan rilis dan kelayakan MVP (*Minimum Viable Product*). Hal-hal di bawah ini **bukanlah bug yang harus segera diperbaiki**, melainkan "utang" spesifikasi skala besar (*enterprise*) yang perlu diimplementasikan saat aplikasi mulai menerima lonjakan jumlah pengguna dan data di masa depan (estimasi: 6-12 bulan ke depan).

---

## 1. Kinerja & Skalabilitas (Backend & Frontend)

### a. Ketiadaan Paginasi (Pagination) di API
*   **Lokasi:** `backend/services/review.go` dan `backend/services/content.go`
*   **Masalah Saat Ini:** Semua data ulasan (*reviews*) dan aktivitas (*activities*) ditarik secara penuh (*fetch all*) dari *database* menggunakan `db.Find(&models)`.
*   **Dampak Masa Depan:** Saat tabel ulasan mencapai ribuan baris, *query* ini akan mengkonsumsi memori (RAM) server secara masif (berisiko OOM) dan memperlambat *rendering* serta memakan kuota internet pengguna.
*   **Rencana Pelunasan:** 
    *   Ubah API *backend* agar menerima parameter `?page=1&limit=20`.
    *   Terapkan fungsi `Limit` dan `Offset` pada kueri GORM.
    *   Implementasikan *Infinite Scroll* atau tombol "Muat Lebih Banyak" di *frontend*.
*   **Trigger untuk dikerjakan:** Saat baris tabel *reviews* atau *activities* melebihi ~500 baris.

### b. Local Filtering (Pencarian Sisi Klien)
*   **Lokasi:** `frontend/src/pages/Experiences.jsx`
*   **Masalah Saat Ini:** Fitur filter kategori dilakukan di dalam *browser* (klien) dengan `activities.filter(...)`.
*   **Dampak Masa Depan:** Jika paginasi (poin a) diterapkan tanpa mengubah logika ini, fitur filter hanya akan mencari data dari *page* yang sedang aktif saja, sehingga hasil pencarian menjadi tidak akurat.
*   **Rencana Pelunasan:** Pindahkan logika filter ke *backend* (menjadi *Server-Side Filtering*), misalnya dengan parameter API `/activities?category=Ziarah`.
*   **Trigger untuk dikerjakan:** Bersamaan dengan pengerjaan paginasi (poin 1.a) di API.

---

## 2. Infrastruktur & Pemeliharaan Database

### a. Ketergantungan pada GORM AutoMigrate
*   **Lokasi:** Skrip koneksi database (`backend/database/` atau fungsi inisialisasi)
*   **Masalah Saat Ini:** Aplikasi memanggil fungsi `db.AutoMigrate()` secara otomatis setiap kali server *backend* dijalankan.
*   **Dampak Masa Depan:** Sangat berisiko di lingkungan *production*. Jika ada perubahan tipe data (misal: String ke Integer) di masa depan, GORM bisa merusak tabel, membuat sistem terkunci (*table locking*), atau mengubah data secara tidak terduga tanpa adanya riwayat (jejak) modifikasi yang jelas.
*   **Rencana Pelunasan:**
    *   Matikan `AutoMigrate` jika *environment variable* `ENV=production`.
    *   Gunakan perangkat *SQL Migrations* terstruktur (seperti **Goose** atau **Golang Migrate**) di mana setiap perubahan *database* dicatat dalam skrip `.sql` berversi (contoh: `0001_create_users_table.sql`, `0002_add_column_to_users.sql`).
*   **Trigger untuk dikerjakan:** Saat skema *database* mulai kompleks, atau aplikasi akan merilis versi stabil (v1.0) dengan perputaran data aktif.

---

## 3. Keamanan Tingkat Lanjut & Observabilitas

### a. Ketiadaan Rate Limiting (Pembatasan Akses)
*   **Lokasi:** *Middleware Backend*
*   **Masalah Saat Ini:** *Endpoint* publik API tidak membatasi seberapa sering satu IP address bisa mengirim permintaan.
*   **Dampak Masa Depan:** Rentan terhadap serangan *DDoS* sederhana atau penyalahgunaan *bot* (misalnya: *spamming* ribuan ulasan atau serangan ke *endpoint login*).
*   **Rencana Pelunasan:** Pasang *middleware Rate Limiter* terdistribusi (seperti Redis) untuk mencakup seluruh *endpoint* publik, bukan sekadar in-memory lokal.
*   **Trigger untuk dikerjakan:** Saat trafik (pengunjung) aplikasi meningkat tajam, aplikasi berjalan di lebih dari 1 server (kluster), atau terdapat ancaman DDoS.

### b. Monitoring Error Sisi Klien (Frontend) yang Tidak Tersentralisasi
*   **Lokasi:** Keseluruhan aplikasi *Frontend* React
*   **Masalah Saat Ini:** Jika pengguna mengalami *error* Javascript (misal: gagal akses *storage*, kegagalan *render* komponen, dll), *error* hanya tertulis di konsol peramban pengguna. Admin/Pengembang tidak mendapat laporan.
*   **Dampak Masa Depan:** Pengembang akan kesulitan melakukan *debugging* atau merespons masalah kritis yang dialami oleh pengguna tertentu secara proaktif.
*   **Rencana Pelunasan:** Integrasikan layanan pelacakan error (seperti **Sentry**, **LogRocket**, atau **Datadog**) untuk memonitor dan merekam pengecualian (*exceptions*) secara otomatis dari peramban klien ke *dashboard* pengembang.
*   **Trigger untuk dikerjakan:** Saat sudah ada tim khusus (admin/IT) yang aktif memantau sistem secara berkala, atau aplikasi sering menerima keluhan masalah (bug) yang sulit direproduksi di komputer lokal.
