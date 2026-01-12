<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Populate Database ===\n\n";

// 1. Insert kategori
echo "1. Membuat kategori...\n";
DB::table('tkategori')->insert([
    ['kodekategori' => 'K001', 'namakategori' => 'Makanan', 'status' => 'aktif'],
    ['kodekategori' => 'K002', 'namakategori' => 'Minuman', 'status' => 'aktif'],
    ['kodekategori' => 'K003', 'namakategori' => 'Kerajinan', 'status' => 'aktif'],
    ['kodekategori' => 'K004', 'namakategori' => 'Fashion', 'status' => 'aktif'],
    ['kodekategori' => 'K005', 'namakategori' => 'Lainnya', 'status' => 'aktif'],
]);
echo "✓ Kategori dibuat\n\n";

// 2. Insert admin
echo "2. Membuat admin...\n";
DB::table('tadmin')->insert([
    'kodeadmin' => 'A001',
    'namaadmin' => 'admin',
    'katakunci' => password_hash('admin123', PASSWORD_DEFAULT),
    'status' => 'aktif'
]);
echo "✓ Admin: admin / admin123\n\n";

// 3. Insert test users
echo "3. Membuat user test...\n";
DB::table('tpengguna')->insert([
    [
        'kodepengguna' => 'U001',
        'namapengguna' => 'budi',
        'teleponpengguna' => '081234567890',
        'katakunci' => password_hash('budi123', PASSWORD_DEFAULT),
        'status' => 'aktif'
    ],
    [
        'kodepengguna' => 'U002',
        'namapengguna' => 'siti',
        'teleponpengguna' => '081234567891',
        'katakunci' => password_hash('siti123', PASSWORD_DEFAULT),
        'status' => 'aktif'
    ],
    [
        'kodepengguna' => 'U003',
        'namapengguna' => 'andi',
        'teleponpengguna' => '081234567892',
        'katakunci' => password_hash('andi123', PASSWORD_DEFAULT),
        'status' => 'aktif'
    ]
]);
echo "✓ User: budi / budi123\n";
echo "✓ User: siti / siti123\n";
echo "✓ User: andi / andi123\n\n";

// 4. Insert UMKM (sudah approved)
echo "4. Membuat UMKM test...\n";
DB::table('tumkm')->insert([
    [
        'kodepengguna' => 'U001',
        'namapemilik' => 'Budi Santoso',
        'namatoko' => 'Warung Budi',
        'alamattoko' => 'Jl. Merdeka No. 123, Jakarta',
        'fototoko' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        'statuspengajuan' => 'active',
        'kodekategori' => 'K001'
    ],
    [
        'kodepengguna' => 'U002',
        'namapemilik' => 'Siti Nurhaliza',
        'namatoko' => 'Kopi Siti',
        'alamattoko' => 'Jl. Sudirman No. 45, Bandung',
        'fototoko' => 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400',
        'statuspengajuan' => 'active',
        'kodekategori' => 'K002'
    ]
]);
echo "✓ UMKM: Warung Budi (U001)\n";
echo "✓ UMKM: Kopi Siti (U002)\n\n";

// 5. Insert produk
echo "5. Membuat produk test...\n";
DB::table('tproduk')->insert([
    [
        'kodepengguna' => 'U001',
        'kodeproduk' => 'P001',
        'namaproduk' => 'Nasi Goreng Spesial',
        'harga' => 25000,
        'stok' => 50,
        'detail' => 'Nasi goreng dengan bumbu rahasia',
        'gambarproduk' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        'status' => 'active',
        'kategori' => 'produk'
    ],
    [
        'kodepengguna' => 'U001',
        'kodeproduk' => 'P002',
        'namaproduk' => 'Mie Ayam',
        'harga' => 20000,
        'stok' => 30,
        'detail' => 'Mie ayam dengan topping lengkap',
        'gambarproduk' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        'status' => 'active',
        'kategori' => 'produk'
    ],
    [
        'kodepengguna' => 'U002',
        'kodeproduk' => 'P003',
        'namaproduk' => 'Kopi Arabica',
        'harga' => 15000,
        'stok' => 100,
        'detail' => 'Kopi arabica premium',
        'gambarproduk' => 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
        'status' => 'active',
        'kategori' => 'produk'
    ],
    [
        'kodepengguna' => 'U002',
        'kodeproduk' => 'P004',
        'namaproduk' => 'Cappuccino',
        'harga' => 18000,
        'stok' => 80,
        'detail' => 'Cappuccino dengan foam susu',
        'gambarproduk' => 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
        'status' => 'active',
        'kategori' => 'produk'
    ]
]);
echo "✓ 4 produk dibuat\n\n";

echo "=== SELESAI ===\n";
echo "Database sudah di-populate dengan data test!\n\n";
echo "Login Info:\n";
echo "- Admin: admin / admin123\n";
echo "- User: budi / budi123 (punya UMKM)\n";
echo "- User: siti / siti123 (punya UMKM)\n";
echo "- User: andi / andi123 (belum punya UMKM)\n";
