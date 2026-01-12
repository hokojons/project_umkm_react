# Panduan Registrasi Akun (Backend Ready)

## ✅ Backend Sudah Siap!

Backend sudah berjalan dengan baik di `http://localhost:8000`

### Akun Login yang Tersedia (untuk testing):

1. **Email**: `test@example.com` | **Password**: `password123`
2. **Email**: `budi@example.com` | **Password**: `password123`
3. **Email**: `siti@example.com` | **Password**: `password123`
4. **Email**: `ahmad@example.com` | **Password**: `password123`

---

## 📝 Cara Membuat Akun Baru di Frontend

### Proses Registrasi:

1. **Klik "Daftar Akun"** di LoginModal
2. **Isi Form**:

    - Nama: (minimal 1 karakter)
    - Email: (format email valid)
    - Password: (minimal 6 karakter)
    - Pilih tipe: User atau UMKM

3. **Verifikasi WhatsApp (2FA)**:
    - Masukkan nomor WhatsApp dalam format: `08XXXXXXXXXX` atau `628XXXXXXXXXX`
    - Sistem akan otomatis format ke `62XXXXXXXXXX`
    - Contoh: `08123456789` → `6281234567890`
4. **Klik "Kirim OTP"**:

    - Sistem generate kode OTP 6 digit
    - Link WhatsApp otomatis muncul
    - Klik tombol "Buka WhatsApp" untuk copy kode

5. **Input Kode OTP**:

    - Copy kode OTP dari pesan WhatsApp
    - Paste ke kolom OTP (6 digit)
    - Klik "Verifikasi & Daftar"

6. **Selesai!** Akun berhasil dibuat dan langsung login

---

## 🔧 Format Nomor WhatsApp yang Valid:

✅ **Format yang diterima**:

-   `08123456789` (akan diformat ke `6281234567890`)
-   `628123456789` (sudah benar)
-   `+628123456789` (plus akan dihapus, jadi `6281234567890`)

❌ **Format yang ditolak**:

-   `8123456789` (kurang kode negara)
-   `0281234567` (terlalu pendek, minimal 9 digit setelah 62)
-   `628123456789012345` (terlalu panjang, maksimal 12 digit setelah 62)

**Regex validation**: `^62[0-9]{9,12}$`

---

## 🧪 Testing Backend (Sudah Dicoba & Berhasil)

### Test 1: Registration Flow

```bash
cd "c:\Coding\Pak andre web\,\Laravel"
php test_registration_flow.php
```

✅ **Result**: User berhasil dibuat dengan OTP verification

### Test 2: Login API

```bash
php test_login_api.php
```

✅ **Result**: Login berhasil dengan email & password

### Test 3: Check Users

```bash
php test_check_users.php
```

✅ **Result**: 13+ users di database

---

## 🚀 Langkah Selanjutnya untuk Frontend

### 1. Pastikan Server Berjalan:

```bash
# Terminal 1 - Laravel Backend
cd "c:\Coding\Pak andre web\,\Laravel"
php artisan serve

# Terminal 2 - React Frontend
cd "c:\Coding\Pak andre web\,\React + vite"
npm run dev
```

### 2. Buka Browser:

-   Frontend: `http://localhost:5173`
-   Backend API: `http://localhost:8000`

### 3. Test Registrasi:

1. Klik "Daftar Akun"
2. Isi data dengan nomor WA: `08123456789`
3. Ikuti proses verifikasi OTP
4. Seharusnya akun berhasil dibuat!

---

## 🐛 Troubleshooting

### Error: "Format nomor tidak valid"

-   Pastikan nomor dimulai dengan `08` atau `62`
-   Panjang nomor: 10-13 digit (format 08...) atau 12-14 digit (format 62...)
-   Contoh valid: `081234567890` atau `6281234567890`

### Error: "Invalid or expired OTP"

-   OTP berlaku 5 menit
-   Request OTP baru jika expired
-   Pastikan copy kode yang benar (6 digit)

### Error: "Email/Telepon sudah terdaftar"

-   Coba gunakan email lain
-   Atau login dengan akun yang sudah ada

### Error: "Network error" atau "Failed to fetch"

-   Pastikan Laravel server berjalan di port 8000
-   Check CORS settings (sudah dikonfigurasi)
-   Check browser console untuk detail error

---

## 📊 Database Structure

**Tabel**: `users`

Kolom utama:

-   `id` (string, PK) - format: `wa_TIMESTAMP` atau `USER_XXX` atau `TEST_XXX`
-   `nama` (string) - Nama lengkap user
-   `email` (string, unique) - Email user
-   `telepon` (string, unique) - Nomor telepon/WA
-   `password` (string, hashed) - Password (bcrypt)
-   `no_whatsapp` (string) - Nomor WA (format 62...)
-   `status_verifikasi_wa` (enum) - verified/pending/null
-   `status` (enum) - active/inactive
-   `alamat`, `kota`, `kode_pos` - Data tambahan

**Tabel**: `wa_verifications`

Tracking OTP verification:

-   `phone_number` (string) - Nomor WA
-   `code` (string) - Kode OTP 6 digit
-   `type` (enum) - user/business
-   `expires_at` (datetime) - Waktu kadaluarsa
-   `is_verified` (boolean) - Status verifikasi
-   `verified_at` (datetime) - Waktu verifikasi

---

## ✨ Features yang Sudah Working

✅ User Registration dengan WhatsApp 2FA
✅ OTP Generation & Verification (5 menit berlaku)
✅ Password Hashing (bcrypt)
✅ User Login (email/phone + password)
✅ Profile Update
✅ CORS Configuration
✅ Validation & Error Handling
✅ Database Migrations & Models
✅ API Endpoints Complete

---

## 🎯 Next Steps

1. **Frontend**: Test registrasi di browser
2. **UX**: Improve error messages
3. **Features**: Add business registration flow
4. **Security**: Add rate limiting untuk OTP
5. **Testing**: Create automated tests

---

**Status**: 🟢 Backend Ready for Production Testing
**Last Updated**: December 19, 2025
