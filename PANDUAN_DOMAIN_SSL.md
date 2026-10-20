# 🌐 PANDUAN LENGKAP: PERSIAPAN RILIS PUBLIK (DOMAIN & SSL HTTPS)
## Sistem Informasi dan Layanan Wisata Bukit Kasih Kanonang
* **Target IP VPS:** `43.163.4.205`  
* **Web Server:** Nginx (Ubuntu 24.04 LTS)  
* **Target Status:** Domain Resmi + Enkripsi SSL (HTTPS) + **SecurityHeaders Grade A+**  

---

## 📌 TAHAP 1: Pendaftaran Nama Domain

Pilihlah nama domain yang relevan dengan skripsi dan branding wisata, misalnya:
* `bukitkasih.com`
* `bukitkasih-kanonang.my.id`
* `wisatabukitkasih.id`

> 💡 **Tips Hemat:**  
> Untuk kebutuhan skripsi/kuliah, ekstensi **`.my.id`** sangat direkomendasikan karena harganya hanya berkisar **Rp 12.000 – Rp 15.000 / tahun** di penyedia lokal (seperti *Niagahoster, DomaiNesia, IDCloudHost, atau Rumahweb*).

---

## 📌 TAHAP 2: Pengaturan DNS Record (Menghubungkan Domain ke VPS)

Setelah domain aktif, buka menu **DNS Management** di dashboard tempat Anda membeli domain, lalu buat **2 DNS Record** berikut:

| Record Type | Name / Host | Target / IP Address | TTL | Fungsi |
|:---:|:---:|:---:|:---:|:---|
| **A** | `@` *(atau kosongkan)* | `43.163.4.205` | Auto / 3600 | Mengarahkan domain utama (`namadomain.com`) ke VPS |
| **A** *(atau CNAME)* | `www` | `43.163.4.205` | Auto / 3600 | Mengarahkan awalan `www.namadomain.com` ke VPS |

### Cara Memastikan DNS Sudah Tersambung:
Tunggu sekitar **10 – 30 menit** (proses propagasi DNS). Anda bisa mengujinya lewat PowerShell laptop Anda:
```powershell
ping namadomainanda.com
```
*Jika IP yang membalas adalah `43.163.4.205`, berarti domain sudah resmi tersambung ke VPS Anda!*

---

## 📌 TAHAP 3: Mendaftarkan Domain di Nginx VPS

Setelah DNS terhubung, buka terminal VPS Anda (`ubuntu@VM-15-119-ubuntu`):

1. **Buka file konfigurasi Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

2. **Ubah baris `server_name`:**
   Cari baris:
   ```nginx
   server_name _;
   ```
   Ubah menjadi nama domain Anda (pisahkan dengan spasi):
   ```nginx
   server_name namadomainanda.com www.namadomainanda.com;
   ```

3. **Perbarui baris Content-Security-Policy (CSP):**
   Di dalam blok CSP, tambahkan nama domain Anda pada direktif `connect-src`:
   ```nginx
   connect-src 'self' http://43.163.4.205 http://43.163.4.205:8080 https://namadomainanda.com https://*.supabase.co wss://*.supabase.co;
   ```

4. **Simpan & Keluar dari Nano:**
   * Tekan `Ctrl + O` lalu `Enter`
   * Tekan `Ctrl + X`

5. **Tes dan Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 📌 TAHAP 4: Memasang Sertifikat SSL Gratis (Certbot Let's Encrypt)

Certbot akan otomatis menerbitkan sertifikat SSL resmi dan mengatur pengalihan otomatis dari `http://` ke `https://`.

1. **Pasang Certbot di VPS:**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Jalankan Pemasangan SSL Otomatis:**
   ```bash
   sudo certbot --nginx -d namadomainanda.com -d www.namadomainanda.com
   ```
   * *Saat diminta email:* Masukkan email aktif Anda (untuk notifikasi pembaruan sertifikat).
   * *Saat diminta persetujuan Terms of Service:* Ketik `Y` lalu `Enter`.
   * *Saat ditanya berbagi email dengan EFF:* Ketik `N` atau `Y` bebas.
   * *Certbot akan otomatis memverifikasi domain Anda dan memasang SSL di Nginx.*

---

## 📌 TAHAP 5: Mengaktifkan HSTS untuk Meraih Grade A+ Sempurna

Setelah SSL terpasang, kita aktifkan header **`Strict-Transport-Security` (HSTS)**:

1. Buka kembali file Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```

2. Di dalam blok `server` yang mendengarkan SSL (`listen 443 ssl ...`), tambahkan baris ini tepat di bawah security headers yang lain:
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
   ```

3. Simpan (`Ctrl + O`, `Enter`, `Ctrl + X`), lalu reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 🏆 TAHAP 6: Verifikasi Akhir

1. Buka browser Anda:  
   👉 **`https://namadomainanda.com`**  
   *Perhatikan ikon gembok 🔒 di sebelah alamat web. Website kini 100% aman dan terenkripsi.*
2. Cek kembali di penguji keamanan:  
   👉 [SecurityHeaders.com](https://securityheaders.com)  
   *Hasil scan sekarang akan melonjak ke nilai tertinggi: **Grade A+ (Sempurna)**.*
