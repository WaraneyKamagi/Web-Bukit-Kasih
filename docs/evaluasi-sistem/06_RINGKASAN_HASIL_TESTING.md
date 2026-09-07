# 🧪 06. Ringkasan Hasil Testing & Verifikasi Sistem
## Sistem Informasi Pariwisata Bukit Kasih Kanonang & AI Assistant Hub

Dokumen ini mendokumentasikan hasil pengujian perangkat lunak, mencakup pengujian otomatis (*Automated Unit & Integration Testing*), pengujian skenario gagal (*Negative Scenario Testing*), serta verifikasi build produksi.

---

### 1. Ringkasan Eksekusi Pengujian Otomatis (Backend)

* **Test Suite File**: [`backend/tests/api_test.go`](file:///c:/Users/slarkboy/OneDrive/Documents/Website%20Bukit%20kasih/Bukit-Kasih/backend/tests/api_test.go)
* **Lingkungan Pengujian**: In-Memory SQLite (`:memory:`) terisolasi dengan auto-migrasi skema.
* **Perintah Eksekusi**: `go test -v ./tests/...`

```text
=== RUN   TestHealthCheck
--- PASS: TestHealthCheck (0.10s)
=== RUN   TestAuthRegisterAndLogin
--- PASS: TestAuthRegisterAndLogin (0.24s)
=== RUN   TestRBACAndAuthorization
--- PASS: TestRBACAndAuthorization (0.20s)
=== RUN   TestReviewAndInquiryValidation
--- PASS: TestReviewAndInquiryValidation (0.10s)
=== RUN   TestRateLimiterEnforcement
--- PASS: TestRateLimiterEnforcement (0.00s)
=== RUN   TestRAGSemanticRetrievalAndChatbot
--- PASS: TestRAGSemanticRetrievalAndChatbot (0.19s)
PASS
ok      bukit-kasih-backend/tests       1.157s
```
* **Hasil Keseluruhan**: **6/6 Test Suite LULUS (100% Passed)** dalam durasi **1.15 detik**.

---

### 2. Matriks Pengujian Skenario (Kasus Positif & Negatif)

| ID Uji | Skenario Pengujian | Kategori | Input / Aksi | Ekspektasi Sistem | Status |
|:---:|:---|:---:|:---|:---|:---:|
| **TC-01** | Uptime Health Check | Positif | `GET /api/health` | Status HTTP 200 OK, payload status `"ok"` | <kbd>✅ Lolos</kbd> |
| **TC-02** | Registrasi Akun Valid | Positif | `POST /api/auth/register` dengan data lengkap | Status HTTP 201 Created | <kbd>✅ Lolos</kbd> |
| **TC-03** | Registrasi Email Duplikat | **Negatif** | `POST /api/auth/register` dengan email yang sudah ada | Status HTTP 409 Conflict | <kbd>✅ Lolos</kbd> |
| **TC-04** | Registrasi Password Pendek | **Negatif** | `POST /api/auth/register` dengan password < 6 karakter | Status HTTP 400 Bad Request | <kbd>✅ Lolos</kbd> |
| **TC-05** | Login Kredensial Benar | Positif | `POST /api/auth/login` (email + password benar) | Status HTTP 200 OK + Token JWT valid | <kbd>✅ Lolos</kbd> |
| **TC-06** | Login Password Salah | **Negatif** | `POST /api/auth/login` (password salah) | Status HTTP 401 Unauthorized | <kbd>✅ Lolos</kbd> |
| **TC-07** | Akses Endpoint Tanpa Token | **Negatif** | `GET /api/auth/profile` tanpa header auth | Status HTTP 401 Unauthorized | <kbd>✅ Lolos</kbd> |
| **TC-08** | Akses Token Palsu / Expired | **Negatif** | `GET /api/auth/profile` dengan token rusak | Status HTTP 401 Unauthorized | <kbd>✅ Lolos</kbd> |
| **TC-09** | Wisatawan Akses Rute Admin | **Negatif** | Wisatawan mencoba `POST /api/announcements` | Status HTTP 403 Forbidden | <kbd>✅ Lolos</kbd> |
| **TC-10** | Admin Akses Rute Admin | Positif | Admin `POST /api/announcements` | Status HTTP 200 OK | <kbd>✅ Lolos</kbd> |
| **TC-11** | Review Rating Di Luar Batas | **Negatif** | `POST /api/reviews` dengan `rating: 10` | Status HTTP 400 Bad Request (Max 5) | <kbd>✅ Lolos</kbd> |
| **TC-12** | Review Valid | Positif | `POST /api/reviews` dengan `rating: 5` | Status HTTP 201 Created | <kbd>✅ Lolos</kbd> |
| **TC-13** | Format Email Inquiry Rusak | **Negatif** | `POST /api/inquiries` dengan email non-valid | Status HTTP 400 Bad Request | <kbd>✅ Lolos</kbd> |
| **TC-14** | Rate Limiter Throttling | **Negatif** | Spamming request > threshold limit | Status HTTP 429 Too Many Requests | <kbd>✅ Lolos</kbd> |
| **TC-15** | RAG Semantic Context Search | Positif | User tanya "Harga tiket & jam buka" | RAG mengambil dokumen kategori 'destinasi' | <kbd>✅ Lolos</kbd> |
| **TC-16** | RAG Dynamic Knowledge Insertion | Positif | Admin menambah artikel festival baru | AI Chatbot langsung mengenali topik baru | <kbd>✅ Lolos</kbd> |
| **TC-17** | RAG Document Citations | Positif | `POST /api/chat` | Respon menyertakan array `citations` dokumen rujukan | <kbd>✅ Lolos</kbd> |

---

### 3. Hasil Verifikasi Build Frontend Produksi

* **Perintah**: `npm run build`
* **Waktu Build**: **298 ms**
* **Code Splitting Output**:
  * `Home.js`: 19.47 kB (Gzip: 5.75 kB)
  * `Experiences.js`: 16.94 kB (Gzip: 4.79 kB)
  * `Informasi.js`: 12.46 kB (Gzip: 3.24 kB)
  * `Sejarah.js`: 6.93 kB (Gzip: 2.01 kB)
  * `Profile.js`: 9.30 kB (Gzip: 2.53 kB)
  * `AdminDashboard.js`: 32.09 kB (Gzip: 7.45 kB)
  * `Index CSS`: 92.16 kB (Gzip: 13.58 kB)
  * `Vendor Core`: 470.85 kB (Gzip: 135.01 kB)
* **Status**: **0 Error, 0 Warnings**.
