# LAPORAN IMPLEMENTASI & PENGEMBANGAN GENERATIVE AI AGENT
**Proyek:** Sistem Otomatisasi Content Creation & Smart Tourism Branding Bukit Kasih
**Tujuan Laporan:** Dokumentasi teknis untuk bahan evaluasi dan pelaporan kepada Dosen Pembimbing.
**Status Dokumen:** Diperbarui 15 Oktober 2026 (setelah rotasi password database dan pembuatan user read-only)

---

## RINGKASAN STATUS (BACA DULU)

| Modul | Status | Keterangan |
|---|---|---|
| Knowledge Base "Buku Pintar" | ✅ Berjalan | File Markdown dipakai sebagai acuan konten |
| Mesin Reels (builder.py) | ✅ Berjalan | Render manual, belum diotomatisasi |
| Pemantau Destinasi | ✅ Teruji (deteksi) | Deteksi berjalan via cron, pembuatan draft & posting belum terhubung |
| Auto-Moderator Ulasan | ⛔ Dinonaktifkan | Melanggar kebijakan akses data, diarsipkan |
| Laporan Mingguan Publik | ✅ Teruji | Berjalan dengan user read-only, laporan terkirim ke Telegram |
| Bot Admin Telegram | ⚠️ Siap, belum dijalankan | Koneksi read-only sudah tersedia, keputusan menyalakan ada di pengelola |
| Dokumentasi API (Swagger) | ❌ Tidak dikerjakan | Source code backend tidak tersedia di VPS |

---

## BAGIAN 1: MODUL SISTEM

### 1. Knowledge Base Lokal ("Buku Pintar")
*   **Konsep:** Menyimpan konteks Bukit Kasih dalam satu file agar konten yang dihasilkan konsisten dengan branding dan tidak mengarang data.
*   **Cara Kerja:** Informasi diekstrak dari kode frontend (`/var/www/bukit-kasih-frontend`) dan disimpan di `/home/ubuntu/Buku_Pintar_BukitKasih.md`. Bagian Merchandise dihapus karena merupakan data demo, bukan data nyata.
*   **Aturan:** Setiap pembuatan caption atau artikel tentang Bukit Kasih wajib membaca file ini terlebih dahulu.

### 2. Mesin Reels (`builder.py`)
*   **Konsep:** Membuat video vertikal 1080x1920 dari foto statis dengan musik, tanpa API musik Instagram.
*   **Cara Kerja:** Foto di `input/` diskalakan dan dipotong ke rasio 9:16, digabung dengan transisi crossfade, lalu audio `assets/backsound.m4a` dipotong sesuai durasi video dan digabungkan.
*   **Hasil:** `output/reels_final_with_music.mp4`.
*   **Batasan:** Dijalankan manual. Belum terhubung dengan pemantau destinasi.

### 3. Pemantau Destinasi (`watcher_destinations.py`)
*   **Konsep:** Mendeteksi destinasi baru di website agar bisa dibuatkan konten.
*   **Cara Kerja:** Berjalan via crontab setiap 12 jam (00:00 dan 12:00). Skrip hanya membaca tabel `destinations` menggunakan koneksi read-only. ID yang sudah diproses dicatat di `data/processed_destinations.txt`.
*   **Batasan saat ini:** Skrip baru mencetak destinasi yang terdeteksi. Pembuatan draft caption dan pengiriman ke Telegram untuk persetujuan (Human-in-the-Loop) **belum diimplementasikan**. Titik integrasinya sudah disiapkan di kode.

