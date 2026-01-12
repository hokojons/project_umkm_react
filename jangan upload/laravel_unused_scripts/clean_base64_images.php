<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Cleaning base64 images from database...\n\n";

// Clean foto_toko base64 in tumkm table
$umkmCount = DB::table('tumkm')
    ->where('foto_toko', 'like', 'data:image%')
    ->update(['foto_toko' => null]);

echo "✓ Cleaned {$umkmCount} base64 foto_toko in tumkm table\n";

// Clean gambar base64 in tproduk table
$produkCount = DB::table('tproduk')
    ->where('gambar', 'like', 'data:image%')
    ->update(['gambar' => null]);

echo "✓ Cleaned {$produkCount} base64 gambar in tproduk table\n";

echo "\n✅ Done! All base64 images have been removed.\n";
echo "Users will need to re-upload their images.\n";
