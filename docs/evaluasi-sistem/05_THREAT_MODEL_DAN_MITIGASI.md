# 🛡️ 05. Threat Model Sederhana & Mitigasi Keamanan
## Sistem Informasi Pariwisata Bukit Kasih Kanonang & AI Assistant Hub

Dokumen ini memetakan analisis ancaman keamanan siber (*Threat Modeling*) menggunakan metodologi **STRIDE** serta tindakan mitigasi teknis yang telah diterapkan di dalam sistem.

---

### 1. Matriks Analisis Ancaman (STRIDE Matrix)

| Kategori STRIDE | Potensi Risiko / Vektor Serangan | Tingkat Risiko | Tindakan Mitigasi yang Diterapkan | Status |
|:---|:---|:---:|:---|:---:|
| **S** - *Spoofing Identity* (Pemalsuan Identitas) | Pemalsuan token JWT untuk mengakses data akun pengguna lain. | **Tinggi** | Token di-sign dengan algoritma kriptografi HS256 menggunakan secret key kuat. Validasi signature dan waktu kedaluwarsa (`exp`) dilakukan di setiap request. | <kbd>✅ Termitigasi</kbd> |
| **T** - *Tampering with Data* (Manipulasi Data) | Injeksi SQL (*SQL Injection*) pada parameter input pencarian atau formulir. | **Kritis** | Seluruh transaksi database menggunakan **GORM ORM** dengan *parameterized binding* (`?`). Tidak ada penggabungan string query manual (*zero string concatenation*). | <kbd>✅ Termitigasi</kbd> |
| **R** - *Repudiation* (Penyangkalan Aksi) | Pengguna menyangkal telah menulis ulasan atau mengirim pesan tertentu. | **Sedang** | Pencatatan timestamp (`CreatedAt`), identitas pengirim (`Author`/`Email`), dan status diverifikasi di database serta server access logs. | <kbd>✅ Termitigasi</kbd> |
| **I** - *Information Disclosure* (Kebocoran Informasi) | • Kebocoran hash password.<br>• Stack trace error teknis.<br>• Injeksi XSS (*Cross-Site Scripting*). | **Tinggi** | • Model `User.Password` memiliki tag `json:"-"` agar tidak pernah terkirim ke JSON.<br>• `gin.Recovery()` menyembunyikan stack trace dari client.<br>• React JSX otomatis meng-*escape* karakter HTML, 0 penggunaan `dangerouslySetInnerHTML`. | <kbd>✅ Termitigasi</kbd> |
| **D** - *Denial of Service* (Penyalahgunaan Beban) | *Brute-force attack* atau *credential stuffing* pada endpoint login/register. | **Tinggi** | Middleware [`RateLimiter`](file:///c:/Users/slarkboy/OneDrive/Documents/Website%20Bukit%20kasih/Bukit-Kasih/backend/middleware/ratelimit.go) membatasi maksimal 10 request per menit per IP. Request berlebih langsung diblokir dengan HTTP 429. | <kbd>✅ Termitigasi</kbd> |
| **E** - *Elevation of Privilege* (Eskalasi Hak Akses) | Wisatawan memanipulasi payload HTTP untuk mengubah pengumuman atau menghapus ulasan. | **Kritis** | Middleware [`AdminOnly()`](file:///c:/Users/slarkboy/OneDrive/Documents/Website%20Bukit%20kasih/Bukit-Kasih/backend/middleware/auth.go) memverifikasi klaim role `userRole == "Pengelola"`. Registrasi publik dipaksa ke role `Wisatawan`. | <kbd>✅ Termitigasi</kbd> |

---

### 2. Rincian Penanganan Ancaman Kritis

#### 1. Mitigasi SQL Injection
* **Risiko**: Penyerang menyisipkan karakter kutip `' OR '1'='1` pada formulir ulasan atau login untuk mencuri seluruh data tabel.
* **Mitigasi**: Seluruh query Go menggunakan metode GORM:
  ```go
  database.DB.Where("email = ?", input.Email).First(&user)
  ```
  Database engine memperlakukan `input.Email` murni sebagai literal nilai data, bukan instruksi yang dapat dieksekusi.

#### 2. Mitigasi Cross-Site Scripting (XSS)
* **Risiko**: Penyerang memasukkan skrip berbahaya `<script>stealCookie()</script>` di kolom ulasan atau pesan pengunjung.
* **Mitigasi**: React DOM secara otomatis mengonversi karakter `<` menjadi `&lt;` dan `>` menjadi `&gt;`. Tidak ada fungsi render HTML mentah yang digunakan di seluruh komponen frontend.

#### 3. Mitigasi Brute Force & Flooding
* **Risiko**: Bot melakukan ribuan kali tebakan password ke endpoint `/api/auth/login`.
* **Mitigasi**: Middleware `RateLimiter` mencatat frekuensi per IP client. Jika melebihi 10 percobaan dalam 1 menit, sistem otomatis memutus koneksi dengan HTTP `429 Too Many Requests`.

#### 4. Mitigasi Pencurian Kredensial Database
* **Risiko**: Password database dan API key bocor ke publik melalui repository Git.
* **Mitigasi**: Seluruh kredensial dimuat melalui `.env` via `godotenv`. File `.env` terdaftar di `.gitignore` dan tidak pernah di-commit ke source control publik.
