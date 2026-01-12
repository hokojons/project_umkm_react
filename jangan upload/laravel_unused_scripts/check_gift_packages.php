<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== GIFT PACKAGES IN DATABASE ===\n\n";

$packages = DB::table('tproduk')
    ->where('kategori', 'Paket')
    ->get();

echo "Found " . $packages->count() . " packages\n\n";

foreach($packages as $package) {
    echo "Package: {$package->nama_produk} (ID: {$package->id})\n";
    echo "  Image: {$package->gambar}\n";
    echo "  Description: " . substr($package->deskripsi, 0, 100) . "...\n";
    
    // Parse items
    $items = [];
    if ($package->deskripsi) {
        if (strpos($package->deskripsi, 'Paket berisi:') !== false) {
            $parts = explode('Paket berisi:', $package->deskripsi);
            if (count($parts) > 1) {
                $itemsText = trim($parts[1]);
                $lines = preg_split('/\r\n|\r|\n/', $itemsText);
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if (strpos($trimmed, '-') === 0) {
                        $item = trim(substr($trimmed, 1));
                        if (!empty($item)) {
                            $items[] = $item;
                        }
                    }
                }
            }
        }
    }
    
    echo "  Items (" . count($items) . "):\n";
    foreach($items as $item) {
        echo "    - $item\n";
    }
    echo "\n";
}
