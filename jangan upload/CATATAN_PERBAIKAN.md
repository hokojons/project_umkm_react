# 📝 CATATAN PERBAIKAN SESSION - 21 Desember 2025

## ✅ PERBAIKAN TERBARU

### 🖼️ **Fix Upload Foto - Dari Base64 ke File Upload** (LENGKAP)

**Masalah Sebelumnya:**

- Foto disimpan sebagai **base64 string** di database
- Database membengkak dan lambat (1 foto bisa 100-500 KB dalam base64)
- Query database jadi sangat lambat
- Ketika edit toko/produk, foto lama yang base64 masih tersimpan

**Solusi:**
✅ **Frontend (React):**

- Hapus fungsi `resizeImage()` yang convert ke base64
- Simpan **File object** di state, bukan base64 string
- Gunakan `URL.createObjectURL()` untuk preview only
- Kirim data pakai **FormData**, bukan JSON
- Support upload file foto toko dan foto produk
- Edit toko/produk juga sudah pakai file upload
- **PENTING**: Gunakan method POST dengan `_method=PUT` untuk update (Laravel tidak bisa terima file upload dengan PUT langsung)

✅ **Backend (Laravel):**

- Update `UmkmController.php` untuk terima **multipart/form-data**
- Upload foto ke folder `public/uploads/toko/` dan `public/uploads/produk/`
- Simpan **path file** di database, bukan base64
- Validasi file: max 5MB, format JPEG/PNG/GIF
- Auto delete foto lama saat update
- Fungsi `updateStore()` dan `updateProduct()` sudah support file upload
- Support Laravel method spoofing (\_method=PUT) untuk file upload

✅ **Database Cleanup:**

- Buat script `clean_base64_images.php` untuk bersihkan data base64 lama
- Semua base64 di column `foto_toko` (tumkm) dan `gambar` (tproduk) dihapus
- User perlu upload ulang foto mereka

**File yang Diubah:**

1. `React/src/components/SubmitBusinessModal.tsx` - Upload pakai FormData
2. `React/src/components/UMKMDashboard.tsx` - Edit toko/produk pakai file upload
3. `Laravel/app/Http/Controllers/Api/UmkmController.php` - Handle file upload
4. `Laravel/public/uploads/` - Folder untuk simpan foto
5. `Laravel/.gitignore` - Ignore uploaded files
6. `Laravel/clean_base64_images.php` - Script cleanup data base64 lama

**Struktur Upload:**

```
public/uploads/
  ├── toko/          → Foto toko/logo UMKM
  ├── produk/        → Foto produk
  └── .gitkeep       → Keep folder in git
```

**Format Penamaan File:**

- **Foto Toko**: `toko_[NamaToko]_[timestamp].ext`
  - Contoh: `toko_Warung_Makan_Berkah_1734812345.jpg`
- **Foto Produk**: `produk_[NamaProduk]_[timestamp]_[index].ext`
  - Contoh: `produk_Nasi_Goreng_Spesial_1734812345_0.jpg`
- Karakter spesial otomatis diganti underscore `_` untuk keamanan

**Hasil:**

- ✅ Database jadi ringan (hanya simpan path, bukan data gambar)
- ✅ Query jadi cepat
- ✅ File terorganisir di folder uploads
- ✅ Mudah backup/manage foto

**Bug yang Ditemukan & Diperbaiki:**

1. **Error 500 saat Submit Business** ❌→✅ (22 Des 2025)

   - **Error**: `Undefined variable: $validatedData` di UmkmController.php line 82
   - **Penyebab**: Pakai variabel `$validatedData['nama_toko']` yang tidak ada
   - **Solusi**: Ubah jadi `$request->nama_toko`
   - **File**: `UmkmController.php` - submit() method, line 82 dan line 157

2. **File Upload Tidak Masuk Database** ❌→✅ (21 Des 2025)

   - **Masalah**: Frontend kirim file tapi backend tidak terima (`ℹ️ No new image file in request`)
   - **Penyebab**: Laravel tidak bisa terima file upload dengan method `PUT`
   - **Solusi**:
     - Ubah method dari `PUT` → `POST` di frontend
     - Tambahkan `formData.append("_method", "PUT")` (Laravel method spoofing)
     - Backend tetap pakai route PUT, tapi terima request POST dengan `_method=PUT`
   - **File**: `UMKMDashboard.tsx` - handleUpdateBusiness() & handleUpdateProduct()

