# Dokumentasi Sistem
## Portal Informasi & Panduan Wisata Bukit Kasih Kanonang

Selamat datang di dokumentasi resmi sistem informasi pariwisata **Bukit Kasih Kanonang**. Dokumen ini dirancang khusus oleh tim rekayasa perangkat lunak untuk mempermudah pemahaman alur kerja sistem, fitur yang tersedia, parameter penelitian, serta petunjuk operasional bagi pengembang maupun pengguna umum tanpa menyertakan referensi file teknis yang rumit.

---

### 1. Ringkasan Sistem
Website pariwisata Bukit Kasih Kanonang adalah platform berbasis web interaktif yang dikembangkan untuk menyajikan panduan perjalanan, nilai budaya Minahasa, sejarah toleransi beragama, serta keindahan alam vulkanik Kanonang, Minahasa, Sulawesi Utara. Portal ini mengusung pendekatan antarmuka modern yang bersih, responsif, dan kaya fitur interaktif demi kenyamanan pengguna maksimal.

---

### 2. Fitur & Fungsionalitas Utama

Sistem ini memiliki berbagai fitur unggulan yang dirancang untuk mendukung kebutuhan informasi pengguna:

#### A. Panduan Rute Interaktif (TrailMap)
* **Deskripsi:** Peta virtual berbasis langkah (*stepper*) yang memandu wisatawan menyusuri jalur pendakian ikonik 2.400 anak tangga Bukit Kasih.
* **Informasi Pos:** Terdapat 5 pos utama (Gerbang Utama, Terapi Air Panas, Tebing Pahatan Relief, Monumen Salib Kasih, dan Puncak Lima Rumah Ibadah).
* **Interaksi:** Menampilkan estimasi waktu perjalanan, tingkat kesulitan mendaki, visualisasi pos, dan tips keselamatan praktis ketika salah satu pos diklik.

#### B. Tema Gelap (Dark Mode)
* **Deskripsi:** Fitur kenyamanan membaca di lingkungan minim cahaya.
* **Interaksi:** Pengguna dapat beralih tema dengan menekan tombol sakelar di bilah navigasi. Preferensi tema (Gelap/Terang) akan disimpan secara otomatis di memori browser sehingga tema tidak berubah ketika halaman dimuat ulang (*reload*).

#### C. Filter Dinamis & Rencana Perjalanan (Bookmark)
* **Deskripsi:** Menu khusus untuk memilah aktivitas perjalanan berdasarkan kategori (*Ziarah*, *Rekreasi*, *Budaya*, dan *Kuliner*).
* **Fitur Rencana Perjalanan:** Wisatawan dapat menyimpan aktivitas pilihan mereka ke dalam daftar rencana perjalanan pribadi menggunakan fitur penanda (*bookmark*). Status tersimpan ini disimpan secara permanen di memori lokal browser.

#### D. Popup Informasi Detail (Modal Dialog)
* **Deskripsi:** Menggantikan notifikasi bawaan browser yang mengganggu dengan jendela detail kustom.
* **Interaksi:** Klik pada kartu landmark atau aktivitas pariwisata akan membuka jendela info kustom lengkap dengan foto, ulasan singkat, tips, dan detail operasional.

#### E. Formulir Kontak Pengunjung & Notifikasi Toast
* **Deskripsi:** Pengunjung dapat mengirimkan pertanyaan melalui formulir kontak.
* **Interaksi:** Setelah formulir diisi dan dikirim, sistem akan memicu notifikasi toast melayang (*toast notification*) beranimasi di sudut layar sebagai tanda pengiriman berhasil, kemudian formulir akan dikosongkan secara otomatis.

#### F. Galeri Testimoni Dinamis
* **Deskripsi:** Slider interaktif untuk menampilkan ulasan dan pengalaman nyata dari wisatawan.
* **Interaksi:** Dilengkapi tombol navigasi kiri/kanan, indikator dot, dan fitur geser otomatis (*auto-slide*) setiap 8 detik.

#### G. Sistem Autentikasi Database & Registrasi Wisatawan (RBAC)
* **Deskripsi:** Sistem autentikasi berbasis basis data cloud terintegrasi (**Supabase PostgreSQL Cloud**) menggunakan enkripsi password **bcrypt** dan token **JWT (JSON Web Token)** untuk mengontrol akses berbasis peran (*Role-Based Access Control*).
* **Fitur Registrasi Baru:** Pengunjung dapat mendaftarkan akun wisatawan baru secara mandiri melalui form pendaftaran gratis pada modal login. Akun baru akan disimpan di database Supabase secara otomatis dengan peran *"Wisatawan"*.
* **Peran Wisatawan:** Dapat melakukan bookmark aktivitas, menulis ulasan langsung di modal detail, dan melihat riwayat pertanyaan serta balasan pengelola di halaman profil. (Akun uji default: `wisatawan@gmail.com` / `password`).
* **Peran Pengelola (Admin):** Memiliki akses terproteksi ke Dashboard Admin untuk menerbitkan pengumuman, memoderasi ulasan, membalas pertanyaan wisatawan, dan melihat analitik ringkasan. (Akun uji default: `pengelola@bukitkasih.com` / `admin`).

