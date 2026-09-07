# 🔄 03. Penjelasan Data Flow Sistem
## Sistem Informasi Pariwisata Bukit Kasih Kanonang & AI Assistant Hub

Dokumen ini menguraikan bagaimana data mengalir dari input pengguna pada antarmuka web, diproses oleh API backend, divalidasi, disimpan ke database, hingga didistribusikan ke layanan eksternal.

---

### 1. Alur Autentikasi & Penerbitan Token (Login Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Wisatawan/Admin)
    participant FE as Frontend React (LoginModal)
    participant Rate as Middleware RateLimiter
    participant API as Backend (handlers.Login)
    participant DB as PostgreSQL (Supabase)

    User->>FE: Input Email & Password
    FE->>FE: Validasi format email & panjang password
    FE->>Rate: POST /api/auth/login (JSON Body)
    Note over Rate: Cek frekuensi request IP (< 10 req/min)
    Rate->>API: Teruskan request
    API->>DB: Query User berdasarkan Email (Parameterized)
    DB-->>API: Data User (termasuk Bcrypt Hash Password)
    API->>API: Verifikasi password via bcrypt.CompareHashAndPassword()
    alt Password Cocok
        API->>API: Buat JWT Claims (Email, Name, Role, Expire 24 Jam)
        API->>API: Sign Token dengan JWT Secret (HS256)
        API-->>FE: HTTP 200 OK + { token, user: { email, name, role } }
        FE->>FE: Simpan token ke localStorage & update AppContext state
        FE-->>User: Tampilkan UI terautentikasi & tutup modal
    else Password / Email Salah
        API-->>FE: HTTP 401 Unauthorized + { error: "Email atau password salah!" }
        FE-->>User: Tampilkan banner alert merah
    end
```

---

### 2. Alur Pengiriman & Moderasi Ulasan (Review Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Tourist as Wisatawan
    participant FE as Frontend (Experiences.jsx)
    participant API as Backend (handlers.CreateReview)
    participant DB as PostgreSQL (Supabase)
    actor Admin as Pengelola (Admin)

    Tourist->>FE: Pilih Destinasi, Beri Rating (1-5), Tulis Ulasan
    FE->>API: POST /api/reviews { activityId, author, rating, text }
    API->>API: Validasi input struct binding (Rating 1-5, Required fields)
    API->>DB: INSERT INTO reviews (activity_id, author, rating, text, date)
    DB-->>API: Review record tersimpan (ID, CreatedAt)
    API-->>FE: HTTP 201 Created + Review Object
    FE-->>Tourist: Ulasan langsung muncul di daftar & tampilkan Toast Sukses
    
    Note over Admin: Pengelola meninjau ulasan di Admin Dashboard
    Admin->>API: DELETE /api/reviews/:id (dengan Bearer Token)
    API->>API: Verifikasi AuthMiddleware() & AdminOnly()
    API->>DB: DELETE FROM reviews WHERE id = :id
    DB-->>API: Sukses
    API-->>Admin: HTTP 200 OK + Refresh list ulasan
```

---

### 3. Alur Siaran Peringatan Realtime (Emergency Announcement Broadcast)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Pengelola
    participant AdminFE as Admin Dashboard
    participant API as Backend (handlers.UpdateAnnouncement)
    participant DB as PostgreSQL (Supabase)
    participant Realtime as Supabase Realtime (WebSocket)
    participant TouristFE as Browser Wisatawan (Seluruh Pengguna Aktif)

    Admin->>AdminFE: Tulis teks pengumuman & klik "Perbarui & Siarkan"
    AdminFE->>API: POST /api/announcements { text: "Jalur licin akibat hujan..." }
    API->>API: Verifikasi JWT & Role == "Pengelola"
    API->>DB: Nonaktifkan pengumuman lama & INSERT pengumuman baru (is_active = true)
    DB-->>API: Data Announcement tersimpan
    API-->>AdminFE: HTTP 200 OK
    
    par Multi-Channel Sync
        AdminFE->>Realtime: Broadcast payload ke channel 'bukit-kasih-announcements'
        Realtime-->>TouristFE: Push WebSocket event 'announcement_update'
    and Local Sync
        AdminFE->>AdminFE: Kirim ke BroadcastChannel lokal browser
    end
    
    TouristFE->>TouristFE: State banner terupdate seketika
    TouristFE-->>TouristFE: Tampilkan AnnouncementBanner + Play Chime + Push Notification
```

---

### 4. Alur Percakapan Chatbot AI (Kawan Kasih)

```mermaid
sequenceDiagram
    autonumber
    actor Tourist as Wisatawan Terdaftar
    participant FE as ChatbotWidget.jsx
    participant API as Backend (/api/chat)
    participant Groq as Groq AI Cloud (Llama 3.3 70B)

    Tourist->>FE: Ketik: "Berapa jumlah anak tangga menuju puncak?"
    FE->>FE: Render bubble user & aktifkan typing indicator dots
    FE->>API: POST /api/chat { message: "..." } (dengan Bearer Token)
    API->>API: Verifikasi sesi wisatawan
    API->>API: Injeksi System Prompt & Knowledge Base Bukit Kasih (2.435 anak tangga, 5 tempat ibadah, belerang, sejarah Toar-Lumimuut)
    API->>Groq: Request Chat Completion (model: llama-3.3-70b-versatile, temp: 0.5)
    Groq-->>API: Respon teks AI terstruktur ramah & akurat
    API-->>FE: HTTP 200 OK + { reply: "Untuk mencapai puncak..." }
    FE->>FE: Nonaktifkan loading & render pesan asisten secara halus
```

---

### 5. Alur Asisten Pemasaran Hermes AI Studio & Instagram Auto-Publish

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Pengelola
    participant Console as Admin Dashboard (Hermes Tab)
    participant WebBridge as Backend (/api/hermes/*)
    participant Telegram as Telegram Bot API (@HermesBKUK_bot)
    participant HermesAgent as Hermes AI Engine (Gemini 3.1)
    participant MetaAPI as Composio / Instagram Graph API

    Admin->>Console: Klik "Buka Jendela Obrolan Telegram Web"
    Console->>Console: Luncurkan Pop-up Mini Window (https://web.telegram.org/k/#@HermesBKUK_bot)
    Admin->>Telegram: Kirim prompt: "Buatkan konten Instagram untuk promo liburan akhir pekan"
    Telegram->>HermesAgent: Teruskan pesan admin
    HermesAgent->>HermesAgent: Buat konsep visual & salinan caption dengan hashtag pariwisata
    HermesAgent-->>Telegram: Kirim draf gambar + caption + tombol konfirmasi persetujuan
    
    Note over Admin,HermesAgent: Human-in-the-Loop: Admin memeriksa draf
    Admin->>Telegram: Klik "Approve & Publish to Instagram"
    Telegram->>MetaAPI: Eksekusi Tool Composio Instagram Publish Post
    MetaAPI-->>Telegram: Postingan berhasil diterbitkan ke Instagram (@bukitkasih_official)
    Telegram-->>Admin: "✅ Postingan berhasil tayang di Instagram!"
    
    opt Sinkronisasi Log ke Web Dashboard
        Telegram->>WebBridge: Webhook / Polling sync update
        WebBridge->>Console: Update tabel riwayat pesan hermes_messages
    end
```
