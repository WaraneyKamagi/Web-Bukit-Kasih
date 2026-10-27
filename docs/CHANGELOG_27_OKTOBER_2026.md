# LAPORAN TEKNIS PERUBAHAN SISTEM (27 OKTOBER 2026)
**Proyek:** Sistem Informasi dan Layanan Wisata Religi Bukit Kasih Kanonang  
**Dokumen ini ditujukan untuk:** AI Agent, Pengembang Sistem, dan Tim Penilai/Dosen Pembimbing  
**Domain Produksi:** `https://bukitkasihkanonang.my.id/` | **VPS:** `43.163.4.205`  
**Branch Git:** `development` | **Commit Terakhir:** `7a75c81`

---

## 📌 RINGKASAN EKSEKUTIF (TL;DR FOR AI AGENTS)
Pada sesi pengembangan 27 Oktober 2026, telah diselesaikan dua tugas utama:
1. **Pembersihan Antarmuka Mock:** Menghapus komponen *"Live Banner Simulation"* dari tab pengumuman admin (`AnnouncementTab.jsx`) agar dashboard admin hanya menampilkan data riil.
2. **Implementasi Google OAuth 2.0 (Google Identity Services - GIS):** Menambahkan fitur masuk/daftar dengan akun Google untuk wisatawan di seluruh lapisan sistem (Frontend React 19 + Backend Golang Gin + Database Supabase PostgreSQL + Nginx CSP Headers).
3. **Penyelesaian Kendala Database Password:** Mengatasi error otentikasi SASL Supabase akibat karakter `@` pada password yang memecah parser URI PostgreSQL dengan menerapkan URL Percent-Encoding (`%40`).
4. **Build & Rilis Produksi ke VPS:** Mengompilasi binary Linux AMD64, men-deploy frontend ke `/var/www/bukit-kasih-frontend`, me-restart service systemd `bukitkasih`, dan memperbarui Content-Security-Policy (CSP) Nginx.

---

## 🛠️ 1. RINCIAN PERUBAHAN & ARSITEKTUR KODE

### A. Penghapusan Mock Widget "Live Banner Simulation"
- **File Target:** `frontend/src/components/admin/tabs/AnnouncementTab.jsx`
- **Konteks:** Terdapat kartu simulasi banner visual statis yang bersifat *mockup* dan tidak berinteraksi dengan API riil.
- **Tindakan:** Komponen UI simulasi dihapus bersih tanpa memengaruhi logika CRUD pengumuman riil.
- **Commit Git:** `f7c2ad7` (*feat: remove Live Banner Simulation mock card from admin announcement tab*).

---

### B. Otentikasi Google OAuth 2.0 (Google Identity Services)
- **Google Client ID:** `726409863841-su32unr1cp0ocnrmfmm3mna07so5se03.apps.googleusercontent.com`
- **Alur Kerja (Authentication Flow):**
  1. Pengguna membuka modal login/register di website.
  2. SDK Google (`https://accounts.google.com/gsi/client`) merender tombol resmi Google Sign-In di dalam `#googleSignInContainer`.
  3. Setelah pengguna memilih akun Google, Google mengembalikan credential berupa **Google ID Token (JWT)** ke callback frontend.
  4. Frontend mengirim ID Token ke endpoint backend: `POST /api/v1/auth/google`.
  5. Backend memvalidasi integritas ID Token ke Google Token Info API (`https://oauth2.googleapis.com/tokeninfo?id_token=...`).
  6. Backend memverifikasi bahwa `aud` (audience) sesuai dengan `GOOGLE_CLIENT_ID` dan token belum kedaluwarsa.
  7. **Auto-Provisioning User:**
     - Jika email sudah ada di tabel `users`, sistem langsung memverifikasi akun dan mengambil data user.
     - Jika email belum ada, sistem secara otomatis mendaftarkan user baru dengan role default `Wisatawan`, nama dari profil Google, email dari Google, dan password acak berkriptografi tinggi yang di-hash menggunakan bcrypt (`$2a$10$...`) agar memenuhi batasan skema database `password NOT NULL`.
  8. Backend menerbitkan **Bukit Kasih JWT** resmi dan menyimpannya di HttpOnly Cookie (`token`) serta mengembalikannya di response body JSON untuk sinkronisasi state frontend.