#### H. Dashboard Pengelola (Admin Dashboard)
* **Deskripsi:** Halaman khusus pengelola (rute `/admin`) untuk mengelola operasional front-end secara real-time.
* **Fitur Tab:**
  1. **Ringkasan:** Visualisasi grafik lingkaran demografi pengunjung, statistik total bookmark, dan status pesan masuk.
  2. **Kelola Pengumuman:** Input formulir untuk mengaktifkan banner peringatan dinamis di halaman Beranda.
  3. **Moderasi Ulasan:** Antarmuka untuk meninjau dan menghapus ulasan wisatawan.
  4. **Pesan Masuk:** Membaca pertanyaan wisatawan dan menulis balasan langsung yang terintegrasi dengan profil wisatawan terkait.

#### I. Profil Wisatawan (Tourist Profile)
* **Deskripsi:** Halaman khusus wisatawan (rute `/profile`) yang menampilkan data personal terperinci:
  * **Rencana Perjalanan Saya:** Daftar penanda (*bookmark*) objek wisata yang tersimpan.
  * **Riwayat Pertanyaan:** Status pesan kontak ("Menunggu Balasan" atau "Dijawab") beserta teks tanggapan yang ditulis oleh admin.

---

### 3. Parameter & Metodologi Penelitian
Sistem ini dirancang agar siap digunakan sebagai instrumen dalam penelitian ketergunaan (*usability testing*) dengan parameter berikut:

1. **Objek Penelitian:** Ketergunaan sistem (*System Usability*) dan kepuasan antarmuka pengguna (UI/UX) pada website promosi Bukit Kasih.
2. **Lokasi Penelitian:** Bukit Kasih Kanonang, Minahasa, Sulawesi Utara (lokasi fisik) dan survei pengujian secara daring (lokasi digital).
3. **Variabel Penelitian:**
   * **Variabel Bebas (X):** Kualitas desain UI/UX (termasuk Dark Mode) dan interaktivitas fitur (TrailMap, filter, notifikasi kustom).
   * **Variabel Terikat (Y):** Tingkat ketergunaan sistem (*System Usability*) dan minat berkunjung wisatawan (*Intention to Visit*).
   * **Variabel Moderasi (Z):** Tingkat kemahiran digital responden.
4. **Metode Pengujian:** Pengukuran tingkat kelayakan menggunakan kuesioner kuantitatif *System Usability Scale* (SUS) didukung dengan wawancara kualitatif.
5. **Sampel Responden:** Calon wisatawan aktif internet berusia 17–50 tahun (minimal 30 responden).

---

### 4. Spesifikasi Teknologi (Tech Stack)
* **Frontend:**
  * **Library Utama:** React (v19) untuk manajemen status antarmuka yang reaktif.
  * **Alat Pembangunan (Bundler):** Vite (v8) untuk kompilasi kode super cepat.
  * **Kerangka Desain CSS:** Tailwind CSS (v4) untuk penyusunan antarmuka responsif dan modern.
  * **Penyimpanan Lokal:** *Web Storage API* (LocalStorage) untuk mempertahankan bookmark dan preferensi tema gelap.
* **Backend:**
  * **Bahasa Pemrograman:** Go (Golang) versi 1.22+ dengan kerangka kerja **Gin Gonic** untuk performa API super cepat.
  * **Database ORM:** **GORM** dengan driver PostgreSQL (`gorm.io/driver/postgres`).
  * **Database Engine:** **Supabase (PostgreSQL Cloud Managed Database)** dengan dukungan Connection Pooling.
  * **Autentikasi & Keamanan:** **JWT (JSON Web Token)** untuk manajemen sesi aman, enkripsi password menggunakan **bcrypt**, serta penerapan **Row Level Security (RLS)** pada tabel database.

---

### 5. Panduan Operasional Lokal
Bagi pengembang yang ingin menjalankan atau menguji proyek ini di komputer lokal, berikut langkah-langkahnya:

#### Prasyarat
1. **Node.js** (versi 18 ke atas disarankan)
2. **Go (Golang)** (versi 1.22 ke atas)
3. Akun dan proyek aktif di **Supabase**.

#### Langkah Instalasi & Pengoperasian
1. **Setup Backend:**
   * Konfigurasikan kredensial Supabase pada file `backend/.env`.
   * Jalankan server API backend:
     ```bash
     cd backend
     go run main.go
     ```
   * Backend akan berjalan di `http://localhost:8080` dan otomatis melakukan migrasi skema tabel ke Supabase.
2. **Setup Frontend:**
   * Buka terminal terpisah di folder `frontend`:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
   * Buka peramban (browser) dan akses alamat lokal yang tertera (biasanya `http://localhost:5173`).

#### Langkah Build Produksi
Jika ingin mengompilasi frontend untuk diunggah ke hosting:
```bash
cd frontend
npm run build
```
Hasil kompilasi final berupa file HTML, CSS, dan JS statis akan tersimpan pada folder `dist` dan siap diunggah ke server hosting web.

---

### 6. Jaminan Mutu Kode (Code Quality)
* **Kerapian Kode (Linting):** Proyek ini telah divalidasi menggunakan linter standar (ESLint) dengan hasil akhir **0 error dan 0 warning**. Seluruh kode aman dari variabel tak terpakai atau impor yang mubazir.
* **Kompilasi Sukses (Build Check):** Proses build produksi telah diuji dan lolos 100% tanpa kendala kompilasi tipe atau sintaksis.
