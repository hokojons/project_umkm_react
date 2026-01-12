<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING getUserUmkm WITH MODERN TABLE ===\n\n";

// Get user with UMKM role
$umkmUser = DB::table('users')->where('role', 'umkm')->first();

if (!$umkmUser) {
    echo "No UMKM user found!\n";
    exit;
}

echo "Testing with user: {$umkmUser->name} (ID: {$umkmUser->id})\n";
echo "Role: {$umkmUser->role}\n\n";

// Check if UMKM exists in modern table
$umkm = DB::table('tumkm')
    ->where('user_id', $umkmUser->id)
    ->first();

if ($umkm) {
    echo "✓ UMKM found in database:\n";
    echo "  ID: {$umkm->id}\n";
    echo "  User ID: {$umkm->user_id}\n";
    echo "  Nama Toko: {$umkm->nama_toko}\n";
    echo "  Nama Pemilik: {$umkm->nama_pemilik}\n";
    echo "  Status: {$umkm->status}\n";
    echo "  WhatsApp: {$umkm->whatsapp}\n";
    
    // Check products
    $products = DB::table('tproduk')
        ->where('umkm_id', $umkm->id)
        ->get();
    
    echo "\n  Products: " . $products->count() . " found\n";
    foreach($products as $p) {
        echo "    - {$p->nama_produk} (Status: {$p->status})\n";
    }
} else {
    echo "✗ No UMKM found for user_id: {$umkmUser->id}\n";
    
    // Show all UMKM
    echo "\nAll UMKM in database:\n";
    $allUmkm = DB::table('tumkm')->get();
    foreach($allUmkm as $u) {
        echo "  - User ID {$u->user_id}: {$u->nama_toko} (Status: {$u->status})\n";
    }
}
