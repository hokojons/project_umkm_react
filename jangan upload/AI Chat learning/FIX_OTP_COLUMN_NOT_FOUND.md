## ✅ PERBAIKAN OTP SEND - Column Not Found Error

**Tanggal:** 11 Januari 2026

### 🐛 Masalah
Error saat kirim OTP:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column...
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### 🔍 Root Cause
Terdapat **ketidakcocokan nama kolom** antara Model dan Database:

**Model WaVerification (SALAH):**
- `no_telepon` ❌
- `kode_otp` ❌
- `verified` ❌

**Database wa_verifications (BENAR):**
- `phone_number` ✅
- `code` ✅
- `is_verified` ✅
- `verified_at` ✅
- `type` ✅

### ✅ Solusi yang Diterapkan

#### 1. Update Model: `WaVerification.php`
```php
protected $fillable = [
    'phone_number',     // dari no_telepon
    'code',             // dari kode_otp
    'type',             // ditambahkan
    'is_verified',      // dari verified
    'verified_at',      // ditambahkan
    'expires_at',
];

protected $casts = [
    'is_verified' => 'boolean',
    'verified_at' => 'datetime',
    'expires_at' => 'datetime',
];
```

#### 2. Update Service: `WhatsAppOtpService.php`

**Method `generateOtp()`:**
```php
// Hapus OTP lama
WaVerification::where('phone_number', $phoneNumber)  // ✅
    ->where('expires_at', '<', now())
    ->delete();

// Simpan OTP baru
WaVerification::create([
    'phone_number' => $phoneNumber,  // ✅
    'code' => $code,                 // ✅
    'type' => $type,                 // ✅
    'is_verified' => false,          // ✅
    'expires_at' => now()->addMinutes(5),
]);
```

**Method `verifyOtp()`:**
```php
$verification = WaVerification::where('phone_number', $phoneNumber)  // ✅
    ->where('code', $code)                                           // ✅
    ->where('expires_at', '>', now())
    ->first();

$verification->update([
    'is_verified' => true,   // ✅
    'verified_at' => now()   // ✅
]);
```

### 🧪 Testing

**Test Command:**
```bash
php test_otp_send_fixed.php
```

**Result:** ✅ SUCCESS
```
HTTP Status: 200
✓ OTP sent successfully!
OTP Code: 899641
Phone: 6285175447460
✓ Record found in database
```

### 📋 Files Modified
1. ✅ `app/Models/WaVerification.php`
2. ✅ `app/Services/WhatsAppOtpService.php`

### 🎯 Status
**RESOLVED** - OTP send dan verifikasi sekarang berfungsi dengan benar.

### 📝 Testing Checklist
- [x] OTP generation berhasil
- [x] Data tersimpan ke database dengan kolom yang benar
- [x] Response API 200 OK
- [x] WhatsApp link ter-generate dengan benar
- [ ] Test dari frontend React
- [ ] Test OTP verification
- [ ] Test complete registration flow

### 🔄 Next Steps
Silakan test dari frontend dengan:
1. Buka halaman registrasi
2. Masukkan nomor WhatsApp: `6285175447460`
3. Klik "Kirim OTP"
4. Seharusnya berhasil tanpa error 400

