# 🔌 PANDUAN KONEKSI BACKEND & DATABASE

**Tanggal:** 11 Januari 2026  
**Status:** Memastikan koneksi React → Laravel → XAMPP MySQL

---

## 📊 RINGKASAN CODE ANDA

### ✅ Yang Sudah Ada

1. **Backend Laravel** - Laravel 12.43.1 ✅
   - Location: `C:\Coding\Pak andre web\,\Laravel`
   - API Controllers sudah lengkap
   - Routes sudah dikonfigurasi

2. **Frontend React** - React 18 + TypeScript ✅
   - Location: `C:\Coding\Pak andre web\,\React`
   - API services sudah ada
   - Base URL: `http://localhost:8000/api`

3. **Database** - MySQL (XAMPP) ✅
   - Database name: `dbumkm`
   - 19 tables (14 main + 5 Laravel system)
   - Test data sudah ada

---

## 🔧 LANGKAH-LANGKAH KONEKSI

### STEP 1: Pastikan XAMPP MySQL Running

1. **Buka XAMPP Control Panel**
2. **Start Apache** (untuk phpMyAdmin)
3. **Start MySQL**
4. **Verify database exists:**
   - Buka browser: `http://localhost/phpmyadmin`
   - Cek database `dbumkm` ada
   - Pastikan ada 19 tables

---

### STEP 2: Konfigurasi Laravel `.env`

File `.env` Anda di-gitignore (aman). Pastikan isinya seperti ini:

**Location:** `C:\Coding\Pak andre web\,\Laravel\.env`

```env
APP_NAME="Pasar UMKM"
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dbumkm
DB_USERNAME=root
DB_PASSWORD=

# Session & Cache
SESSION_DRIVER=file
CACHE_STORE=file

# CORS Configuration (untuk React)
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
SESSION_DOMAIN=localhost
```

**PENTING:**
- `DB_DATABASE=dbumkm` (sesuai database XAMPP Anda)
- `DB_USERNAME=root` (default XAMPP)
- `DB_PASSWORD=` (kosong, default XAMPP)

---

### STEP 3: Generate Laravel App Key (Jika Belum)

Jika `.env` belum punya `APP_KEY`, jalankan:

```bash
cd "C:\Coding\Pak andre web\,\Laravel"
php artisan key:generate
```

---

### STEP 4: Test Koneksi Database

Jalankan command ini untuk test koneksi:

```bash
cd "C:\Coding\Pak andre web\,\Laravel"
php artisan db:show
```

**Expected Output:**
```
MySQL 8.x.x
Database: dbumkm
Host: 127.0.0.1
Port: 3306
```

Jika error, berarti:
- ❌ MySQL belum running di XAMPP
- ❌ Database `dbumkm` belum dibuat
- ❌ `.env` salah konfigurasi

---

### STEP 5: Konfigurasi React `.env`

Buat file `.env` di folder React (jika belum ada):

**Location:** `C:\Coding\Pak andre web\,\React\.env`

```env
# Laravel API Base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Mock Mode (set false untuk connect ke Laravel)
VITE_MOCK_MODE=false
```

**PENTING:**
- `VITE_API_BASE_URL` harus sesuai dengan Laravel server
- `VITE_MOCK_MODE=false` untuk koneksi real

---

### STEP 6: Konfigurasi CORS di Laravel

Pastikan file `config/cors.php` sudah benar:

**Location:** `C:\Coding\Pak andre web\,\Laravel\config\cors.php`

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

### STEP 7: Start Backend Server

```bash
cd "C:\Coding\Pak andre web\,\Laravel"
php artisan serve
```

**Expected Output:**
```
INFO  Server running on [http://127.0.0.1:8000].
```

**Jangan tutup terminal ini!** Biarkan running.

---

### STEP 8: Start Frontend Server

Buka terminal baru:

```bash
cd "C:\Coding\Pak andre web\,\React"
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### STEP 9: Test Koneksi API

**Test 1: Direct API Call**

Buka browser, akses:
```
http://localhost:8000/api/categories
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "kodekategori": "CAT001",
      "namakategori": "Makanan",
      ...
    }
  ]
}
```

**Test 2: Login API**

Buka browser, akses:
```
http://localhost:8000/api/auth/login
```

Harusnya error 405 (Method Not Allowed) karena butuh POST.
Ini berarti route ada!

---

### STEP 10: Test dari React App

1. Buka browser: `http://localhost:5173`
2. Klik tombol **Login**
3. Masukkan credentials:
   - Username: `admin`
   - Password: `admin123`
