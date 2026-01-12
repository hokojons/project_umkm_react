<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Reset product 40 to rejected with new comments
DB::table('tproduk')->where('id', 40)->update([
    'approval_status' => 'rejected',
    'status' => 'inactive',
    'nama_produk' => 'kim ji won',
    'deskripsi' => 'Produk makanan korea',
    'harga' => 30000
]);

// Add fresh rejection comments
DB::table('product_rejection_comments')->insert([
    [
        'kodeproduk' => 'P40',
        'kodepengguna' => 'U8',
        'comment' => 'Harga terlalu mahal, kurangi harga',
        'status' => 'rejected',
        'admin_id' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'kodeproduk' => 'P40',
        'kodepengguna' => 'U8',
        'comment' => 'Deskripsi kurang jelas, tambahkan detail produk',
        'status' => 'rejected',
        'admin_id' => 1,
        'created_at' => now()->subMinutes(5),
        'updated_at' => now()->subMinutes(5)
    ]
]);

echo "Product 40 reset to REJECTED with 2 new comments\n";
echo "Ready for testing resubmit feature!\n";
