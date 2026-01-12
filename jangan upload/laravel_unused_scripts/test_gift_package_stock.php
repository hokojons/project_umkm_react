<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Testing Gift Package Creation with Custom Stock\n";
echo "===============================================\n\n";

// Get first user
$firstUser = DB::table('tpengguna')->first();
echo "Using user: {$firstUser->kodepengguna}\n\n";

// Generate kodeproduk
$lastProduct = DB::table('tproduk')
    ->where('kodeproduk', 'like', 'P%')
    ->orderBy('kodeproduk', 'desc')
    ->first();

if ($lastProduct) {
    $lastNumber = (int) substr($lastProduct->kodeproduk, 1);
    $newNumber = $lastNumber + 1;
} else {
    $newNumber = 1;
}

$kodeproduk = 'P' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
echo "Generated kodeproduk: $kodeproduk\n";

// Insert test gift package with custom stock
try {
    DB::table('tproduk')->insert([
        'kodeproduk' => $kodeproduk,
        'kodepengguna' => $firstUser->kodepengguna,
        'namaproduk' => 'Paket Test Stock 25',
        'detail' => 'Test paket dengan stock custom 25',
        'harga' => 125000,
        'stok' => 25,
        'gambarproduk' => 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
        'status' => 'Lebaran',
        'kategori' => 'paket_hadiah',
        'items' => json_encode(['Kue Kering', 'Coklat', 'Kartu Ucapan']),
    ]);
    
    echo "\n✓ Gift package created successfully!\n\n";
    
    // Verify
    $package = DB::table('tproduk')
        ->where('kodeproduk', $kodeproduk)
        ->first();
    
    echo "Package Details:\n";
    echo "- Kode: {$package->kodeproduk}\n";
    echo "- Name: {$package->namaproduk}\n";
    echo "- Price: Rp " . number_format($package->harga, 0, ',', '.') . "\n";
    echo "- Stock: {$package->stok}\n";
    echo "- Category: {$package->status}\n";
    echo "- Items: {$package->items}\n";
    
} catch (\Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
}