- **File yang Dibuat / Dimodifikasi:**
  | Lokasi File | Deskripsi Perubahan |
  |---|---|
  | `backend/services/google_auth.go` *(Baru)* | Logika verifikasi ID token Google via HTTP tokeninfo Google API, auto-register wisatawan baru, dan penerbitan JWT internal. Menggunakan standard library Go `net/http` agar tidak memicu bloat dependensi SDK besar. |
  | `backend/services/auth.go` | Refactoring modular fungsi `GenerateJWT(email, name, role string) (string, error)` agar reusable untuk Google Auth dan Regular Login. |
  | `backend/handlers/auth.go` | Penambahan method `GoogleLogin(c *gin.Context)` untuk menangani payload `{ "id_token": "..." }`, set cookie HttpOnly, dan return payload JSON user. |
  | `backend/routes/routes.go` | Pendaftaran rute publik `POST /api/v1/auth/google` dengan proteksi Rate Limiting. |
  | `backend/tests/api_test.go` | Penambahan unit test `TestGoogleAuthValidation` (menguji validasi input, token palsu ditolak, payload schema). |
  | `backend/.env` & `.env.example` | Penambahan variabel lingkungan `GOOGLE_CLIENT_ID`. |
  | `frontend/index.html` | Penambahan `<script src="https://accounts.google.com/gsi/client" async defer></script>`. |
  | `frontend/src/components/LoginModal.jsx` | Integrasi `google.accounts.id.initialize` dan `google.accounts.id.renderButton` ke elemen DOM `#googleSignInContainer`. Penyesuaian tombol untuk mode Sign-In maupun Sign-Up. |
  | `frontend/src/services/api.js` | Penambahan fungsi API client: `authService.googleLogin(idToken)`. |
  | `frontend/src/context/AuthContext.jsx` | Penambahan action `googleLogin` pada context untuk integrasi status otentikasi global aplikasi. |
  | `frontend/.env` & `.env.example` | Penambahan konfigurasi `VITE_GOOGLE_CLIENT_ID`. |
- **Commit Git:** `7a75c81` (*feat: implement Google OAuth 2.0 login with Google Identity Services*).

---

### C. Resolusi Masalah Koneksi Database Supabase (Percent-Encoding)
- **Gejala Masalah:**
  ```text
  failed to connect to `user=postgres.dskntyudaqxqextacdls database=postgres`: 35.79.125.133:6543 (aws-0-ap-northeast-1.pooler.supabase.com): failed SASL auth: FATAL: password authentication failed for user "postgres" (SQLSTATE 28P01)
  ```
- **Akar Penyebab:** Password pengguna database adalah `Buk1tK@s1h__`. Karakter `@` di dalam password bentrok dengan sintaks standar URL Connection String (`postgresql://user:password@host:port/dbname`), sehingga driver PGX membaca bagian setelah `@` sebagai hostname dan memotong password yang benar.
- **Solusi:** Mengonversi karakter khusus `@` menjadi URL-encoded hex `%40` pada file `.env`:
  ```env
  DATABASE_URL=postgresql://postgres.dskntyudaqxqextacdls:Buk1tK%40s1h__@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require
  ```
- **Hasil:** Koneksi ke pooler database Supabase berhasil 100% tanpa perlu melakukan reset password di dashboard Supabase.

---

### D. Penyesuaian Security Headers (Nginx Content-Security-Policy)
- **File Target:** `/etc/nginx/sites-available/default` di VPS & `Security_Header.md`
- **Konteks:** Nginx menerapkan CSP ketat (Grade A+ OWASP). Pemuatan skrip Google dan iframe One-Tap diblokir secara default oleh browser jika tidak diizinkan di CSP.
- **Konfigurasi Baru CSP:**
  ```nginx
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http: https: https://*.googleusercontent.com; connect-src 'self' http://43.163.4.205 http://43.163.4.205:8080 https://*.supabase.co wss://*.supabase.co https://accounts.google.com; frame-src 'self' https://accounts.google.com; frame-ancestors 'self';" always;
  ```
