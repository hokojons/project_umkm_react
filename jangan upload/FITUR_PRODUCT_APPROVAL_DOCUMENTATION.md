# FITUR APPROVAL PRODUK INDIVIDUAL & KOMENTAR PENOLAKAN

## 🎯 Ringkasan Fitur

Sistem baru yang memungkinkan:

1. **Admin** dapat:
   - Menyetujui/menolak UMKM toko secara keseluruhan
   - Menyetujui/menolak produk individual dalam pengajuan UMKM
   - Memberikan komentar untuk setiap penolakan (toko atau produk)

2. **User UMKM** dapat:
   - Melihat komentar penolakan dari admin
   - Menambah produk baru setelah toko mereka disetujui

---

## 📁 File yang Dibuat/Dimodifikasi

### Backend (Laravel)

#### Migrations
- `database/migrations/2026_01_10_000000_create_product_rejection_comments_table.php`
  - Membuat tabel `product_rejection_comments` untuk komentar penolakan produk
  - Membuat tabel `umkm_rejection_comments` untuk komentar penolakan toko
  - Menambah kolom `approval_status` ke tabel `tproduk`

#### Models
- `app/Models/ProductRejectionComment.php` - Model untuk komentar produk
- `app/Models/UmkmRejectionComment.php` - Model untuk komentar toko

#### Controllers
- `app/Http/Controllers/Api/UmkmController.php`
  - **Method Baru:**
    - `approveStoreWithProducts()` - Approve/reject toko dengan kontrol per produk
    - `getRejectionComments()` - Ambil komentar penolakan untuk user
    - `addProduct()` - Tambah produk baru untuk UMKM yang sudah disetujui

#### Routes
- `routes/api.php`
  - `POST /api/umkm/{id}/approve-with-products` - Proses approval dengan produk
  - `GET /api/umkm/rejection-comments` - Ambil komentar penolakan
  - `POST /api/umkm/add-product` - Tambah produk baru

### Frontend (React)

#### Components Baru
- `src/components/RejectionCommentsModal.tsx` - Modal untuk menampilkan komentar penolakan
- `src/components/AddProductModal.tsx` - Modal untuk menambah produk baru

#### Components Dimodifikasi
- `src/components/AdminPanel.tsx`
  - Tambah interface `ProductApproval`
  - Tambah state untuk tracking approval produk
  - Update modal detail pengajuan dengan kontrol per produk
  - Tambah fungsi `handleProductAction()`, `handleProductComment()`, `handleSubmitApprovalWithProducts()`

- `src/components/UMKMDashboard.tsx`
  - Import komponen baru
  - Tambah state untuk modal baru
  - Tambah tombol "Lihat Komentar Penolakan" dan "Tambah Produk"
  - Integrasi modal ke dashboard

---

## 🔄 Alur Kerja

### 1. Admin Review Pengajuan UMKM

```
User mengajukan toko → Admin membuka Detail Pengajuan → Admin review setiap produk:
  ├─ Terima Produk (tombol hijau)
  └─ Tolak Produk (tombol merah) + Isi komentar alasan

Admin pilih aksi untuk toko:
  ├─ Terima Toko
  └─ Tolak Toko + Isi komentar alasan (opsional)

Klik "Proses Pengajuan" → Data disimpan ke database
```

### 2. User Melihat Hasil Review

```
User login → Dashboard UMKM → Klik "Lihat Komentar Penolakan"
  ├─ Tampil komentar penolakan toko (jika ada)
  └─ Tampil komentar penolakan produk (jika ada)
```

### 3. User Menambah Produk Baru

```
Setelah toko disetujui → Dashboard UMKM → Tombol "Tambah Produk" muncul
  └─ Klik → Modal form → Isi data produk → Simpan → Produk langsung approved
```

---

## 🗄️ Struktur Database

### Tabel: product_rejection_comments

| Kolom         | Tipe      | Deskripsi                    |
|---------------|-----------|------------------------------|
| id            | BIGINT    | Primary key                  |
| kodeproduk    | VARCHAR   | Kode produk yang ditolak     |
| kodepengguna  | VARCHAR   | Kode pemilik produk          |
| comment       | TEXT      | Alasan penolakan             |
| status        | ENUM      | 'rejected', 'pending'        |
| admin_id      | BIGINT    | ID admin yang menolak        |
| created_at    | TIMESTAMP | Waktu pembuatan              |
| updated_at    | TIMESTAMP | Waktu update terakhir        |

### Tabel: umkm_rejection_comments

| Kolom         | Tipe      | Deskripsi                    |
|---------------|-----------|------------------------------|
| id            | BIGINT    | Primary key                  |
| kodepengguna  | VARCHAR   | Kode pemilik toko            |
| comment       | TEXT      | Alasan penolakan             |
| status        | ENUM      | 'rejected', 'pending'        |
| admin_id      | BIGINT    | ID admin yang menolak        |
| created_at    | TIMESTAMP | Waktu pembuatan              |
| updated_at    | TIMESTAMP | Waktu update terakhir        |

### Update Tabel: tproduk

Tambahan kolom baru:
- `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'

---

## 📡 API Endpoints

### 1. Approve dengan Kontrol Produk

**Endpoint:** `POST /api/umkm/{id}/approve-with-products`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "X-Admin-ID": "1" // Optional
}
```

**Request Body:**
```json
{
  "umkm_action": "approve",  // "approve" atau "reject"
  "umkm_comment": "Toko bagus tetapi...",  // Opsional, wajib jika reject
  "products": [
    {
      "kodeproduk": "U001P001",
      "action": "approve",  // "approve" atau "reject"
      "comment": ""  // Wajib jika action = "reject"
    },
    {
      "kodeproduk": "U001P002",
      "action": "reject",
      "comment": "Foto produk tidak jelas, mohon upload ulang dengan resolusi lebih baik"
    }
  ]
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "UMKM store and products processed successfully"
}
```

