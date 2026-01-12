# Pasar UMKM - Setup & Penggunaan

## 🚀 Cara Menggunakan Aplikasi

Aplikasi ini menggunakan **localStorage** untuk menyimpan data, jadi semua data tersimpan di browser Anda.

---

## 👤 User & Roles

### Role yang Tersedia:
1. **User** - Pembeli biasa yang bisa upgrade ke UMKM
2. **UMKM** - Penjual yang bisa manage toko dan produk
3. **Admin** - Mengelola seluruh sistem

---

## 🔐 Cara Login/Daftar

### Daftar Akun Baru:
1. Klik tombol **"Masuk"** di header
2. Klik **"Belum punya akun? Daftar di sini"**
3. Isi form:
   - **Nama**: Nama lengkap Anda
   - **Email**: Email aktif
   - **Password**: Password pilihan Anda
   - **Centang "Buat sebagai admin"** jika ingin akun admin (untuk testing)
4. Klik **"Daftar"**
5. Anda akan otomatis login

### Login dengan Akun yang Sudah Ada:
1. Klik tombol **"Masuk"**
2. Masukkan email dan password
3. Klik **"Masuk"**

### 🎯 Testing Cepat - Buat Akun Admin:
Untuk test fitur admin dengan cepat:
1. Daftar dengan email apa saja (contoh: `admin@test.com`)
2. **CENTANG** checkbox **"Buat sebagai admin"**
3. Setelah login, Anda bisa akses Admin Panel

---

## 📋 Fitur untuk Setiap Role

### 👤 User Biasa
1. **Berbelanja**
   - Browse produk UMKM
   - Tambah ke cart
   - Checkout

2. **Request Upgrade ke UMKM**
   - Klik nama user → **"Request Role UMKM"**
   - Isi alasan permintaan
   - Tunggu approval dari admin

### 🏪 User UMKM
Semua fitur User Biasa, PLUS:

1. **Ajukan Toko Baru**
   - Klik nama user → **"Ajukan Toko UMKM"**
   - Isi informasi toko:
     - Upload logo toko (gambar akan disimpan sebagai base64)
     - Nama toko
     - Nama pemilik
     - Deskripsi toko
     - Kategori (Fashion/Kerajinan/Kuliner/Kecantikan/Aksesoris)
   - Tambah produk (minimal 1, bisa lebih):
     - Nama produk
     - Harga
     - Deskripsi
     - Kategori
     - Upload foto produk
   - Klik **"Ajukan Toko & Produk"**
   - Tunggu approval dari admin

2. **Dashboard UMKM**
   - Klik nama user → **"Dashboard UMKM"**
   - Lihat toko yang sudah disetujui
   - Lihat produk yang sudah disetujui
   - Hapus toko/produk (jika diperlukan)

3. **Daftar Event**
   - Lihat event yang tersedia
   - Klik **"Daftar Berjualan"** pada event
   - Pilih toko dan produk yang akan dijual
   - Submit aplikasi

### 👨‍💼 Admin
Semua fitur UMKM, PLUS:

1. **Admin Panel** (Klik nama user → "Admin Panel")
   
   **Tab Bisnis UMKM:**
   - Lihat semua bisnis
   - Hapus bisnis (akan menghapus produk terkait juga)

   **Tab Produk:**
   - Lihat semua produk
   - Hapus produk

   **Tab Pengajuan Toko:**
   - Review pengajuan toko dari user UMKM
   - Lihat detail toko dan semua produknya
   - **Setujui** → Toko dan produk langsung muncul di marketplace
   - **Tolak** → Pengajuan ditolak

   **Tab Request Role:**
   - Lihat permintaan upgrade role dari User ke UMKM
   - **Setujui** → User berubah jadi UMKM
   - **Tolak** → Permintaan ditolak

   **Tab Manajemen User:**
   - Lihat semua user
   - Ubah role user (User/UMKM/Admin)

   **Tab Acara:**
   - Buat event/bazaar baru
   - Edit event
   - Hapus event
   - Lihat aplikasi berjualan dari UMKM
   - Approve/reject aplikasi event

---

## 🔄 Alur Kerja Lengkap

### 1. User Ingin Jadi Penjual UMKM
```
User Biasa → Request Role UMKM → Admin Approve → Jadi UMKM
```

### 2. UMKM Ajukan Toko
```
UMKM → Ajukan Toko & Produk → Admin Review → Approve → 
Toko Live di Marketplace!
```

### 3. UMKM Daftar Event
```
Admin Buat Event → UMKM Lihat Event → Daftar Berjualan → 
Admin Review → Approve → UMKM Berjualan di Event
```

---

## 💾 Data Storage

### localStorage Keys yang Digunakan:
- `pasar_umkm_current_user` - User yang sedang login
- `pasar_umkm_access_token` - Token akses
- `pasar_umkm_users` - Daftar semua user
- `pasar_umkm_passwords` - Password users (untuk demo saja!)
- `pasar_umkm_businesses` - Daftar bisnis UMKM
- `pasar_umkm_products` - Daftar produk
- `pasar_umkm_submissions` - Pengajuan toko
- `pasar_umkm_role_requests` - Permintaan upgrade role
- `pasar_umkm_events` - Daftar event
- `pasar_umkm_event_applications` - Aplikasi berjualan di event

### ⚠️ Catatan Penting:
- Data tersimpan di browser (localStorage)
- Data akan **hilang** jika localStorage dibersihkan
- Untuk production, gunakan database backend yang proper
- Password **TIDAK** dienkripsi (hanya untuk demo!)

---

## 🎯 Fitur Lengkap

✅ **Authentication System**
- Login/Signup
- Role-based access control
- User session management

✅ **UMKM Management**
- Ajukan toko dengan multiple produk
- Dashboard untuk manage toko & produk
- Upload gambar (base64)

✅ **Admin Panel**
- Kelola bisnis dan produk
- Approve/reject pengajuan toko
- Approve/reject role upgrade
- User management
- Event management

✅ **Event & Bazaar**
- Admin buat event
- UMKM daftar berjualan
- Admin approve aplikasi event

✅ **Shopping Features**
- Browse produk by kategori
- Search produk/penjual
- Shopping cart fully functional
- Checkout modal

✅ **UI/UX**
- Responsive design
- Toast notifications
- Modal dialogs
- Loading states

---

## 💡 Tips Penggunaan

### Testing Flow Lengkap:
1. **Buat akun Admin** (centang "Buat sebagai admin" saat daftar)
2. **Buat akun User biasa** (logout dulu, daftar tanpa centang admin)
3. **Request upgrade ke UMKM** dari akun User
4. **Login kembali sebagai Admin**, approve request
5. **Login kembali sebagai UMKM**, ajukan toko + produk
6. **Login sebagai Admin**, approve pengajuan toko
7. **Buka halaman utama**, toko sudah muncul!

### Reset Data:
Jika ingin reset semua data:
1. Buka Developer Tools (F12)
2. Console tab
3. Ketik: `localStorage.clear()`
4. Refresh halaman

---

Selamat menggunakan **Pasar UMKM**! 🎉

**Built with ❤️ using React, TypeScript, Tailwind CSS, dan localStorage**
