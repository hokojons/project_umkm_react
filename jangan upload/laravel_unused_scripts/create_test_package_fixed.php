<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$umkm = DB::table('tumkm')->first();

if ($umkm) {
    echo "First UMKM ID: {$umkm->id}\n";
    echo "Creating test package with this UMKM ID...\n\n";
    
    $items = [
        'Mukena batik eksklusif',
        'Kue kering premium 3 toples',
        'Kurma mewah',
        'Tas goodie bag cantik'
    ];
    
    $description = "Paket berisi:\n- " . implode("\n- ", $items);
    
    $id = DB::table('tproduk')->insertGetId([
        'umkm_id' => $umkm->id,
        'nama_produk' => 'TEST Paket Lebaran Complete',
        'deskripsi' => $description,
        'harga' => 350000,
        'stok' => 100,
        'gambar' => 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
        'status' => 'active',
        'kategori' => 'Paket',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Package created with ID: $id\n\n";
    
    // Parse back
    $pkg = DB::table('tproduk')->where('id', $id)->first();
    $parsedItems = [];
    if ($pkg->deskripsi && strpos($pkg->deskripsi, 'Paket berisi:') !== false) {
        $parts = explode('Paket berisi:', $pkg->deskripsi);
        if (count($parts) > 1) {
            $itemsText = trim($parts[1]);
            $lines = preg_split('/\r\n|\r|\n/', $itemsText);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (strpos($trimmed, '-') === 0) {
                    $item = trim(substr($trimmed, 1));
                    if (!empty($item)) {
                        $parsedItems[] = $item;
                    }
                }
            }
        }
    }
    
    echo "Parsed items (" . count($parsedItems) . "):\n";
    foreach($parsedItems as $item) {
        echo "  - $item\n";
    }
} else {
    echo "No UMKM found!\n";
}
