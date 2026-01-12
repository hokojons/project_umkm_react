<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== CREATING CATEGORIES ===\n\n";

$categories = [
    ['name' => 'Makanan & Minuman', 'description' => 'Produk makanan dan minuman'],
    ['name' => 'Fashion & Pakaian', 'description' => 'Pakaian, aksesoris, dan fashion'],
    ['name' => 'Kerajinan Tangan', 'description' => 'Produk kerajinan dan handmade'],
    ['name' => 'Elektronik', 'description' => 'Produk elektronik dan gadget'],
    ['name' => 'Jasa & Layanan', 'description' => 'Berbagai jasa dan layanan'],
];

foreach ($categories as $cat) {
    DB::table('categories')->insert([
        'name' => $cat['name'],
        'description' => $cat['description'],
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    echo "✓ Created: {$cat['name']}\n";
}

echo "\n=== CREATED " . count($categories) . " CATEGORIES ===\n\n";
