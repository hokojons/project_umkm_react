# Login Credentials

## Updated: January 10, 2026

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Full admin panel access

### Test User Accounts

#### 1. Budi (UMKM Owner)
- **Username**: `budi`
- **Telepon**: `081234567890`
- **Password**: `budi123`
- **Role**: UMKM Owner
- **UMKM**: Warung Budi (2 products)

#### 2. Siti (UMKM Owner)
- **Username**: `siti`
- **Telepon**: `081234567891`
- **Password**: `siti123`
- **Role**: UMKM Owner
- **UMKM**: Kopi Siti (2 products)

#### 3. Andi (Regular User)
- **Username**: `andi`
- **Telepon**: `081234567892`
- **Password**: `andi123`
- **Role**: Regular User
- **UMKM**: Tidak punya (bisa daftar baru)

## Login Methods

Frontend dapat login dengan:
1. **Username** (contoh: `admin`, `budi`, `siti`, `andi`)
2. **Nomor Telepon** (contoh: `081234567890`)

Sistem akan otomatis detect apakah legacy database (tpengguna/tadmin) atau modern (users table).

## API Endpoints

### POST /api/auth/login
```json
{
  "email": "admin",  // or "budi" or "081234567890"
  "password": "admin123"
}
```

### Response Success
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id": "A001",
    "email": "admin@admin.umkm",
    "nama_lengkap": "admin",
    "name": "admin",
    "no_telepon": null,
    "role": "admin",
    "status": "aktif",
    "wa_verified": true
  }
}
```

## Frontend Integration

Frontend sudah diupdate untuk:
- ✅ Login dengan username (bukan email)
- ✅ Demo credentials menggunakan `admin` / `admin123`
- ✅ Auto-detect role berdasarkan database (admin/umkm_owner/user)

## Database Tables

Legacy tables yang digunakan:
- `tpengguna` - User accounts
- `tadmin` - Admin accounts  
- `tumkm` - UMKM stores
- `tproduk` - Products
- `tkategori` - Categories

## Testing

Jalankan test:
```bash
php test_login_api_curl.php
```

Semua endpoint sudah terkoneksi dengan benar! ✅
