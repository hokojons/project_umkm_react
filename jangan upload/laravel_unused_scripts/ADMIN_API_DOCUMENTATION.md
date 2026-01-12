# 📚 Admin API Documentation

## 🔐 Authentication

### 1. Login Admin

**Endpoint:** `POST /api/auth/admin/login`

**Request Body:**

```json
{
    "email": "admin@pasar.com",
    "password": "admin123"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Login admin berhasil",
    "data": {
        "admin": {
            "id": 1,
            "nama": "Admin Pasar UMKM",
            "email": "admin@pasar.com",
            "is_active": true
        },
        "token": "1|abcdef123456...",
        "role": "admin"
    }
}
```

**Error Responses:**

-   **401** - Email/password salah
-   **403** - Admin tidak aktif

---

## 👥 Admin Management

### 2. List Semua Admin

**Endpoint:** `GET /api/admin/admins`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "email": "admin@pasar.com",
            "nama": "Admin Pasar UMKM",
            "is_active": true,
            "created_at": "2025-12-20T13:45:50.000000Z",
            "updated_at": "2025-12-20T13:45:50.000000Z"
        }
    ]
}
```

---

### 3. Detail Admin

**Endpoint:** `GET /api/admin/admins/{id}`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "admin@pasar.com",
        "nama": "Admin Pasar UMKM",
        "is_active": true,
        "created_at": "2025-12-20T13:45:50.000000Z",
        "updated_at": "2025-12-20T13:45:50.000000Z"
    }
}
```

**Error Response:**

-   **404** - Admin tidak ditemukan

---

### 4. Buat Admin Baru

**Endpoint:** `POST /api/admin/admins`

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
    "nama": "Admin Baru",
    "email": "admin2@pasar.com",
    "password": "password123",
    "is_active": true
}
```

**Success Response (201):**

```json
{
    "success": true,
    "message": "Admin berhasil dibuat",
    "data": {
        "id": 2,
        "nama": "Admin Baru",
        "email": "admin2@pasar.com",
        "is_active": true
    }
}
```

**Validation Rules:**

-   `nama`: required, string, max 100 characters
-   `email`: required, email, unique, max 100 characters
-   `password`: required, string, min 6 characters
-   `is_active`: optional, boolean (default: true)

---

### 5. Update Admin

**Endpoint:** `PUT /api/admin/admins/{id}`

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body (semua field optional):**

```json
{
    "nama": "Admin Updated",
    "email": "admin_updated@pasar.com",
    "password": "newpassword123"
}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Admin berhasil diupdate",
    "data": {
        "id": 2,
        "nama": "Admin Updated",
        "email": "admin_updated@pasar.com",
        "is_active": true
    }
}
```

**Error Responses:**

-   **404** - Admin tidak ditemukan
-   **422** - Validation error (email sudah digunakan)

---

### 6. Toggle Status Admin (Aktifkan/Nonaktifkan)

**Endpoint:** `PATCH /api/admin/admins/{id}/toggle-status`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Admin dinonaktifkan",
    "data": {
        "id": 2,
        "nama": "Admin Baru",
        "email": "admin2@pasar.com",
        "is_active": false
    }
}
```

**Error Responses:**

-   **404** - Admin tidak ditemukan
-   **400** - Tidak bisa menonaktifkan admin terakhir

**⚠️ Catatan:** Sistem akan mencegah menonaktifkan admin terakhir yang aktif.

---

### 7. Hapus Admin (Soft Delete)

**Endpoint:** `DELETE /api/admin/admins/{id}`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Admin berhasil dinonaktifkan"
}
```

**Error Responses:**

-   **404** - Admin tidak ditemukan
-   **400** - Tidak bisa menghapus admin terakhir

**⚠️ Catatan:**

-   Delete hanya set `is_active = false` (soft delete)
-   Sistem akan mencegah menghapus admin terakhir yang aktif

---

## 📋 UMKM Role Upgrade Management

### 8. List Pengajuan UMKM Pending

**Endpoint:** `GET /api/role-requests/pending`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": 123,
            "nama_pemilik": "John Doe",
            "nama_toko": "Toko Jaya",
            "alamat_toko": "Jl. Merdeka No. 123",
            "kode_kategori": "CAT001",
            "alasan_pengajuan": "Ingin menjual produk makanan...",
            "status_pengajuan": "pending",
            "user": {
                "id": 123,
                "nama": "John Doe",
                "telepon": "08123456789"
            },
            "category": {
                "id": "CAT001",
                "nama_kategori": "Makanan",
                "icon": "🍔"
            }
        }
    ]
}
```