### 4. Auto-Moderator Ulasan — DINONAKTIFKAN
*   **Kondisi awal:** `review_analyzer.py` membaca tabel `reviews` (berisi data pengunjung) dan menjalankan `UPDATE reviews SET status = 'HIDDEN'` otomatis.
*   **Masalah:** Kebijakan akses data proyek hanya mengizinkan tabel publik dan operasi read-only. Modul ini melanggar keduanya.
*   **Tindakan:** Cronjob dihapus, skrip dipindah ke `scripts/_archive/`.
*   **Catatan untuk Bab 5 Skripsi:** Moderasi konten sebaiknya dilakukan di lapisan aplikasi (backend) dengan kontrol akses yang sah, bukan lewat skrip eksternal.

### 5. Laporan Mingguan Publik (`ai_analyst.py`)
*   **Konsep:** Ringkasan konten publik untuk admin.
*   **Cara Kerja:** Berjalan setiap Minggu pukul 17:00. Menghitung jumlah destinasi, aktivitas, dan pengumuman, lalu mengirim ringkasan HTML ke Telegram.
*   **Perubahan:** Versi sebelumnya membaca `reviews`, `bookmarks`, dan `inquiries`. Bagian itu sudah dihapus.
*   **Status:** Menunggu `DB_URL` read-only dikonfigurasi.

### 6. Bot Admin Telegram (`bot_command_center.py`)
*   **Perintah:** `/start`, `/laporan` (jumlah konten publik), `/destinasi` (5 destinasi terbaru).
*   **Keamanan:** Hanya merespons chat admin (`ADMIN_CHAT_ID`). Koneksi read-only.
*   **Perubahan:** Perintah `/ulasan` dihapus.
*   **Status:** Belum berjalan. Akan dinyalakan setelah `DB_URL` dikonfigurasi.

---

## BAGIAN 2: KEAMANAN DAN KEPATUHAN DATA

### Kebijakan
*   **Zero-Access untuk PII:** Tabel `users`, `reviews`, `inquiries`, `bookmarks`, dan `hermes_messages` tidak boleh diakses skrip atau agen otomatis.
*   **Read-only:** Semua skrip hanya boleh membaca tabel publik: `destinations`, `activities`, `announcements`.

### Pelanggaran yang Ditemukan dan Diperbaiki
Saat audit, ditemukan sejumlah pelanggaran dari pengembangan sebelumnya:
1. `review_analyzer.py` membaca tabel PII dan melakukan operasi tulis.
2. `bot_command_center.py` dan `ai_analyst.py` membaca tabel PII.
3. Kredensial database dan token Telegram tertulis langsung di dalam kode (6 file).
4. Saat pengujian, data ulasan palsu dimasukkan dan dihapus dari tabel `reviews`. Ini juga merupakan operasi tulis ke tabel PII.

### Perbaikan yang Sudah Dilakukan
*   Cronjob `review_analyzer` dihapus. Backup crontab lama tersimpan di `backup/`.
*   Skrip bermasalah dipindah ke `scripts/_archive/`.
*   Skrip aktif ditulis ulang agar hanya membaca tabel publik, dengan koneksi `default_transaction_read_only=on`.
*   Kredensial dipindah ke `/home/ubuntu/reels_maker/.env` (izin `600`). File `.gitignore` mengecualikan `.env`.
*   Hasil pengecekan terakhir: tidak ada kredensial tertulis di skrip aktif.

### Tindakan yang Masih Diperlukan
*   **Rotasi password Supabase.** Password lama sudah muncul di riwayat chat dan file arsip.
*   **Buat user database read-only khusus** dengan `SELECT` hanya pada tiga tabel publik, lalu isi `DB_URL` di `.env`.
*   **Bersihkan `scripts/_archive/`** dari kredensial lama setelah rotasi password.

---

## BAGIAN 3: MASALAH OPERASIONAL YANG DICATAT

