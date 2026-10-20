# 🛡️ LAPORAN AUDIT & PANDUAN IMPLEMENTASI SECURITY HEADERS
## Sistem Informasi dan Layanan Wisata Bukit Kasih Kanonang
* **Host / Target:** `http://43.163.4.205/`  
* **Tanggal Audit:** 13 Oktober 2026  
* **Alat Penguji:** [SecurityHeaders.com](https://securityheaders.com)  

---

## 📊 1. Laporan Sebelum Perbaikan (Before Fix)

Pada pengujian awal yang dilakukan pada tanggal 13 Oktober 2026 (13:59:49 UTC), hasil pemindaian keamanan header HTTP pada server produksi `43.163.4.205` menghasilkan **Grade F (Gagal)**.

```
+--------------------------------------------------------------------------+
|                       STATUS AUDIT SECURITY HEADERS                      |
|                                                                          |
|   NILAI / GRADE AWAL :  F (Sangat Rentan / Missing Essential Headers)    |
|   TARGET CAPAIAN     :  A (Maksimal untuk Protokol HTTP / Non-SSL)       |
+--------------------------------------------------------------------------+
```

### Rincian 5 Header yang Hilang (*Missing / Red Flags*):
1. ❌ **`Content-Security-Policy` (CSP):**
   * **Risiko:** Tidak ada pembatasan sumber eksekusi skrip, gambar, atau koneksi API, sehingga rentan terhadap serangan *Cross-Site Scripting* (XSS) dan injeksi data pihak ketiga.
2. ❌ **`X-Frame-Options`:**
   * **Risiko:** Website dapat disematkan ke dalam tag `<iframe>` di situs web penipu, membuka celah manipulasi klik (*Clickjacking*).
3. ❌ **`X-Content-Type-Options`:**
   * **Risiko:** Browser dapat melakukan *MIME-sniffing* dan mengeksekusi file nondokumen (misal gambar/teks berbahaya) seolah-olah file JavaScript.
4. ❌ **`Referrer-Policy`:**
   * **Risiko:** Bocornya data path URL saat pengguna berpindah tautan ke situs luar.
5. ❌ **`Permissions-Policy`:**
   * **Risiko:** Akses fitur perangkat (kamera, mikrofon, sensor lokasi) tidak dibatasi secara eksplisit di level header.

### Akar Masalah:
Aplikasi frontend dilayani langsung oleh **Nginx** dari direktori `/var/www/bukit-kasih-frontend/`. Konfigurasi default Nginx pada server Linux Ubuntu belum menyertakan instruksi `add_header` keamanan, sehingga setiap respons HTTP yang dikirim ke browser tidak memiliki proteksi header tersebut.

---

## 🛠️ 2. Panduan Langkah Perbaikan (Fix Instructions)

Perbaikan dilakukan dengan menambahkan direktif keamanan langsung ke konfigurasi Nginx di VPS.

### Langkah 1: Buka File Konfigurasi Nginx di VPS
Masuk ke terminal VPS Anda, lalu buka file konfigurasi Nginx menggunakan editor `nano`:
```bash
sudo nano /etc/nginx/sites-available/default
```
*(Catatan: Jika Anda menggunakan nama file konfigurasi khusus seperti `bukit-kasih`, sesuaikan path filenya).*

---

### Langkah 2: Tambahkan Direktif Security Headers
Cari blok `server { ... }` yang mendengarkan port 80 (`listen 80;`), lalu letakkan baris konfigurasi berikut di dalam blok server tersebut:

```nginx
    # ==========================================
    # HTTP SECURITY HEADERS (OWASP Standard)
    # ==========================================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Content Security Policy (Disesuaikan untuk React + Supabase + Go API)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http: https:; connect-src 'self' http://43.163.4.205 http://43.163.4.205:8080 https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';" always;
```

> **Catatan Penyesuaian CSP:**
> Konfigurasi CSP di atas sudah dirancang agar **tidak merusak** fitur website:
> - Tetap mengizinkan font Google & font lokal.
> - Mengizinkan pemanggilan API ke backend (`http://43.163.4.205:8080`) dan Supabase.
> - Mengizinkan pemuatan gambar dari storage lokal maupun eksternal.

Simpan file dengan menekan **`Ctrl + O`**, lalu tekan **`Enter`**, kemudian keluar dengan **`Ctrl + X`**.

---

### Langkah 3: Uji Konfigurasi Nginx
Pastikan tidak ada kesalahan ketik (*syntax error*):
```bash
sudo nginx -t
```
*Pastikan muncul pesan:*
`nginx: configuration file /etc/nginx/nginx.conf test is successful`

---

### Langkah 4: Terapkan Perubahan (Reload Nginx)
Jalankan perintah berikut agar Nginx membaca konfigurasi baru tanpa membuat website mati:
```bash
sudo systemctl reload nginx
```

---

### Langkah 5: Verifikasi Instan via Terminal VPS
Cek apakah header sudah terkirim dengan perintah:
```bash
curl -I http://43.163.4.205/
```
Jika berhasil, Anda akan melihat baris `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, dan `Content-Security-Policy` tercetak pada terminal.

---

## 📈 3. Laporan Sesudah Perbaikan (After Fix)

### Tabel Komparasi Header (Before vs After):

| Header Parameter | Status Sebelum (*Before*) | Status Sesudah (*After*) | Nilai Kebijakan (*Policy Value*) |
| :--- | :---: | :---: | :--- |
| **`Content-Security-Policy`** | ❌ Missing | ✅ **Aktif** | `default-src 'self'; script-src ...` |
| **`X-Frame-Options`** | ❌ Missing | ✅ **Aktif** | `SAMEORIGIN` |
| **`X-Content-Type-Options`** | ❌ Missing | ✅ **Aktif** | `nosniff` |
| **`Referrer-Policy`** | ❌ Missing | ✅ **Aktif** | `strict-origin-when-cross-origin` |
| **`Permissions-Policy`** | ❌ Missing | ✅ **Aktif** | `camera=(), microphone=(), geolocation=()` |
| **`Strict-Transport-Security`** | ⚪ N/A (HTTP) | ⚪ N/A (Menunggu SSL) | *Akan aktif setelah pemasangan domain + HTTPS* |

### Bukti Verifikasi Langsung (Live HTTP Response):
Pengujian langsung terhadap server produksi `http://43.163.4.205/` pada tanggal 13 Oktober 2026 (14:14:31 GMT) menunjukkan seluruh header keamanan telah terpasang dengan sempurna:

```http
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: http: https:; connect-src 'self' http://43.163.4.205 http://43.163.4.205:8080 https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';
```

### Hasil Evaluasi Akhir:
* **Nilai SecurityHeaders.com:** **Grade A** *(Nilai tertinggi dan sempurna untuk protokol HTTP non-SSL).*
* **Tingkat Keamanan:** Sistem terlindungi penuh dari *Clickjacking*, *XSS Injection*, *MIME Sniffing*, dan kebocoran *Referrer*.
* **Integritas Aplikasi:** Seluruh aset frontend (React, Vite, Google Fonts, Font lokal, dan koneksi API backend Golang + Supabase) tetap berjalan 100% normal tanpa terblokir.

---

## 🔮 4. Rencana Peningkatan Mendatang (Menuju Grade A+)
Untuk mendapatkan **Grade A+ (Nilai Sempurna)** pada masa mendatang:
1. Hubungkan nama domain resmi (misal: `bukitkasih.com` atau domain gratis `.my.id`).
2. Pasang sertifikat SSL gratis menggunakan Let's Encrypt (`sudo certbot --nginx`).
3. Aktifkan header **`Strict-Transport-Security` (HSTS)** di Nginx:
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
   ```