3. **Foto Tidak Muncul di Admin Panel** ❌→✅ (22 Des 2025)

   - **Masalah**: Admin panel hanya tampilkan foto base64, foto dari file path tidak muncul
   - **Penyebab**: Kode cek `foto_toko.startsWith("data:image")` - hanya true untuk base64
   - **Solusi**:
     - Support both: base64 DAN file path
     - Tambahkan `http://localhost:8000/` prefix untuk file path
     - Ubah kondisi dari `&&` jadi `?` (cek ada foto atau tidak, bukan cek format)
   - **File**: `AdminPanel.tsx` - 3 lokasi (detail toko, detail produk, list produk)

4. **Debugging Logs Ditambahkan** 🔍
   - **Frontend Console**:
     - `📸 Uploading new image file: [nama]` - File dipilih
     - `ℹ️ No new image to upload` - Tidak ada file
     - `🚀 Sending update to API...` - Mulai kirim
     - `📥 API Response: [data]` - Response server
   - **Backend Log (Laravel)**:
     - `📸 New image file received: [nama]` - File diterima
     - `🗑️ Deleting old image: [path]` - Hapus foto lama
     - `✅ Image saved: [path]` - Foto tersimpan
     - `ℹ️ No new image file in request` - Request tidak ada file

---

# 📝 CATATAN PERBAIKAN SESSION - 20 Desember 2025

## ✅ MASALAH YANG SUDAH DIPERBAIKI

### 1. **Login Admin Error 500**

**Masalah:**

- Syntax error di AuthController.php line 73
- Ada duplikat function `login()` yang tidak tertutup

**Solusi:**

- Fix syntax error
- Pisahkan jadi 2 function: `login()` untuk user/admin dan `loginAdmin()` khusus admin
- Auto-detect: jika email cocok di table `admins` → login sebagai admin, kalau tidak → cek di table `users`

**Credential Admin:**

- Email: `admin@pasar.com`
- Password: `admin123`

---

### 2. **Database Reset & Struktur**

**Yang dilakukan:**

- `php artisan migrate:fresh` → Reset semua table
- Tambah kolom `role` di table `users` (values: 'user' atau 'umkm')
- Total 19 tabel (14 utama + 5 Laravel system)

**Data yang dibuat:**

- ✅ Admin account (ADM001)
- ✅ 5 Kategori bisnis (CAT001-CAT005):
  - Makanan & Minuman
  - Fashion & Pakaian
  - Kerajinan Tangan
  - Kecantikan & Perawatan
  - Elektronik

---

### 3. **Cart System - Grouped by UMKM**

**Perubahan:**

- CartController.php: Tambah method `getGroupedByBusiness()`
- Response cart sekarang include info UMKM (nama, phone, dll)
- Tambah endpoint checkout per UMKM: `POST /api/cart/{userId}/checkout/{businessId}`
- Fix field name: `quantity` → `jumlah`

**Endpoint Baru:**

- `GET /api/cart/{userId}/grouped` → Cart dikelompokkan per UMKM
- `POST /api/cart/{userId}/checkout/{businessId}` → Checkout satu UMKM

---

### 4. **Request Upgrade ke UMKM - PERBAIKAN BESAR**

**Masalah Sebelumnya:**

- Frontend hanya simpan ke localStorage
- Tidak ada API call ke backend
- Data tidak masuk database
- Admin panel tidak bisa lihat request

**Solusi:**

- Update RoleUpgradeModal.tsx
- Kirim data ke API: `POST /api/businesses`
- Data masuk ke table `businesses` dengan status `pending`
- Admin bisa lihat via: `GET /api/businesses/admin/pending`

**Field yang dikirim:**

```json
{
  "user_id": "wa_xxx",
  "nama_pemilik": "Nama User",
  "nama_bisnis": "Toko ...",
  "alamat": "Alamat user",
  "category_id": "CAT001"
}
```

---

### 5. **Data Dummy Dihapus**

**File:** `React/src/data/stands.ts`

