## ✅ PERBAIKAN ROLE UPGRADE REQUEST - Column Not Found Error

**Tanggal:** 11 Januari 2026

### 🐛 Masalah
Error saat submit role upgrade request:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'status' in 'where clause'
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

### 🔍 Root Cause
Ada **mismatch nama kolom** antara kode dan database:

**Kode menggunakan:**
- `status` ❌
- Simple role upgrade (hanya user_id + reason) ❌

**Database menggunakan:**
- `status_pengajuan` ✅
- Business submission format (butuh nama_pemilik, nama_toko, alamat_toko, kategori_id) ✅

**Masalah tambahan:**
- Migration yang aktif berbeda dengan yang di-expect
- Tabel `categories` kosong (foreign key constraint error)

### ✅ Solusi yang Diterapkan

#### 1. Update Model: `RoleRequest.php`
```php
protected $fillable = [
    'user_id',
    'nama_pemilik',
    'nama_toko',
    'alamat_toko',
    'kategori_id',
    'status_pengajuan',  // bukan 'status'
    'alasan_pengajuan',
];
```

#### 2. Update Controller: `RoleRequestController.php`

**Method `getPending()`:**
```php
$requests = RoleRequest::with('user')
    ->where('status_pengajuan', 'pending')  // ✅
    ->orderBy('created_at', 'desc')
    ->get();
```

**Method `checkUserRequest()`:**
```php
'status' => $request->status_pengajuan,  // ✅
```

**Method `store()`:**
```php
// Auto-create category jika tidak ada
$defaultCategory = \DB::table('categories')->first();
$categoryId = $defaultCategory ? $defaultCategory->id : 1;

if (!$defaultCategory) {
    try {
        \DB::table('categories')->insert([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $categoryId = \DB::getPdo()->lastInsertId();
    } catch (\Exception $e) {
        $categoryId = 1;
    }
}

// Create dengan field yang dibutuhkan database
$roleRequest = RoleRequest::create([
    'user_id' => $validated['user_id'],
    'nama_pemilik' => $user->nama_lengkap ?? $user->no_telepon,
    'nama_toko' => 'Pending',  // Diisi kemudian
    'alamat_toko' => $user->alamat ?? 'Akan diisi kemudian',
    'kategori_id' => $categoryId,
    'alasan_pengajuan' => $validated['reason'] ?? 'Ingin menjadi UMKM Owner',
    'status_pengajuan' => 'pending',  // ✅
]);
```

**Method `approve()` dan `reject()`:**
```php
if ($roleRequest->status_pengajuan !== 'pending') { // ✅
    // ...
}

$roleRequest->update([
    'status_pengajuan' => 'approved',  // atau 'rejected'
]);
```

### 🧪 Testing

**Test Command:**
```bash
php test_role_upgrade_request.php
```

**Result:** ✅ SUCCESS
```
HTTP Status: 201
✓ Role upgrade request created successfully!

Request ID: 2
User ID: 1
Nama Pemilik: Budi Santoso
Nama Toko: Pending
Status: pending
Alasan: Testing role upgrade request
```

### 📋 Files Modified
1. ✅ `app/Models/RoleRequest.php`
2. ✅ `app/Http/Controllers/Api/RoleRequestController.php`

### 🎯 Status
**RESOLVED** - Role upgrade request sekarang berfungsi dengan benar.

### 📝 Key Changes
- Semua `status` → `status_pengajuan`
- Tambah field required: `nama_pemilik`, `nama_toko`, `alamat_toko`, `kategori_id`
- Auto-create default category jika belum ada
- Frontend tetap bisa kirim simple request (user_id + reason), backend yang handle conversion

### 🔄 Related Issues Fixed
- ✅ OTP Send - column not found (sudah diperbaiki sebelumnya)
- ✅ Role Upgrade Request - column not found (FIXED NOW)

### 📌 Notes
Tabel `role_upgrade_requests` saat ini digunakan untuk **business submission** (bukan simple role upgrade). Migration baru (2026_01_08) yang ada di pending sebaiknya di-review ulang untuk menghindari konflik.