---

### 9. Approve Pengajuan UMKM

**Endpoint:** `POST /api/role-requests/{userId}/approve`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Pengajuan UMKM berhasil disetujui",
    "data": {
        "umkm": {
            "kode_umkm": "UMKM0001",
            "user_id": 123,
            "nama_pemilik": "John Doe",
            "nama_toko": "Toko Jaya",
            "status": "active"
        },
        "user_role_updated": true
    }
}
```

**What Happens:**

1. Request status → `approved`
2. Record baru dibuat di table `tumkm` dengan auto-generated `kode_umkm`
3. User role diupdate jadi `umkm`

**Error Responses:**

-   **404** - Request tidak ditemukan atau user tidak ada
-   **400** - Request sudah approved sebelumnya

---

### 10. Reject Pengajuan UMKM

**Endpoint:** `POST /api/role-requests/{userId}/reject`

**Headers:**

```
Authorization: Bearer {token}
```

**Success Response (200):**

```json
{
    "success": true,
    "message": "Pengajuan UMKM ditolak"
}
```

**Error Responses:**

-   **404** - Request tidak ditemukan

---

## 🔑 Default Admin Credentials

```
Email: admin@pasar.com
Password: admin123
Status: Active (is_active = true)
```

---

## 🛡️ Security Notes

1. **Token Authentication:** Semua endpoint admin (kecuali login) harus menggunakan Bearer token
2. **Admin Protection:** Sistem mencegah:
    - Menonaktifkan admin terakhir
    - Menghapus admin terakhir
3. **Login Validation:** Hanya admin dengan `is_active = true` yang bisa login

---

## 📝 Workflow Pengajuan UMKM

```
User Register → Request UMKM Upgrade → Admin Review → Approve/Reject
                                                          ↓
                                                    Create UMKM + Update Role
```

1. **User** mengajukan upgrade via `/api/role-requests` (POST)
2. **Admin** melihat list pending via `/api/role-requests/pending` (GET)
3. **Admin** approve via `/api/role-requests/{userId}/approve` (POST)
    - System membuat UMKM baru dengan kode auto (UMKM0001, UMKM0002, dst)
    - User role berubah dari `user` → `umkm`
4. **Admin** bisa reject via `/api/role-requests/{userId}/reject` (POST)
    - User bisa submit ulang nanti

---

## 🧪 Testing

### Test Login Admin

```bash
php test_admin_login.php
```

### Test dengan cURL

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pasar.com","password":"admin123"}'

# List Admins (dengan token)
curl -X GET http://127.0.0.1:8000/api/admin/admins \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Structure

### Table: `admins`

```sql
id              BIGINT AUTO_INCREMENT PRIMARY KEY
email           VARCHAR(100) UNIQUE
nama            VARCHAR(100)
password        VARCHAR(255)
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Table: `role_upgrade_requests`

```sql
id                  BIGINT AUTO_INCREMENT PRIMARY KEY
user_id             BIGINT FOREIGN KEY → users.id
nama_pemilik        VARCHAR(100)
nama_toko           VARCHAR(100)
alamat_toko         TEXT
kode_kategori       VARCHAR(20) FOREIGN KEY → categories.id
alasan_pengajuan    TEXT
status_pengajuan    ENUM('pending','approved','rejected') DEFAULT 'pending'
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### Table: `tumkm`

```sql
kode_umkm       VARCHAR(20) PRIMARY KEY (e.g., UMKM0001)
user_id         BIGINT UNIQUE FOREIGN KEY → users.id
nama_pemilik    VARCHAR(100)
nama_toko       VARCHAR(100)
alamat_toko     TEXT
kode_kategori   VARCHAR(20) FOREIGN KEY → categories.id
no_whatsapp     VARCHAR(20)
status          ENUM('active','inactive') DEFAULT 'active'
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