### 2. Ambil Komentar Penolakan

**Endpoint:** `GET /api/umkm/rejection-comments`

**Headers:**
```json
{
  "X-User-ID": "1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "umkm_comments": [
      {
        "id": 1,
        "comment": "Deskripsi toko kurang lengkap",
        "created_at": "2026-01-10T10:30:00.000Z"
      }
    ],
    "product_comments": [
      {
        "id": 1,
        "kodeproduk": "U001P002",
        "comment": "Foto produk tidak jelas",
        "created_at": "2026-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Tambah Produk Baru

**Endpoint:** `POST /api/umkm/add-product`

**Headers:**
```json
{
  "Content-Type": "multipart/form-data",
  "X-User-ID": "1"
}
```

**Request Body (FormData):**
```
nama_produk: "Produk Baru"
harga: "50000"
deskripsi: "Deskripsi produk"
stok: "10"
kategori: "Makanan"
gambar: (file)
```

**Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "kodeproduk": "U001P003",
    "kodepengguna": "U001",
    "namaproduk": "Produk Baru",
    "harga": 50000,
    "stok": 10,
    "detail": "Deskripsi produk",
    "gambarproduk": "uploads/products/product_U001P003_1704902400.jpg",
    "kategori": "Makanan",
    "status": "active",
    "approval_status": "approved"
  }
}
```

---

## 🎨 UI/UX Changes

### Admin Panel - Detail Pengajuan UMKM

**Sebelum:**
- Hanya tombol "Setujui" atau "Tolak" untuk keseluruhan toko

**Sesudah:**
- Setiap produk memiliki:
  - Toggle "Terima Produk" / "Tolak Produk"
  - TextField untuk komentar (muncul saat tolak)
- Section "Keputusan Toko UMKM":
  - Toggle "Terima Toko" / "Tolak Toko"
  - TextField untuk komentar toko (muncul saat tolak)
- Tombol "Proses Pengajuan" mengirim semua data sekaligus

### UMKM Dashboard

**Tambahan:**
1. Tombol "Lihat Komentar Penolakan" (merah, dengan ikon AlertCircle)
   - Selalu tampil
   - Membuka modal dengan daftar komentar

2. Tombol "Tambah Produk" (hijau, dengan ikon Plus)
   - Hanya tampil jika user punya toko yang sudah disetujui
   - Membuka modal form tambah produk

---

## 🧪 Testing Guide

### Test 1: Admin Menolak Beberapa Produk

1. Login sebagai admin
2. Buka "Toko UMKM Pending"
3. Klik "Lihat Detail" pada salah satu pengajuan
4. Untuk produk pertama: Klik "Tolak Produk", isi komentar "Foto kurang jelas"
5. Untuk produk kedua: Biarkan "Terima Produk"
6. Pilih "Terima Toko"
7. Klik "Proses Pengajuan"
8. Cek database: `product_rejection_comments` harus ada entry baru

### Test 2: User Melihat Komentar

1. Login sebagai user yang tokonya direview
2. Buka Dashboard UMKM
3. Klik "Lihat Komentar Penolakan"
4. Harus muncul modal dengan komentar admin

### Test 3: User Menambah Produk

1. Login sebagai user dengan toko yang sudah disetujui
2. Buka Dashboard UMKM
3. Tombol "Tambah Produk" harus tampil
4. Klik → Isi form → Simpan
5. Produk baru langsung approved dan muncul di daftar

---

## 🔧 Troubleshooting

### Error: "You must have an approved UMKM store to add products"

**Penyebab:** User belum punya toko yang statusnya 'active'

**Solusi:** 
1. Cek tabel `tumkm`, pastikan ada entry dengan `kodepengguna` = user dan `statuspengajuan` = 'active'
2. Atau ajukan toko baru dan minta admin untuk approve

### Komentar tidak muncul

**Penyebab:** Mungkin user_id tidak sesuai dengan kodepengguna

**Solusi:**
1. Cek header `X-User-ID` dikirim dengan benar
2. Format kodepengguna: `U` + user_id dengan padding 3 digit (contoh: user id 1 → U001)

### Produk baru tidak muncul

**Penyebab:** Kodeproduk duplicate atau error generate kode

**Solusi:**
1. Cek tabel `tproduk` untuk kodepengguna yang sama
2. Pastikan auto-increment kode produk berjalan dengan benar

---

## 📝 Catatan Pengembangan

- **Auto-approve produk baru:** Produk yang ditambahkan setelah toko disetujui otomatis approved, tidak perlu review ulang
- **Komentar bersifat history:** Komentar lama tidak dihapus, bisa dilihat kapan saja
- **No cascade delete:** Hapus produk tidak menghapus komentar (untuk audit trail)
- **Validasi:** Komentar penolakan wajib diisi saat menolak produk/toko (bisa disesuaikan)

---

## 🚀 Cara Menjalankan

1. **Jalankan Migration:**
   ```bash
   cd Laravel
   php artisan migrate --path=database/migrations/2026_01_10_000000_create_product_rejection_comments_table.php
   ```

2. **Start Backend:**
   ```bash
   cd Laravel
   php artisan serve
   ```

3. **Start Frontend:**
   ```bash
   cd React
   npm run dev
   ```

4. **Test di Browser:**
   - Admin: http://localhost:5173 → Login sebagai admin
   - User: http://localhost:5173 → Login sebagai UMKM user

---

## 📧 Support

Jika ada pertanyaan atau bug, silakan dokumentasikan dengan:
- Screenshot error
- Log dari console browser (F12)
- Log dari Laravel (storage/logs/laravel.log)
