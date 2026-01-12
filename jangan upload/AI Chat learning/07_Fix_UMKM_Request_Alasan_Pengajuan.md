# Fix UMKM Request - Alasan Pengajuan & Duplicate Submission

**Tanggal:** 20 Desember 2025

## Masalah yang Diperbaiki

### 1. Alasan Pengajuan Tidak Muncul di Admin Panel

**Problem:** User bisa submit alasan waktu request upgrade role, tapi admin tidak bisa lihat alasannya.

**Solusi:**

- ✅ Tambah kolom `alasan_pengajuan` TEXT ke tabel `businesses`
- ✅ Update `Business` model fillable array
- ✅ Update `BusinessController` validation untuk terima field baru
- ✅ Update `RoleUpgradeModal.tsx` untuk kirim alasan ke API
- ✅ Update `AdminPanel.tsx` untuk display alasan di tabel

**File yang Diubah:**

1. `database/migrations/2025_12_20_000001_add_alasan_to_businesses.php` - Migration baru
2. `app/Models/Business.php` - Tambah 'alasan_pengajuan' di fillable
3. `app/Http/Controllers/Api/BusinessController.php` - Validation + logic
4. `React/src/components/RoleUpgradeModal.tsx` - Kirim alasan_pengajuan
5. `React/src/components/AdminPanel.tsx` - Display kolom "Alasan Pengajuan"

---

### 2. CORS Error - Failed to Fetch (Submit 2x)

**Problem:** Waktu user submit request upgrade role untuk kedua kalinya, muncul error:

```
Access to fetch at 'http://localhost:3001/' (redirected from 'http://localhost:8000/api/businesses')
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Root Cause:**

1. Database validation `unique:businesses,user_id` → User tidak bisa submit 2x
2. Laravel redirect validation error ke referrer (localhost:3001) tanpa CORS header
3. Browser block karena redirect response tidak punya `Access-Control-Allow-Origin`

**Solusi:**

- ✅ Update `BusinessController::store()` untuk handle duplicate submission:
  - Jika sudah **approved** → Return error JSON
  - Jika **pending/rejected** → Update existing record
  - Jika **baru** → Create new record
- ✅ Update `bootstrap/app.php` exception handler → Force JSON response untuk semua `/api/*` routes

**File yang Diubah:**

1. `app/Http/Controllers/Api/BusinessController.php` - Smart duplicate handling
2. `bootstrap/app.php` - Exception handler dengan `shouldRenderJsonWhen()`

---

## Kode Penting

### BusinessController - Handle Duplicate Submission

```php
public function store(Request $request)
{
    // Check if user already has a business application
    $existingBusiness = Business::where('user_id', $request->user_id)->first();

    if ($existingBusiness) {
        // If already approved, cannot submit again
        if ($existingBusiness->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki UMKM yang telah disetujui'
            ], 422);
        }

        // If pending or rejected, allow to update the application
        $validated = $request->validate([...]);

        $existingBusiness->update([
            ...$validated,
            'status' => 'pending' // Reset to pending
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan UMKM berhasil diperbarui',
            'data' => $existingBusiness
        ], 200);
    }

    // New application
    $validated = $request->validate([
        'user_id' => 'required|string|unique:businesses,user_id|exists:users,id',
        // ... other fields
    ]);

    $business = Business::create([...$validated, 'status' => 'pending']);

    return response()->json([
        'success' => true,
        'message' => 'Pengajuan UMKM berhasil diajukan',
        'data' => $business
    ], 201);
}
```

### Exception Handler - Force JSON for API Routes

```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions): void {
    // Ensure API routes return JSON responses for validation errors
    $exceptions->shouldRenderJsonWhen(function ($request, Throwable $e) {
        return $request->is('api/*');
    });
})
```

### AdminPanel - Display Alasan

```tsx
// Header
<th>Alasan Pengajuan</th>;

// Data mapping
reason: business.alasan_pengajuan || `Ingin membuka: ${business.nama_bisnis}`,
  (
    // Cell display
    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
      <div className="line-clamp-2" title={request.reason}>
        {request.reason}
      </div>
    </td>
  );
```

---

## Testing

### Test Duplicate Submission via Tinker

```bash
php artisan tinker

# Cek existing business
Business::where('user_id', 'wa_1766215033')->first();

# Result: ada business dengan status 'pending'
```

### Test API Response

```bash
# Via curl (PowerShell)
$data = @{
    user_id = "wa_1766215033"
    nama_pemilik = "User1"
    nama_bisnis = "Toko User1"
    alamat = "Alamat lengkap"
    alasan_pengajuan = "Ingin jualan online"
    category_id = "CAT001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/businesses" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $data
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Pengajuan UMKM berhasil diperbarui",
  "data": { ... }
}
```

---

## Database Schema Update

**Migration:** `2025_12_20_000001_add_alasan_to_businesses.php`

```sql
ALTER TABLE businesses
ADD COLUMN alasan_pengajuan TEXT NULL
AFTER alamat;
```

Jalankan migration:

```bash
php artisan migrate
```

Output:

```
2025_12_20_000001_add_alasan_to_businesses ... 119.31ms DONE
```

---

## Status

✅ **Solved:** User bisa submit alasan, admin bisa lihat alasan di tabel Request Role
✅ **Solved:** User bisa submit ulang pengajuan tanpa CORS error
✅ **Solved:** Smart handling untuk duplicate submission

---

## CORS Explanation

**CORS (Cross-Origin Resource Sharing):**

- Browser security mechanism yang block HTTP request dari domain berbeda
- Frontend `localhost:3001` → Backend `localhost:8000` = beda port = beda origin
- Backend harus return header `Access-Control-Allow-Origin: *` atau domain spesifik

**Laravel CORS Config:**

- File: `config/cors.php`
- Middleware: `HandleCors::class` di `bootstrap/app.php`
- Setting: `'allowed_origins' => ['*']` = izinkan semua domain

**Problem kemarin:**

- Laravel redirect validation error (HTML response) tanpa CORS header
- Browser block karena redirect tidak punya `Access-Control-Allow-Origin`

**Fix:**

- Exception handler force return JSON untuk semua `/api/*` routes
- Validation error sekarang return JSON response dengan CORS header
