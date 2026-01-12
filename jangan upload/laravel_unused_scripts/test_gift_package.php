<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Testing Gift Package Creation...\n\n";
    
    // Test data
    $data = [
        'kodeproduk' => 'P001',
        'kodepengguna' => 'SYSTEM',
        'namaproduk' => 'Test Paket Hadiah',
        'detail' => 'Deskripsi test paket hadiah',
        'harga' => 100000,
        'stok' => 999,
        'gambarproduk' => 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
        'status' => 'Lebaran',
        'kategori' => 'paket_hadiah',
        'items' => json_encode(['Item 1', 'Item 2', 'Item 3']),
    ];
    
    // Disable FK check
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // Insert
    DB::table('tproduk')->insert($data);
    
    // Re-enable FK check
    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    
    echo "✅ Gift package created successfully!\n";
    echo "Kodeproduk: P001\n";
    
    // Fetch back
    $package = DB::table('tproduk')
        ->where('kodeproduk', 'P001')
        ->where('kategori', 'paket_hadiah')
        ->first();
    
    if ($package) {
        echo "\nFetched data:\n";
        echo "  Name: {$package->namaproduk}\n";
        echo "  Price: {$package->harga}\n";
        echo "  Category: {$package->status}\n";
        echo "  Items: {$package->items}\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