### Error HTTP 402 pada Hermes Agent
*   **Gejala:** Pesan "Insufficient available credits" muncul berulang, dan beberapa pesan chat tidak dibalas.
*   **Bukti dari log gateway:** Error 402 tercatat pada model `google/gemini-3.1-pro-preview` melalui provider Nous. Pesan error menyebut batas *max output tokens*.
*   **Koreksi:** Dugaan awal bahwa kredit hangus tengah malam, atau bahwa cronjob bertabrakan dengan chat, belum terbukti dan tidak boleh dijadikan dasar laporan.
*   **Mitigasi yang direncanakan:** Batasi output token, gunakan sesi baru secara berkala, dan siapkan provider cadangan.

### Konflik Token Bot Telegram
*   Saat satu token digunakan oleh dua proses (Hermes Gateway dan skrip Python), pesan tidak terkirim dan status "Typing..." macet.
*   **Solusi:** Setiap proses wajib memakai token bot yang berbeda.

### Logrotate
*   Folder `logs/` sebelumnya berizin `775`, sehingga logrotate menolak memprosesnya.
*   **Perbaikan:** Izin diubah ke `755`, konfigurasi `/etc/logrotate.d/reels_maker_logs` memakai `su ubuntu ubuntu`. Rotasi harian, simpan 30 hari, dikompres.

---

## BAGIAN 4: HASIL AUDIT & CROSSCHECK SKRIPSI (BAB 4)

Dokumen Bab 4 dibandingkan dengan struktur database Supabase asli.

**Ketidaksesuaian nama entitas:**
*   `banners` di skripsi ➡️ `announcements` di database
*   `landmarks` di skripsi ➡️ `destinations` di database
*   `knowledge_base` di skripsi ➡️ `knowledge_documents` di database
*   `chat_logs` di skripsi ➡️ `hermes_messages` di database
*   `contents` dan `activity_logs` ada di skripsi, tetapi tidak ada di database
*   `activities` ada di database, tetapi tidak dijelaskan di skripsi

**Tindakan yang disarankan:** Revisi ERD, Use Case, Activity Diagram, dan Sequence Diagram agar sesuai dengan database.

**Catatan tambahan untuk Bab 4:** Fitur Auto-Moderator dan Human-in-the-Loop Telegram yang dijelaskan dalam rancangan belum sepenuhnya diimplementasikan. Sebaiknya ditulis sebagai rencana pengembangan, bukan fitur yang sudah berjalan, kecuali sudah diuji ulang.

---

## BAGIAN 5: ARSITEKTUR INFRASTRUKTUR (VPS)

```
/home/ubuntu/reels_maker/
├── .env                  # kredensial (izin 600, tidak di-commit)
├── .env.example          # template kredensial
├── .gitignore
├── README.md             # dokumentasi operasional
├── assets/               # backsound.m4a
├── input/                # foto sumber
├── output/               # hasil render MP4
├── data/                 # processed_destinations.txt (penanda ID)
├── logs/                 # log cron, dirotasi harian
├── backup/               # backup crontab
├── scripts/
│   ├── builder.py                # render reels (FFmpeg)
│   ├── watcher_destinations.py   # pemantau destinasi (cron)
│   ├── ai_analyst.py             # laporan mingguan publik (cron)
│   ├── bot_command_center.py     # bot admin Telegram (manual)
│   └── _archive/                 # skrip yang melanggar kebijakan
└── .venv/                # lingkungan Python terisolasi
```

### Jadwal Otomatis (crontab)

| Skrip | Jadwal | Fungsi |
|---|---|---|
| `watcher_destinations.py` | Setiap 12 jam (00:00, 12:00) | Deteksi destinasi baru |
| `ai_analyst.py` | Minggu 17:00 | Ringkasan konten publik ke Telegram |

Seluruh jadwal berjalan melalui crontab Linux, sehingga tidak menggunakan kredit API.

---

## BAGIAN 6: YANG BELUM DIKERJAKAN

1. Dokumentasi API (Swagger/OpenAPI). Tidak dikerjakan karena folder backend hanya berisi binary, bukan source code.
2. Integrasi pemantau destinasi dengan pembuatan draft dan persetujuan Telegram.
3. Integrasi dengan Composio untuk posting Instagram otomatis setelah persetujuan.
4. Moderasi ulasan yang sah di sisi backend.
5. Provider cadangan (fallback) untuk LLM.

