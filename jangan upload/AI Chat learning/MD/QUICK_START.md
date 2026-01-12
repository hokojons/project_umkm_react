# ⚡ Quick Start Guide - Gabung React + Laravel

Panduan cepat untuk menjalankan aplikasi full-stack dalam 5 menit!

## 🚀 Step-by-Step

### Terminal 1: Setup Database & Laravel Backend

```bash
# 1. Masuk ke folder Laravel
cd "c:\Coding\Pak andre web\,\Laravel"

# 2. Install dependencies (jika belum)
composer install

# 3. Update .env dengan database credentials
# Edit Laravel/.env:
# DB_CONNECTION=mysql
# DB_DATABASE=dbumkm
# DB_USERNAME=root
# DB_PASSWORD=

# 4. Generate app key (jika belum)
php artisan key:generate

# 5. Jalankan migrations
php artisan migrate

# 6. Seed database dengan test data (opsional)
php artisan db:seed

# 7. Start Laravel server
php artisan serve
```

**Output:** Server running pada `http://localhost:8000`

---

### Terminal 2: Setup React Frontend

```bash
# 1. Masuk ke folder React
cd "c:\Coding\Pak andre web\,\Food and Beverage Website (Copy)"

# 2. Install dependencies (jika belum)
npm install

# 3. Pastikan .env sudah ada dengan:
# VITE_API_BASE_URL=http://localhost:8000/api

# 4. Start React development server
npm run dev
```

**Output:** Application running pada `http://localhost:5173`

---

## ✅ Verifikasi Setup

### Cek Status Database

```bash
cd Laravel
php artisan tinker

>>> DB::table('users')->count()
>>> DB::table('products')->count()
>>> exit
```

### Cek API Endpoints

Buka browser atau gunakan Postman:

1. **Get All Products**

   ```
   GET http://localhost:8000/api/products
   ```

2. **Get All Events**

   ```
   GET http://localhost:8000/api/events
   ```

3. **Get Categories**
   ```
   GET http://localhost:8000/api/categories
   ```

### Cek React Connectivity

Buka Chrome DevTools → Network tab

- Buka `http://localhost:5173`
- Lihat request ke `http://local<?php
  > > > DB::table('users')->count()
  > > > exit()host:8000/api/...`
- Jika ada request dan response, berarti sudah connected ✅

---

## 📱 Credentials untuk Login Test

Dari seeder data:

| Email/Phone  | Password    | Role             |
| ------------ | ----------- | ---------------- |
| 081234567890 | password123 | UMKM (Budi)      |
| 082345678901 | password123 | UMKM (Siti)      |
| 083456789012 | password123 | Customer (Ahmad) |

---

## 🐛 Quick Troubleshooting

### Error: CORS issue

**Solusi:** Pastikan `config/cors.php` allow all origins atau sesuaikan dengan React URL

### Error: Database connection

**Solusi:**

```bash
# Check database exists
mysql -u root -p dbumkm

# Check Laravel .env DB credentials
# Pastikan MySQL service running
```

### Error: Port already in use

**Solusi:**

```bash
# Laravel (ubah port)
php artisan serve --port=8001

# React (ubah port di vite.config.ts)
npm run dev -- --port 5174
```

### Error: npm dependencies issue

**Solusi:**

```bash
# Clear cache dan reinstall
rm -r node_modules package-lock.json
npm install
```

---

## 📡 API Documentation

Semua endpoints tersedia di [SETUP_INTEGRATION.md](./SETUP_INTEGRATION.md#-api-endpoints)

---

**Happy coding! 🎉 Jika ada pertanyaan, check SETUP_INTEGRATION.md untuk dokumentasi lengkap.**
