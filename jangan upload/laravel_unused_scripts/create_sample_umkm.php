<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== CREATING SAMPLE UMKM ===\n\n";

// Get UMKM owner users
$umkmOwners = DB::table('users')->where('role', 'umkm')->get();

if ($umkmOwners->count() == 0) {
    echo "No UMKM owners found!\n";
    exit;
}

$categories = [
    ['nama' => 'Toko Kue Lestari', 'desc' => 'Kue dan roti tradisional buatan sendiri', 'kategori_id' => 1],
    ['nama' => 'Fashion Batik Jaya', 'desc' => 'Batik modern dan tradisional berkualitas', 'kategori_id' => 2],
    ['nama' => 'Kerajinan Bambu Indah', 'desc' => 'Kerajinan tangan dari bambu', 'kategori_id' => 3],
    ['nama' => 'Warung Kopi Nusantara', 'desc' => 'Kopi lokal pilihan dengan cita rasa terbaik', 'kategori_id' => 1],
    ['nama' => 'Tas Rajut Cantik', 'desc' => 'Tas rajut handmade dengan berbagai model', 'kategori_id' => 2],
];

$count = 0;
foreach ($umkmOwners as $index => $owner) {
    if ($index >= count($categories)) break;
    
    $cat = $categories[$index];
    
    // Check if UMKM already exists for this user
    $exists = DB::table('tumkm')->where('user_id', $owner->id)->first();
    
    if ($exists) {
        echo "⚠ Skipped: {$owner->email} - already has UMKM\n";
        continue;
    }
    
    DB::table('tumkm')->insert([
        'user_id' => $owner->id,
        'nama_toko' => $cat['nama'],
        'nama_pemilik' => $owner->nama_lengkap,
        'deskripsi' => $cat['desc'],
        'foto_toko' => null,
        'kategori_id' => null, // Set to null for now
        'whatsapp' => $owner->no_telepon,
        'telepon' => $owner->no_telepon,
        'email' => $owner->email,
        'instagram' => '@' . strtolower(str_replace(' ', '', $cat['nama'])),
        'about_me' => 'Kami adalah UMKM lokal yang berkomitmen memberikan produk berkualitas',
        'alamat' => 'Jl. Raya No. ' . (10 + $index) . ', Jakarta',
        'kota' => 'Jakarta',
        'kode_pos' => '12345',
        'status' => 'active',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Created: {$cat['nama']} (Owner: {$owner->email})\n";
    $count++;
}

echo "\n=== CREATED $count UMKM ===\n\n";