4. Klik **Login**

**Expected:**
- ✅ Login berhasil
- ✅ Redirect ke dashboard
- ✅ Nama user muncul di header

---

## 🐛 TROUBLESHOOTING

### Problem 1: "Network Error" di React

**Penyebab:**
- Laravel server belum running
- Base URL salah di React `.env`

**Solusi:**
```bash
# Check Laravel running
netstat -ano | findstr :8000

# Restart Laravel
cd "C:\Coding\Pak andre web\,\Laravel"
php artisan serve
```

---

### Problem 2: "CORS Error"

**Penyebab:**
- CORS tidak dikonfigurasi di Laravel

**Solusi:**
1. Edit `config/cors.php` (lihat STEP 6)
2. Restart Laravel server

---

### Problem 3: "Database Connection Failed"

**Penyebab:**
- MySQL belum running di XAMPP
- Database `dbumkm` belum dibuat
- `.env` salah

**Solusi:**
```bash
# 1. Start MySQL di XAMPP Control Panel
# 2. Check database exists
# 3. Test connection
php artisan db:show
```

---

### Problem 4: "404 Not Found" untuk API

**Penyebab:**
- Route belum didefinisikan
- Base URL salah

**Solusi:**
```bash
# Check all routes
php artisan route:list --path=api
```

---

### Problem 5: "500 Internal Server Error"

**Penyebab:**
- Error di Laravel controller
- Database query error

**Solusi:**
```bash
# Check Laravel log
tail -f storage/logs/laravel.log

# Atau buka file:
# C:\Coding\Pak andre web\,\Laravel\storage\logs\laravel.log
```

---

## ✅ CHECKLIST KONEKSI

Gunakan checklist ini untuk memastikan semua terkoneksi:

### Backend
- [ ] XAMPP MySQL running
- [ ] Database `dbumkm` exists dengan 19 tables
- [ ] Laravel `.env` configured (DB_DATABASE=dbumkm)
- [ ] `php artisan db:show` berhasil
- [ ] `php artisan serve` running di http://localhost:8000

### Frontend
- [ ] React `.env` configured (VITE_API_BASE_URL)
- [ ] `npm run dev` running di http://localhost:5173
- [ ] Browser bisa akses http://localhost:5173

### API Connection
- [ ] http://localhost:8000/api/categories return JSON
- [ ] Login dari React berhasil
- [ ] Data UMKM muncul di homepage
- [ ] Admin panel bisa akses data

---

## 🎯 QUICK TEST SCRIPT

Saya sudah lihat Anda punya test scripts. Jalankan ini:

```bash
cd "C:\Coding\Pak andre web\,\Laravel"
php test_all_endpoints.php
```

**Expected:** 10/10 Endpoints Passed ✅

---

## 📁 FILE PENTING UNTUK KONEKSI

### Laravel Backend
```
Laravel/
├── .env                          # Database config (EDIT INI!)
├── config/
│   ├── database.php             # Database settings
│   └── cors.php                 # CORS settings
├── routes/
│   └── api.php                  # API routes
└── app/Http/Controllers/Api/    # API controllers
```

### React Frontend
```
React/
├── .env                          # API URL config (BUAT INI!)
├── src/
│   ├── config/
│   │   └── api.ts               # Base URL configuration
│   └── services/
│       ├── api.ts               # Axios client
│       └── authService.ts       # Auth API calls
```

---

## 🚀 NEXT STEPS SETELAH KONEKSI

Setelah semua terkoneksi, Anda bisa:

1. **Test fitur-fitur utama:**
   - Login sebagai admin/UMKM/user
   - CRUD operations
   - Upload images
   - Cart & checkout

2. **Fix known issues:**
   - Event registration 404
   - Password hashing
   - File upload validation

3. **Add new features:**
   - Pagination
   - Search & filter
   - Email notifications

---

## 📞 NEED HELP?

Jika masih ada masalah, berikan info:
1. Error message lengkap
2. Screenshot jika perlu
3. Laravel log (`storage/logs/laravel.log`)
4. Browser console error (F12)

---

**Good luck! 🚀**
