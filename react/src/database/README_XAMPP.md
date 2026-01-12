# Panduan Setup Database Pasar UMKM di XAMPP

## 📋 Daftar Isi
1. [Persyaratan](#persyaratan)
2. [Instalasi Database](#instalasi-database)
3. [Struktur Database](#struktur-database)
4. [Konfigurasi Backend](#konfigurasi-backend)
5. [Testing & Verifikasi](#testing--verifikasi)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Persyaratan

### Software yang Dibutuhkan:
- **XAMPP** (versi 7.4+ atau 8.0+)
  - Download: https://www.apachefriends.org/
- **MySQL/MariaDB** (sudah include dalam XAMPP)
- **phpMyAdmin** (sudah include dalam XAMPP)
- **PHP** 7.4+ (sudah include dalam XAMPP)

### File yang Dibutuhkan:
1. `pasar_umkm_schema.sql` - Struktur database
2. `pasar_umkm_data.sql` - Data dummy

---

## 🚀 Instalasi Database

### Metode 1: Via phpMyAdmin (Recommended)

#### Step 1: Start XAMPP
1. Buka **XAMPP Control Panel**
2. Klik **Start** pada module **Apache**
3. Klik **Start** pada module **MySQL**
4. Tunggu sampai status berubah jadi hijau

#### Step 2: Buka phpMyAdmin
1. Buka browser
2. Ketik: `http://localhost/phpmyadmin`
3. Login (default: username `root`, password kosong)

#### Step 3: Import Schema Database
1. Klik tab **"SQL"** di menu atas
2. Buka file `pasar_umkm_schema.sql` dengan text editor
3. Copy semua isinya
4. Paste ke textarea di phpMyAdmin
5. Klik tombol **"Go"** di kanan bawah
6. Tunggu sampai selesai (akan muncul pesan sukses)

#### Step 4: Import Data Dummy
1. Pastikan database `pasar_umkm` sudah terbuat
2. Klik database **"pasar_umkm"** di sidebar kiri
3. Klik tab **"SQL"** di menu atas
4. Buka file `pasar_umkm_data.sql` dengan text editor
5. Copy semua isinya
6. Paste ke textarea di phpMyAdmin
7. Klik tombol **"Go"**
8. Tunggu sampai selesai

#### Step 5: Verifikasi
1. Di sidebar kiri, klik database **"pasar_umkm"**
2. Anda akan melihat 9 tabel:
   - ✅ users
   - ✅ businesses
   - ✅ products
   - ✅ cart_items
   - ✅ orders
   - ✅ order_items
   - ✅ role_upgrade_requests
   - ✅ sessions
   - ✅ reviews
3. Klik tabel **"users"**, lalu tab **"Browse"**
4. Anda akan melihat 13 user dummy

**✅ Database berhasil dibuat!**

---

### Metode 2: Via MySQL Command Line

#### Step 1: Buka MySQL CLI
1. Buka **XAMPP Control Panel**
2. Klik **Shell** button
3. Ketik: `mysql -u root -p`
4. Tekan Enter (password kosong, langsung Enter lagi)

#### Step 2: Import Schema
```bash
source C:/xampp/htdocs/pasar-umkm/database/pasar_umkm_schema.sql
```
*Sesuaikan path dengan lokasi file Anda*

#### Step 3: Import Data
```bash
source C:/xampp/htdocs/pasar-umkm/database/pasar_umkm_data.sql
```

#### Step 4: Verifikasi
```sql
USE pasar_umkm;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

---

## 📊 Struktur Database

### Database: `pasar_umkm`
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

### Tabel Utama:

#### 1. `users` - Data Pengguna
| Field | Type | Keterangan |
|-------|------|------------|
| id | VARCHAR(100) | Primary Key |
| email | VARCHAR(255) | Unique, untuk login |
| password | VARCHAR(255) | Hash bcrypt |
| name | VARCHAR(255) | Nama lengkap |
| role | ENUM | user, umkm, admin |
| phone | VARCHAR(20) | Nomor telepon |
| is_active | TINYINT(1) | Status aktif |

**Test Users:**
- Admin: `admin@pasarumkm.com` / password: `test123`
- User: `user@test.com` / password: `test123`
- UMKM: `umkm@test.com` / password: `test123`

#### 2. `businesses` - Data Bisnis UMKM
| Field | Type | Keterangan |
|-------|------|------------|
| id | VARCHAR(100) | Primary Key |
| owner_id | VARCHAR(100) | Foreign Key ke users |
| name | VARCHAR(255) | Nama bisnis |
| category | ENUM | Fashion, Kerajinan, Kuliner, Kecantikan, Aksesoris, UMKM |
| status | ENUM | pending, approved, rejected |
| rating | DECIMAL(2,1) | Rating 0.0-5.0 |

**Total: 10 bisnis dummy**

#### 3. `products` - Data Produk
| Field | Type | Keterangan |
|-------|------|------------|
| id | VARCHAR(100) | Primary Key |
| business_id | VARCHAR(100) | Foreign Key ke businesses |
| name | VARCHAR(255) | Nama produk |
| price | DECIMAL(12,2) | Harga dalam Rupiah |
| category | ENUM | product, food, accessory, craft |
| stock | INT | Stok tersedia |

**Total: 50 produk dummy (5 per bisnis)**

#### 4. `orders` - Data Pesanan
| Field | Type | Keterangan |
|-------|------|------------|
| id | VARCHAR(100) | Primary Key |
| user_id | VARCHAR(100) | Foreign Key ke users |
| total_amount | DECIMAL(12,2) | Total harga |
| payment_method | ENUM | bank_transfer, e_wallet, cod |
| payment_status | ENUM | pending, paid, failed |
| order_status | ENUM | pending, processing, shipped, delivered, cancelled |

#### 5. `order_items` - Detail Pesanan
Relasi many-to-many antara orders dan products

#### 6. `cart_items` - Keranjang Belanja
Temporary storage untuk item yang belum di-checkout

#### 7. `role_upgrade_requests` - Permintaan Upgrade Role
User yang ingin upgrade ke UMKM

#### 8. `sessions` - Session Management
Token management untuk authentication

#### 9. `reviews` - Review Produk
Rating dan komentar customer

---

## 🔌 Konfigurasi Backend

### PHP Configuration

Buat file `config/database.php`:

```php
<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'pasar_umkm');
define('DB_CHARSET', 'utf8mb4');

// Create Connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

### API Endpoint Example

Buat file `api/products.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

// Get all products
$stmt = $pdo->query("SELECT * FROM v_products_with_business WHERE is_active = 1");
$products = $stmt->fetchAll();

echo json_stringify($products);
?>
```

### Authentication Example

Buat file `api/login.php`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Get user
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    // Generate token
    $token = bin2hex(random_bytes(32));
    
    // Save session
    $sessionId = 'session_' . time() . '_' . bin2hex(random_bytes(8));
    $expiresAt = date('Y-m-d H:i:s', time() + 86400); // 24 hours
    
    $stmt = $pdo->prepare("
        INSERT INTO sessions (id, user_id, access_token, expires_at) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$sessionId, $user['id'], $token, $expiresAt]);
    
    // Return user data
    unset($user['password']);
    echo json_encode([
        'success' => true,
        'user' => $user,
        'access_token' => $token
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Email atau password salah'
    ]);
}
?>
```

---

## ✅ Testing & Verifikasi

### 1. Test Database Connection

Buat file `test_connection.php`:

```php
<?php
require_once 'config/database.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch();
    echo "✅ Database terhubung!<br>";
    echo "Total users: " . $result['total'];
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

Akses: `http://localhost/pasar-umkm/test_connection.php`

### 2. Test Queries

```sql
-- Cek semua users
SELECT * FROM users;

-- Cek semua businesses yang approved
SELECT * FROM businesses WHERE status = 'approved';

-- Cek produk dengan harga > 100,000
SELECT * FROM products WHERE price > 100000 ORDER BY price DESC;

-- Cek dashboard statistics
SELECT * FROM v_dashboard_stats;

-- Cek bisnis dengan jumlah produk
SELECT * FROM v_businesses_with_owner;
```

### 3. Test Stored Procedures

```sql
-- Test add to cart
CALL sp_add_to_cart('user_test_001', 'prod_001_001', 'biz_001', 2);

-- Test checkout
CALL sp_checkout(
    'user_test_001',
    'order_test_001',
    'Test User',
    '081234567890',
    'Jl. Test No. 123',
    'Jakarta',
    '12345',
    'bank_transfer'
);
```

---

## 🔍 Troubleshooting

### Problem 1: "Access denied for user 'root'"
**Solusi:**
```sql
-- Reset password MySQL root
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### Problem 2: "Table doesn't exist"
**Solusi:**
- Pastikan Anda sudah import `pasar_umkm_schema.sql` terlebih dahulu
- Cek apakah database `pasar_umkm` sudah dibuat: `SHOW DATABASES;`
- Cek tabel: `USE pasar_umkm; SHOW TABLES;`

### Problem 3: "Cannot add foreign key constraint"
**Solusi:**
- Drop database dan import ulang
```sql
DROP DATABASE pasar_umkm;
```
- Import schema lagi dari awal

### Problem 4: phpMyAdmin tidak bisa dibuka
**Solusi:**
1. Cek Apache sudah running di XAMPP
2. Cek port 80 tidak bentrok: `netstat -ano | findstr :80`
3. Restart XAMPP
4. Coba akses: `http://127.0.0.1/phpmyadmin`

### Problem 5: Charset/Encoding Error
**Solusi:**
```sql
ALTER DATABASE pasar_umkm 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Untuk setiap tabel
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🔒 Security Best Practices

### 1. Password Hashing
**JANGAN** simpan password plain text! Gunakan bcrypt:

```php
// Saat register
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Saat login
if (password_verify($inputPassword, $hashedPassword)) {
    // Login berhasil
}
```

### 2. Prepared Statements
**SELALU** gunakan prepared statements untuk mencegah SQL Injection:

```php
// ❌ JANGAN seperti ini
$query = "SELECT * FROM users WHERE email = '$email'";

// ✅ LAKUKAN seperti ini
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

### 3. Input Validation
```php
// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Email tidak valid");
}

// Sanitize input
$name = htmlspecialchars(trim($name), ENT_QUOTES, 'UTF-8');
```

### 4. HTTPS
Untuk production, WAJIB gunakan HTTPS!

---

## 📈 Performa Optimization

### 1. Enable Query Cache
Edit `my.ini` (di folder XAMPP):
```ini
query_cache_type = 1
query_cache_size = 64M
```

### 2. Index Optimization
Semua foreign keys dan kolom yang sering di-query sudah diberi index.

### 3. Connection Pooling
Untuk production, gunakan connection pooling.

---

## 🔄 Backup & Restore

### Backup Database
```bash
# Via Command Line
cd C:\xampp\mysql\bin
mysqldump -u root pasar_umkm > backup_pasar_umkm.sql

# Via phpMyAdmin
# Klik database > Export > Go
```

### Restore Database
```bash
# Via Command Line
mysql -u root pasar_umkm < backup_pasar_umkm.sql

# Via phpMyAdmin
# Klik database > Import > Choose file > Go
```

---

## 📚 Resources

### Dokumentasi:
- MySQL: https://dev.mysql.com/doc/
- PHP PDO: https://www.php.net/manual/en/book.pdo.php
- phpMyAdmin: https://www.phpmyadmin.net/docs/

### Tutorial:
- XAMPP: https://www.apachefriends.org/faq.html
- PHP MySQL: https://www.w3schools.com/php/php_mysql_intro.asp

---

## 📞 Support

Jika ada masalah:
1. Cek error log di: `C:\xampp\mysql\data\mysql_error.log`
2. Cek PHP error log di: `C:\xampp\apache\logs\error.log`
3. Enable error reporting di PHP:
```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

---

## 📝 Changelog

- **v1.0** (Dec 2024): Initial database structure
  - 9 tables dengan relasi foreign keys
  - 50 produk dummy dari 10 bisnis
  - 13 test users (1 admin, 2 test, 10 UMKM owners)
  - Stored procedures untuk cart & checkout
  - Views untuk dashboard stats
  - Triggers untuk auto-update rating

---

**Last Updated**: December 17, 2024

**Database Version**: 1.0

**Compatible With**: MySQL 5.7+, MariaDB 10.2+
