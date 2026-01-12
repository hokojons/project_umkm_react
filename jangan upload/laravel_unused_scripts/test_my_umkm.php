<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING getUserUmkm ENDPOINT ===\n\n";

// Get user with UMKM role
$umkmUser = DB::table('users')->where('role', 'umkm')->first();

if (!$umkmUser) {
    echo "No UMKM user found!\n";
    exit;
}

echo "Testing with user: {$umkmUser->name} (ID: {$umkmUser->id})\n";
echo "Role: {$umkmUser->role}\n\n";

// Generate kodepengguna
$kodepengguna = 'U' . str_pad($umkmUser->id, 3, '0', STR_PAD_LEFT);
echo "Expected kodepengguna: $kodepengguna\n\n";

// Check if UMKM exists
$umkm = DB::table('tumkm')
    ->where('kodepengguna', $kodepengguna)
    ->first();

if ($umkm) {
    echo "✓ UMKM found in database:\n";
    echo "  Kode: {$umkm->kodepengguna}\n";
    echo "  Nama Toko: {$umkm->namatoko}\n";
    echo "  Nama Pemilik: {$umkm->namapemilik}\n";
    echo "  Status: {$umkm->statuspengajuan}\n";
    echo "  Foto: {$umkm->fototoko}\n";
    
    // Check products
    $products = DB::table('tproduk')
        ->where('kodepengguna', $kodepengguna)
        ->get();
    
    echo "\n  Products: " . $products->count() . " found\n";
    foreach($products as $p) {
        echo "    - {$p->namaproduk} (Status: {$p->status})\n";
    }
} else {
    echo "✗ No UMKM found for kodepengguna: $kodepengguna\n";
    
    // Show all UMKM
    echo "\nAll UMKM in database:\n";
    $allUmkm = DB::table('tumkm')->get();
    foreach($allUmkm as $u) {
        echo "  - {$u->kodepengguna}: {$u->namatoko}\n";
    }
}