- **Direktif Tambahan:**
  * `script-src` -> `https://accounts.google.com/gsi/client` (memuat client library GIS).
  * `frame-src` -> `'self' https://accounts.google.com` (merender iframe tombol dan prompt Google).
  * `connect-src` -> `https://accounts.google.com` (mengirim telemetry dan verifikasi client Google).
  * `img-src` -> `https://*.googleusercontent.com` (menampilkan gambar profil Google milik wisatawan).

---

## 🚀 2. PROSEDUR DEPLOYMENT PRODUKSI (VPS)

### Kompilasi & Packaging
1. **Backend Linux AMD64 Binary:**
   ```powershell
   $env:GOOS = "linux"; $env:GOARCH = "amd64"; go build -ldflags="-s -w" -o bukit-kasih-server .
   ```
2. **Frontend Production Build:**
   ```powershell
   npm run build
   ```
3. **Paket Distribusi:**
   File `update_production.tar.gz` (15 MB) mencakup `bukit-kasih-server` dan folder `dist/`.

### Eksekusi Update di Server VPS (`43.163.4.205`):
```bash
# 1. Hentikan service backend
sudo systemctl stop bukitkasih

# 2. Pasang binary backend terbaru
cp ~/bukit-kasih-server /home/ubuntu/bukit-kasih-backend/bukit-kasih-server
chmod +x /home/ubuntu/bukit-kasih-backend/bukit-kasih-server

# 3. Pastikan GOOGLE_CLIENT_ID tercatat di .env backend VPS
grep -q "GOOGLE_CLIENT_ID" /home/ubuntu/bukit-kasih-backend/.env || echo "GOOGLE_CLIENT_ID=726409863841-su32unr1cp0ocnrmfmm3mna07so5se03.apps.googleusercontent.com" >> /home/ubuntu/bukit-kasih-backend/.env

# 4. Nyalakan kembali service backend
sudo systemctl start bukitkasih

# 5. Salin file frontend terbaru ke web root Nginx
sudo cp -r ~/dist/* /var/www/bukit-kasih-frontend/

# 6. Uji dan reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🧪 3. STATUS VERIFIKASI & PENGUJIAN

1. **Unit Testing Backend:**
   - Command: `go test -v ./tests`
   - Hasil: **PASS 100% (ok 9.600s)** untuk seluruh suite endpoint termasuk `TestGoogleAuthValidation`.
2. **Health Check Produksi:**
   - Command: `curl -s https://bukitkasihkanonang.my.id/api/v1/health`
   - Output: `{"message":"Bukit Kasih Backend API is running successfully!","status":"ok"}`
3. **Endpoint Google Auth Produksi:**
   - Command: `curl -s -X POST https://bukitkasihkanonang.my.id/api/v1/auth/google`
   - Output: `{"error":"ID token Google diperlukan"}` (Menandakan handler aktif dan memvalidasi request dengan benar).
4. **Git Repository:**
   - Remote branch: `origin/development`
   - Status: Up to date, Clean working tree.

---

## 💡 PANDUAN PENTING BAGI AI AGENT DI MASA DEPAN
Jika di masa depan ada AI Agent lain yang melanjutkan pengembangan pada proyek ini:
1. **Password Supabase:** Selalu ingat bahwa password mengandung karakter `@` yang **wajib di-encode** menjadi `%40` jika dituliskan dalam format URL database string. Jangan mengganti password database secara sembarangan.
2. **Kompilasi VPS:** VPS menggunakan arsitektur **Linux AMD64**. Jangan menyalin binary `.exe` dari Windows. Selalu kompilasi menggunakan `$env:GOOS = "linux"; $env:GOARCH = "amd64"`.
3. **Service Backend:** Backend berjalan sebagai daemon systemd dengan nama service `bukitkasih.service` di direktori `/home/ubuntu/bukit-kasih-backend/`.
4. **CSP Nginx:** Jika menambahkan integrasi pihak ketiga baru (misal widget peta, analitik, atau payment gateway), selalu perbarui Content-Security-Policy di **kedua tempat** dalam `/etc/nginx/sites-available/default` (di blok `server` dan blok `location = /index.html`).