---

*Laporan ini diperbarui otomatis oleh Hermes Agent sebagai ringkasan teknis proyek Bukit Kasih. Dokumen ini tidak memuat kredensial.*

---

## RIWAYAT PENGERJAAN

**Tanggal:** Kamis, 15 Oktober 2026 (sesi pagi hingga sore, WIB)

### Tugas yang Diselesaikan
1. **Audit sistem.** Memeriksa crontab, skrip, folder, dan akses tabel. Ditemukan pelanggaran kebijakan Zero-Access.
2. **Nonaktifkan auto-moderator ulasan.** Cron `review_analyzer.py` dihapus. Backup crontab lama tersimpan di `backup/`.
3. **Hapus akses PII dari skrip aktif.** `ai_analyst.py`, `bot_command_center.py`, dan `watcher_destinations.py` ditulis ulang agar hanya membaca tabel publik, dengan koneksi read-only.
4. **Arsipkan skrip berisiko, lalu hapus arsip.** `review_analyzer.py`, `watcher_db.py`, dan `audit_erd.py` dipindah ke arsip, lalu arsip dihapus karena berisi kredensial lama. `__pycache__` juga dibersihkan.
5. **Pindahkan kredensial ke `.env`.** File `.env` berizin `600`. `.gitignore` dibuat agar `.env` tidak ikut ter-commit. Pengecekan menunjukkan tidak ada kredensial tertulis di skrip aktif.
6. **Perbaiki logrotate.** Izin folder `logs/` diubah ke `755`. Konfigurasi di `/etc/logrotate.d/reels_maker_logs` aktif, rotasi harian, simpan 30 hari.
7. **Rapikan struktur folder dan dokumentasi.** Dibuat `README.md`, `.env.example`, folder `data/`, dan `HANDOFF.md` untuk konteks sesi berikutnya.
8. **Rotasi password database Supabase.** Password user `postgres` diganti. Service `bukitkasih.service` diperbarui (`DB_SOURCE`), di-restart, dan terhubung ke Supabase.
9. **Buat user database read-only.** Role `bukitkasih_readonly` dibuat dengan `SELECT` hanya pada `destinations`, `activities`, dan `announcements`.
10. **Hubungkan skrip Hermes ke database read-only.** `DB_URL` di `.env` terisi. Tes `watcher_destinations.py` dan `ai_analyst.py` berhasil.

### Tugas yang Belum Dikerjakan
- **Cabut token bot analyst** (`8899671406`). Token ini pernah muncul di chat dan masih aktif. Tidak memutus chat.
- **Ganti token gateway** (`8640822059`). Ditunda atas keputusan pengelola. Token ini sudah beberapa kali muncul di chat.
- **Amankan `.env` backend** (`/home/ubuntu/bukit-kasih-backend/.env`) dengan `chmod 600`. Saat pengecekan, izinnya masih `664`.
- **Hapus skrip pengatur sementara** `scripts/set_db_url.py`.
- **Verifikasi penyebab error HTTP 402** di dashboard Nous Portal. Penyebab yang sempat diduga belum terbukti.
- **Implementasi human-in-the-loop** untuk draft caption dan posting Instagram.
- **Moderasi ulasan di backend** sebagai pengganti modul yang dinonaktifkan.
- **Dokumentasi API (Swagger).** Tidak dikerjakan karena source `.go` tidak tersedia di VPS.

### Catatan Keamanan
- Password database lama dan token bot analyst pernah muncul di riwayat chat. Password database sudah diganti. Token bot analyst belum.
- Riwayat chat dan log Hermes di `~/.hermes/` masih menyimpan nilai lama. Ini perlu diperhatikan jika sistem dipakai pihak lain.
