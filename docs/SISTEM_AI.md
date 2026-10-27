# 🤖 DOKUMENTASI SISTEM GENERATIVE AI & OTOMASI KONTEN
## Sistem Informasi dan Smart Tourism Branding Bukit Kasih Kanonang
* **Proyek:** Otomasi Pembuatan Konten, Pemantauan Destinasi & Asisten Cerdas Pariwisata
* **Target Sistem:** VPS Produksi (`/home/ubuntu/reels_maker/`)
* **Status Modul:** Berjalan dengan Kebijakan Keamanan Zero-Access PII (Read-Only)

---

## 📋 1. Ringkasan Status Modul

| Modul | Status | Deskripsi & Batasan Operasional |
|---|:---:|---|
| **Knowledge Base "Buku Pintar"** | ✅ Berjalan | File markdown acuan kontekstual branding Bukit Kasih tanpa mengarang data palsu (*halusinasi*). |
| **Mesin Reels (`builder.py`)** | ✅ Berjalan | Engine pembuat video vertikal 9:16 dari foto statis dengan audio backsound via FFmpeg. |
| **Pemantau Destinasi (`watcher_destinations.py`)** | ✅ Teruji | Cronjob 12 jam (00:00 & 12:00) untuk deteksi destinasi baru di website menggunakan akun database read-only. |
| **Laporan Mingguan Publik (`ai_analyst.py`)** | ✅ Teruji | Cronjob Minggu 17:00 merangkum data konten publik (destinasi, aktivitas, pengumuman) ke Telegram. |
| **Bot Admin Telegram (`bot_command_center.py`)** | ⚠️ Siaga | Command center admin (`/start`, `/laporan`, `/destinasi`) via token bot terisolasi. |
| **Auto-Moderator Ulasan** | ⛔ Diarsipkan | Dinonaktifkan permanen karena melanggar kebijakan akses PII; digantikan moderasi resmi di backend. |

---

## 🛡️ 2. Kebijakan Keamanan Data (Zero-Access PII)

1. **Prinsip Zero-Access PII:** Seluruh tabel data pribadi pengguna (`users`, `reviews`, `inquiries`, `bookmarks`, `hermes_messages`) **dilarang keras** diakses oleh skrip otomatis atau agen AI mandiri di luar backend.
2. **Koneksi Database Read-Only:** Skrip otomasi di VPS hanya menggunakan akun database khusus `bukitkasih_readonly` dengan izin `SELECT` yang dibatasi pada 3 tabel publik saja:
   - `destinations`
   - `activities`
   - `announcements`
3. **Isolasi Lingkungan:** Skrip berjalan di dalam virtual environment Python terisolasi (`/home/ubuntu/reels_maker/.venv`) dengan kredensial `.env` berizin `chmod 600`.

---

## 🏗️ 3. Arsitektur Folder VPS (`/home/ubuntu/reels_maker/`)

```
/home/ubuntu/reels_maker/
├── .env                  # Kredensial lingkungan (chmod 600, tidak di-commit)
├── .env.example          # Template kredensial
├── assets/               # Audio backsound (backsound.m4a)
├── input/                # Foto sumber landscape/portrait
├── output/               # Hasil render video reels (MP4)
├── data/                 # processed_destinations.txt (cache ID)
├── logs/                 # Log cron, dirotasi otomatis oleh logrotate
├── scripts/
│   ├── builder.py                # Engine render reels (FFmpeg)
│   ├── watcher_destinations.py   # Pemantau destinasi (cron)
│   ├── ai_analyst.py             # Laporan mingguan konten (cron)
│   └── bot_command_center.py     # Command center admin Telegram
└── .venv/                # Python Virtual Environment
```

---

## 🔄 4. Sinkronisasi Skripsi (Bab 4) & Entitas Database Asli

Untuk menjaga keabsahan data pada dokumen skripsi:
* `banners` di naskah skripsi ➡️ entitas aslinya adalah **`announcements`** di database.
* `landmarks` di naskah skripsi ➡️ entitas aslinya adalah **`destinations`** di database.
* `knowledge_base` di naskah skripsi ➡️ entitas aslinya adalah **`knowledge_documents`** di database.
* `chat_logs` di naskah skripsi ➡️ entitas aslinya adalah **`hermes_messages`** di database.
