<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== CREATING MISSING TABLES ===\n\n";

try {
    // 1. Create tpengguna (event participants)
    echo "Creating tpengguna table...\n";
    DB::statement("
        CREATE TABLE IF NOT EXISTS `tpengguna` (
            `kodependaftar` VARCHAR(10) PRIMARY KEY,
            `namalengkap` VARCHAR(100) NOT NULL,
            `email` VARCHAR(100) NOT NULL,
            `notelepon` VARCHAR(20) NOT NULL,
            `kodeacara` VARCHAR(10) NULL,
            `created_at` TIMESTAMP NULL,
            `updated_at` TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ tpengguna created\n\n";

    // 2. Create tacara (events)
    echo "Creating tacara table...\n";
    DB::statement("
        CREATE TABLE IF NOT EXISTS `tacara` (
            `kodeacara` VARCHAR(10) PRIMARY KEY,
            `namaacara` VARCHAR(100) NOT NULL,
            `detail` TEXT,
            `tanggal` DATE NOT NULL,
            `kuotapeserta` INT NOT NULL DEFAULT 0,
            `tanggaldaftar` DATE NOT NULL,
            `lokasi` VARCHAR(200),
            `gambar` VARCHAR(255),
            `gambar_position_x` INT DEFAULT 50,
            `gambar_position_y` INT DEFAULT 50,
            `status` ENUM('active', 'inactive') DEFAULT 'active',
            `created_at` TIMESTAMP NULL,
            `updated_at` TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ tacara created\n\n";

    // 3. Create foreign key
    echo "Adding foreign key...\n";
    DB::statement("
        ALTER TABLE `tpengguna` 
        ADD CONSTRAINT `fk_tpengguna_tacara` 
        FOREIGN KEY (`kodeacara`) 
        REFERENCES `tacara`(`kodeacara`) 
        ON DELETE CASCADE
    ");
    echo "✓ Foreign key added\n\n";

    // 4. Create tkategori (categories)
    echo "Creating tkategori table...\n";
    DB::statement("
        CREATE TABLE IF NOT EXISTS `tkategori` (
            `kodekategori` VARCHAR(10) PRIMARY KEY,
            `namakategori` VARCHAR(50) NOT NULL,
            `deskripsi` TEXT,
            `created_at` TIMESTAMP NULL,
            `updated_at` TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ tkategori created\n\n";

    // 5. Create tadmin table
    echo "Creating tadmin table...\n";
    DB::statement("
        CREATE TABLE IF NOT EXISTS `tadmin` (
            `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(50) UNIQUE NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `nama` VARCHAR(100) NOT NULL,
            `email` VARCHAR(100) UNIQUE NOT NULL,
            `created_at` TIMESTAMP NULL,
            `updated_at` TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ tadmin created\n\n";

    // 6. Insert admin user
    echo "Creating admin user...\n";
    DB::table('tadmin')->insert([
        'username' => 'admin',
        'password' => password_hash('password', PASSWORD_DEFAULT),
        'nama' => 'Administrator',
        'email' => 'admin@umkm.com',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "✓ Admin created (username: admin, password: password)\n\n";

    // 7. Insert sample categories
    echo "Creating sample categories...\n";
    $categories = [
        ['kodekategori' => 'KAT001', 'namakategori' => 'Makanan', 'deskripsi' => 'Produk makanan dan minuman'],
        ['kodekategori' => 'KAT002', 'namakategori' => 'Fashion', 'deskripsi' => 'Pakaian dan aksesoris'],
        ['kodekategori' => 'KAT003', 'namakategori' => 'Kerajinan', 'deskripsi' => 'Kerajinan tangan'],
        ['kodekategori' => 'KAT004', 'namakategori' => 'Elektronik', 'deskripsi' => 'Produk elektronik'],
        ['kodekategori' => 'KAT005', 'namakategori' => 'Jasa', 'deskripsi' => 'Layanan jasa'],
    ];

    foreach ($categories as $cat) {
        DB::table('tkategori')->insert([
            'kodekategori' => $cat['kodekategori'],
            'namakategori' => $cat['namakategori'],
            'deskripsi' => $cat['deskripsi'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "  ✓ {$cat['namakategori']}\n";
    }

    // 8. Insert sample events
    echo "\nCreating sample events...\n";
    $events = [
        [
            'kodeacara' => 'EVT001',
            'namaacara' => 'Bazar UMKM Januari',
            'detail' => 'Bazar produk UMKM lokal dengan berbagai promo menarik',
            'tanggal' => '2026-01-20',
            'kuotapeserta' => 100,
            'tanggaldaftar' => '2026-01-15',
            'lokasi' => 'Lapangan Taman Kota',
            'gambar' => null,
            'gambar_position_x' => 50,
            'gambar_position_y' => 50,
        ],
        [
            'kodeacara' => 'EVT002',
            'namaacara' => 'Workshop Digital Marketing',
            'detail' => 'Pelatihan pemasaran digital untuk pelaku UMKM',
            'tanggal' => '2026-01-25',
            'kuotapeserta' => 50,
            'tanggaldaftar' => '2026-01-20',
            'lokasi' => 'Gedung Serbaguna',
            'gambar' => null,
            'gambar_position_x' => 50,
            'gambar_position_y' => 50,
        ],
        [
            'kodeacara' => 'EVT003',
            'namaacara' => 'Pameran Produk Lokal',
            'detail' => 'Pameran produk lokal terbaik dari seluruh kota',
            'tanggal' => '2026-02-01',
            'kuotapeserta' => 150,
            'tanggaldaftar' => '2026-01-28',
            'lokasi' => 'Mall Kota',
            'gambar' => null,
            'gambar_position_x' => 50,
            'gambar_position_y' => 50,
        ],
    ];

    foreach ($events as $event) {
        DB::table('tacara')->insert([
            'kodeacara' => $event['kodeacara'],
            'namaacara' => $event['namaacara'],
            'detail' => $event['detail'],
            'tanggal' => $event['tanggal'],
            'kuotapeserta' => $event['kuotapeserta'],
            'tanggaldaftar' => $event['tanggaldaftar'],
            'lokasi' => $event['lokasi'],
            'gambar' => $event['gambar'],
            'gambar_position_x' => $event['gambar_position_x'],
            'gambar_position_y' => $event['gambar_position_y'],
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "  ✓ {$event['namaacara']}\n";
    }

    // 9. Insert sample event participants
    echo "\nCreating sample event participants...\n";
    $participants = [
        ['kodependaftar' => 'V001', 'namalengkap' => 'Ahmad Rizki', 'email' => 'ahmad@mail.com', 'notelepon' => '081234567801', 'kodeacara' => 'EVT001'],
        ['kodependaftar' => 'V002', 'namalengkap' => 'Siti Aminah', 'email' => 'siti@mail.com', 'notelepon' => '081234567802', 'kodeacara' => 'EVT001'],
        ['kodependaftar' => 'V003', 'namalengkap' => 'Budi Santoso', 'email' => 'budi@mail.com', 'notelepon' => '081234567803', 'kodeacara' => 'EVT002'],
        ['kodependaftar' => 'V004', 'namalengkap' => 'Dewi Lestari', 'email' => 'dewi@mail.com', 'notelepon' => '081234567804', 'kodeacara' => 'EVT002'],
        ['kodependaftar' => 'V005', 'namalengkap' => 'Eko Prasetyo', 'email' => 'eko@mail.com', 'notelepon' => '081234567805', 'kodeacara' => 'EVT003'],
    ];

    foreach ($participants as $p) {
        DB::table('tpengguna')->insert([
            'kodependaftar' => $p['kodependaftar'],
            'namalengkap' => $p['namalengkap'],
            'email' => $p['email'],
            'notelepon' => $p['notelepon'],
            'kodeacara' => $p['kodeacara'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "  ✓ {$p['namalengkap']}\n";
    }

    echo "\n=== ALL TABLES CREATED SUCCESSFULLY ===\n\n";

} catch (\Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
