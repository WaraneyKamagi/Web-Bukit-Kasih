# 👥 04. Daftar Role & Hak Akses Pengguna
## Sistem Informasi Pariwisata Bukit Kasih Kanonang & AI Assistant Hub

Dokumen ini mendefinisikan matriks *Role-Based Access Control (RBAC)*, tingkat otorisasi, dan mekanisme penegakan hak akses pada seluruh endpoint dan halaman aplikasi.

---

### 1. Definisi Role Pengguna

| Role | Identitas | Tujuan & Lingkup Akses |
|:---|:---|:---|
| **1. Publik / Tamu (*Guest*)** | Pengguna yang belum login atau pengunjung umum. | Membaca informasi wisata, rute peta interaktif, sejarah, jadwal kunjungan, ulasan publik, serta mengajukan tiket pertanyaan baru. |
| **2. Wisatawan (*Tourist*)** | Pengguna terdaftar dengan role `Wisatawan`. | Seluruh akses publik ditambah: interaksi penuh dengan AI Chatbot *Kawan Kasih*, menulis ulasan aktivitas, menyimpan bookmark wahana, dan melihat riwayat pertanyaan pribadi. |
| **3. Pengelola (*Admin*)** | Pengelola resmi destinasi dengan role `Pengelola`. | Hak akses administratif penuh: memoderasi/menghapus ulasan tidak layak, menjawab pertanyaan wisatawan, mengubah & menyiarkan pengumuman darurat realtime, serta mengakses *Hermes AI Studio*. |

---

### 2. Matriks Otorisasi Halaman & Fitur Frontend

| Fitur / Halaman | Publik (Tamu) | Wisatawan | Pengelola (Admin) | Mekanisme Proteksi |
|:---|:---:|:---:|:---:|:---|
| **Beranda (`/`) & Peta Jalur** | ✅ Baca | ✅ Akses Penuh | ✅ Akses Penuh | Terbuka publik |
| **Sejarah & Budaya (`/sejarah`)** | ✅ Baca | ✅ Akses Penuh | ✅ Akses Penuh | Terbuka publik |
| **Informasi Kunjungan (`/informasi`)** | ✅ Baca / Tanya | ✅ Akses Penuh | ✅ Akses Penuh | Form pertanyaan publik |
| **Daftar & Detail Aktivitas (`/experiences`)** | ✅ Baca Ulasan | ✅ Tulis Ulasan | ✅ Moderasi Ulasan | Modal login jika tamu ingin mengulas |
| **AI Chatbot Kawan Kasih** | ❌ Terkunci | ✅ Akses Penuh | ❌ (Dialihkan ke Hermes) | `user.role === 'Wisatawan'` di [`ChatbotWidget.jsx`](file:///c:/Users/slarkboy/OneDrive/Documents/Website%20Bukit%20kasih/Bukit-Kasih/frontend/src/components/ChatbotWidget.jsx#L26) |
| **Profil Pribadi (`/profile`)** | ❌ Ditolak | ✅ Akses Penuh | ✅ Akses Penuh | Redireksi otomatis jika sesi kosong |
| **Admin Dashboard (`/admin`)** | ❌ Ditolak (403) | ❌ Ditolak (403) | ✅ Akses Penuh | Route guard `useEffect` di [`AdminDashboard.jsx`](file:///c:/Users/slarkboy/OneDrive/Documents/Website%20Bukit%20kasih/Bukit-Kasih/frontend/src/pages/AdminDashboard.jsx#L43-L47) |
| **Hermes AI Marketing Console** | ❌ Ditolak | ❌ Ditolak | ✅ Akses Penuh | Proteksi tab Admin |

---

### 3. Matriks Otorisasi Endpoint API Backend

| Endpoint API | Method | Akses Minimum | Middleware Proteksi | Keterangan |
|:---|:---:|:---:|:---|:---|
| `/api/health` | `GET` | Publik | - | Health check uptime |
| `/api/auth/register` | `POST` | Publik | `RateLimiter(10, 1m)` | Registrasi akun baru (selalu role `Wisatawan`) |
| `/api/auth/login` | `POST` | Publik | `RateLimiter(10, 1m)` | Verifikasi login & penerbitan token JWT |
| `/api/auth/profile` | `GET` | Wisatawan | `AuthMiddleware()` | Mengambil data akun saat ini |
| `/api/announcements/active` | `GET` | Publik | - | Mengambil status pengumuman aktif |
| `/api/announcements` | `POST` | **Pengelola** | `AuthMiddleware()`, `AdminOnly()` | Memperbarui pengumuman & broadcast |
| `/api/reviews` | `GET` | Publik | - | Mengambil seluruh ulasan wisata |
| `/api/reviews/activity/:id` | `GET` | Publik | - | Filter ulasan per aktivitas |
| `/api/reviews` | `POST` | Publik / User | Struct Validation | Mengirim ulasan baru |
| `/api/reviews/:id` | `DELETE` | **Pengelola** | `AuthMiddleware()`, `AdminOnly()` | Hapus ulasan tidak pantas |
| `/api/inquiries` | `POST` | Publik / User | Struct Validation | Kirim pertanyaan wisatawan |
| `/api/inquiries` | `GET` | **Pengelola** | `AuthMiddleware()`, `AdminOnly()` | Mengambil seluruh daftar pertanyaan |
| `/api/inquiries/user/:email`| `GET` | Owner / Admin | `AuthMiddleware()`, `OwnershipCheck` | Hanya pemilik email atau admin yang boleh melihat |
| `/api/inquiries/:id/reply` | `PUT` | **Pengelola** | `AuthMiddleware()`, `AdminOnly()` | Kirim balasan pertanyaan |
| `/api/chat` | `POST` | Wisatawan | `AuthMiddleware()` | Inferensi AI Chatbot Kawan Kasih |
| `/api/hermes/*` | ALL | **Pengelola** | `AuthMiddleware()`, `AdminOnly()` | Seluruh operasi sinkronisasi Hermes AI |

---

### 4. Implementasi Penegakan (*Enforcement Implementation*)

1. **Pemeriksaan Token (`AuthMiddleware`)**:
   Mengekstrak header `Authorization: Bearer <token>`, memvalidasi algoritma signature HMAC-SHA256 dan masa berlaku `exp`. Menyimpan identitas `userEmail` dan `userRole` ke dalam Gin Context.
2. **Pemeriksaan Peran Admin (`AdminOnly`)**:
   Memeriksa nilai `userRole` di Gin Context. Jika tidak bernilai `"Pengelola"`, request seketika dihentikan (`c.Abort()`) dan mengembalikan HTTP **403 Forbidden**.
3. **Pemeriksaan Kepemilikan Data (*Ownership Isolation*)**:
   Pada endpoint `/api/inquiries/user/:email`, server memastikan bahwa email yang diminta cocok dengan email di token JWT pengguna yang sedang aktif, kecuali jika requester memiliki role `"Pengelola"`.
