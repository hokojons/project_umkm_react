<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "🌟 Creating Demo UMKM Data...\n\n";

// Step 1: Create categories first
echo "Step 1: Creating categories...\n";
$categories = [
    ['nama_kategori' => 'Makanan', 'deskripsi' => 'Produk makanan dan kuliner'],
    ['nama_kategori' => 'Minuman', 'deskripsi' => 'Minuman segar dan kopi'],
    ['nama_kategori' => 'Fashion', 'deskripsi' => 'Pakaian dan aksesoris'],
    ['nama_kategori' => 'Kerajinan', 'deskripsi' => 'Kerajinan tangan'],
    ['nama_kategori' => 'Kecantikan', 'deskripsi' => 'Produk kecantikan'],
];

$categoryIds = [];
foreach ($categories as $cat) {
    $existing = DB::table('tkategori')->where('nama_kategori', $cat['nama_kategori'])->first();
    if ($existing) {
        $categoryIds[$cat['nama_kategori']] = $existing->id;
        echo "  ✓ Category '{$cat['nama_kategori']}' already exists (ID: {$existing->id})\n";
    } else {
        $id = DB::table('tkategori')->insertGetId([
            'nama_kategori' => $cat['nama_kategori'],
            'deskripsi' => $cat['deskripsi'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $categoryIds[$cat['nama_kategori']] = $id;
        echo "  ✓ Created category '{$cat['nama_kategori']}' (ID: $id)\n";
    }
}

echo "\nStep 2: Creating 5 UMKM stores...\n";

// UMKM 1: Warung Nasi
$user1 = DB::table('users')->where('email', 'sari@umkm.com')->first();
if (!$user1) {
    $userId1 = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Sari Wulandari',
        'email' => 'sari@umkm.com',
        'password' => Hash::make('password'),
        'no_telepon' => '081234567801',
        'role' => 'umkm_owner',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $userId1 = $user1->id;
}

$umkm1 = DB::table('tumkm')->insertGetId([
    'user_id' => $userId1,
    'nama_toko' => 'Warung Nasi Ibu Sari',
    'nama_pemilik' => 'Sari Wulandari',
    'email' => 'sari@umkm.com',
    'deskripsi' => 'Warung nasi dengan menu masakan rumahan yang lezat',
    'kategori_id' => $categoryIds['Makanan'],
    'foto_toko' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    'whatsapp' => '081234567801',
    'instagram' => '@warung_ibu_sari',
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

DB::table('tproduk')->insert([
    ['umkm_id' => $umkm1, 'nama_produk' => 'Nasi Goreng Spesial', 'harga' => 15000, 'stok' => 50, 'deskripsi' => 'Nasi goreng dengan telur dan ayam', 'gambar' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', 'kategori' => 'Makanan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
    ['umkm_id' => $umkm1, 'nama_produk' => 'Ayam Bakar Madu', 'harga' => 25000, 'stok' => 30, 'deskripsi' => 'Ayam bakar dengan bumbu madu', 'gambar' => 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', 'kategori' => 'Makanan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
]);

echo "  ✓ Created: Warung Nasi Ibu Sari (2 products)\n";

// UMKM 2: Kopi
$user2 = DB::table('users')->where('email', 'budisantoso@umkm.com')->first();
if (!$user2) {
    $userId2 = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Budi Santoso',
        'email' => 'budisantoso@umkm.com',
        'password' => Hash::make('password'),
        'no_telepon' => '081234567802',
        'role' => 'umkm_owner',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $userId2 = $user2->id;
}

$umkm2 = DB::table('tumkm')->insertGetId([
    'user_id' => $userId2,
    'nama_toko' => 'Kopi Kenangan Pak Budi',
    'nama_pemilik' => 'Budi Santoso',
    'email' => 'budisantoso@umkm.com',
    'deskripsi' => 'Kedai kopi dengan biji kopi pilihan',
    'kategori_id' => $categoryIds['Minuman'],
    'foto_toko' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
    'whatsapp' => '081234567802',
    'instagram' => '@kopi_kenangan',
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

DB::table('tproduk')->insert([
    ['umkm_id' => $umkm2, 'nama_produk' => 'Kopi Susu Gula Aren', 'harga' => 18000, 'stok' => 100, 'deskripsi' => 'Kopi susu dengan gula aren', 'gambar' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 'kategori' => 'Minuman', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
    ['umkm_id' => $umkm2, 'nama_produk' => 'Cappuccino', 'harga' => 22000, 'stok' => 60, 'deskripsi' => 'Cappuccino klasik', 'gambar' => 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 'kategori' => 'Minuman', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
]);

echo "  ✓ Created: Kopi Kenangan Pak Budi (2 products)\n";

// UMKM 3: Batik
$user3 = DB::table('users')->where('email', 'dewi@umkm.com')->first();
if (!$user3) {
    $userId3 = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Dewi Lestari',
        'email' => 'dewi@umkm.com',
        'password' => Hash::make('password'),
        'no_telepon' => '081234567803',
        'role' => 'umkm_owner',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $userId3 = $user3->id;
}

$umkm3 = DB::table('tumkm')->insertGetId([
    'user_id' => $userId3,
    'nama_toko' => 'Batik Cantik Mbak Dewi',
    'nama_pemilik' => 'Dewi Lestari',
    'email' => 'dewi@umkm.com',
    'deskripsi' => 'Batik tulis dan cap motif tradisional',
    'kategori_id' => $categoryIds['Fashion'],
    'foto_toko' => 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400&h=300&fit=crop',
    'whatsapp' => '081234567803',
    'instagram' => '@batik_dewi',
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

DB::table('tproduk')->insert([
    ['umkm_id' => $umkm3, 'nama_produk' => 'Kemeja Batik Pria', 'harga' => 150000, 'stok' => 25, 'deskripsi' => 'Kemeja batik cap motif parang', 'gambar' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=300&fit=crop', 'kategori' => 'Fashion', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
    ['umkm_id' => $umkm3, 'nama_produk' => 'Dress Batik Wanita', 'harga' => 200000, 'stok' => 20, 'deskripsi' => 'Dress batik tulis motif bunga', 'gambar' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop', 'kategori' => 'Fashion', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
]);

echo "  ✓ Created: Batik Cantik Mbak Dewi (2 products)\n";

// UMKM 4: Keripik
$user4 = DB::table('users')->where('email', 'joko@umkm.com')->first();
if (!$user4) {
    $userId4 = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Joko Widodo',
        'email' => 'joko@umkm.com',
        'password' => Hash::make('password'),
        'no_telepon' => '081234567804',
        'role' => 'umkm_owner',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $userId4 = $user4->id;
}

$umkm4 = DB::table('tumkm')->insertGetId([
    'user_id' => $userId4,
    'nama_toko' => 'Keripik Singkong Mas Joko',
    'nama_pemilik' => 'Joko Widodo',
    'email' => 'joko@umkm.com',
    'deskripsi' => 'Keripik singkong renyah berbagai rasa',
    'kategori_id' => $categoryIds['Makanan'],
    'foto_toko' => 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
    'whatsapp' => '081234567804',
    'instagram' => '@keripik_joko',
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

DB::table('tproduk')->insert([
    ['umkm_id' => $umkm4, 'nama_produk' => 'Keripik Singkong Original', 'harga' => 15000, 'stok' => 100, 'deskripsi' => 'Keripik singkong rasa original', 'gambar' => 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop', 'kategori' => 'Makanan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
    ['umkm_id' => $umkm4, 'nama_produk' => 'Keripik Singkong Balado', 'harga' => 17000, 'stok' => 80, 'deskripsi' => 'Keripik singkong pedas balado', 'gambar' => 'https://images.unsplash.com/photo-1613564834361-9436948817d1?w=400&h=300&fit=crop', 'kategori' => 'Makanan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
]);

echo "  ✓ Created: Keripik Singkong Mas Joko (2 products)\n";

// UMKM 5: Tas Rajut
$user5 = DB::table('users')->where('email', 'ani@umkm.com')->first();
if (!$user5) {
    $userId5 = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Ani Yulianti',
        'email' => 'ani@umkm.com',
        'password' => Hash::make('password'),
        'no_telepon' => '081234567805',
        'role' => 'umkm_owner',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
} else {
    $userId5 = $user5->id;
}

$umkm5 = DB::table('tumkm')->insertGetId([
    'user_id' => $userId5,
    'nama_toko' => 'Tas Rajut Ibu Ani',
    'nama_pemilik' => 'Ani Yulianti',
    'email' => 'ani@umkm.com',
    'deskripsi' => 'Tas rajut handmade desain unik',
    'kategori_id' => $categoryIds['Kerajinan'],
    'foto_toko' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop',
    'whatsapp' => '081234567805',
    'instagram' => '@tas_rajut_ani',
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

DB::table('tproduk')->insert([
    ['umkm_id' => $umkm5, 'nama_produk' => 'Tas Rajut Mini', 'harga' => 50000, 'stok' => 40, 'deskripsi' => 'Tas rajut mini untuk HP', 'gambar' => 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=300&fit=crop', 'kategori' => 'Kerajinan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
    ['umkm_id' => $umkm5, 'nama_produk' => 'Tas Rajut Tote Bag', 'harga' => 85000, 'stok' => 30, 'deskripsi' => 'Tote bag rajut untuk belanja', 'gambar' => 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400&h=300&fit=crop', 'kategori' => 'Kerajinan', 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
]);

echo "  ✓ Created: Tas Rajut Ibu Ani (2 products)\n";

echo "\n✅ Successfully created 5 UMKM stores with 10 products!\n";
echo "\n📊 Summary:\n";
echo "  - 5 categories\n";
echo "  - 5 UMKM stores\n";
echo "  - 5 UMKM owner accounts\n";
echo "  - 10 products total\n";
echo "  - All accounts use password: 'password'\n";
echo "\n🌐 View at:\n";
echo "  - Homepage: http://localhost:5173\n";
echo "  - Products: http://localhost:5173/products\n";
echo "  - Admin: http://localhost:5173 (login as admin@umkm.com)\n";