- Semua dummy data toko (Batik Nusantara, Kerajinan Anyaman, dll) sudah dihapus
- Array `foodStands` sekarang kosong
- Frontend akan fetch data dari API backend saja

---

### 6. **Fix Field Names di BusinessController**

**Sebelumnya:** `owner_name`, `business_name`, `address`
**Sekarang:** `nama_pemilik`, `nama_bisnis`, `alamat`

- Sesuai dengan struktur database

---

## 📊 STRUKTUR DATABASE SAAT INI

### Table Penting (10):

1. `users` - User & pemilik UMKM
2. `admins` - Administrator
3. `categories` - Kategori bisnis (✅ sudah ada 5 kategori)
4. `businesses` - Detail bisnis UMKM (status: pending/approved/rejected)
5. `products` - Produk dari UMKM
6. `cart_items` - Keranjang belanja
7. `orders` - Pesanan/transaksi
8. `order_items` - Detail item order
9. `wa_verifications` - OTP WhatsApp
10. `sessions` - Login session

### Table Optional (9):

- events, event_participants (untuk event)
- password_reset_tokens
- jobs, job_batches, failed_jobs (background queue)
- cache, cache_locks
- migrations

---

## 🔄 FLOW REQUEST MENJADI UMKM (SUDAH FIX)

1. **User mengisi form** → RoleUpgradeModal.tsx
2. **Submit ke API** → `POST /api/businesses`
3. **Masuk database** → table `businesses` status `pending`
4. **Admin fetch** → `GET /api/businesses/admin/pending`
5. **Admin approve** → `POST /api/businesses/admin/{userId}/approve`
   - Status jadi `approved`
   - User bisa jual produk
6. **Check di XAMPP** → phpMyAdmin → database `dbumkm` → table `businesses`

---

## 🚀 TESTING CHECKLIST

### Test Login Admin:

- [ ] Login dengan admin@pasar.com / admin123
- [ ] Berhasil masuk sebagai admin (role: 'admin')

### Test Request UMKM:

- [ ] Login sebagai user biasa
- [ ] Klik upgrade ke UMKM
- [ ] Isi form, submit
- [ ] Check XAMPP → table `businesses` → ada data baru status `pending`
- [ ] Login admin → admin panel → lihat pending requests

### Test Approval:

- [ ] Admin approve request
- [ ] Status di database jadi `approved`
- [ ] UMKM muncul di list public

---

## 📁 FILE YANG DIUBAH

### Laravel Backend:

1. `app/Http/Controllers/Api/AuthController.php` - Fix login logic
2. `app/Http/Controllers/Api/CartController.php` - Grouped cart
3. `app/Http/Controllers/Api/BusinessController.php` - Fix field names
4. `routes/api.php` - Tambah route cart grouped & checkout
5. `database/migrations/2025_12_18_000001_create_umkm_tables.php` - Tambah kolom role

### React Frontend:

1. `src/components/RoleUpgradeModal.tsx` - Kirim ke API backend
2. `src/data/stands.ts` - Hapus dummy data

### Helper Scripts:

1. `create_admin.php` - Buat admin
2. `seed_initial_data.php` - Seed categories
3. `check_businesses.php` - Check business requests
4. `test_admin_password.php` - Test admin password

---

## 🔑 CREDENTIALS PENTING

**Admin:**

- Email: admin@pasar.com
- Password: admin123

**Database:**

- Host: localhost
- Database: dbumkm
- phpMyAdmin: http://localhost/phpmyadmin

**API Base URL:**

- Backend: http://localhost:8000/api
- Frontend: http://localhost:3001

---

## 📝 TODO / NOTES

1. **Request UMKM form bisa diperluas** dengan:

   - Field kategori bisnis (pilihan dropdown)
   - Alamat lengkap
   - Nomor WhatsApp
   - Deskripsi bisnis

2. **Setelah approved**, update role user dari `user` → `umkm` di table users

3. **Admin Panel** perlu fetch dari API, bukan localStorage

4. **WhatsApp OTP** sudah ada migration, siap dipakai untuk verifikasi

---

**Dibuat:** 20 Desember 2025
**Status:** ✅ Semua perbaikan selesai
