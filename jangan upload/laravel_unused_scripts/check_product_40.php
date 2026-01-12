<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$product = DB::table('tproduk')->where('id', 40)->first();

if($product) {
    echo "Product 40:\n";
    echo "  - Nama: {$product->nama_produk}\n";
    echo "  - UMKM ID: {$product->umkm_id}\n\n";
    
    $umkm = DB::table('tumkm')->where('id', $product->umkm_id)->first();
    if($umkm) {
        echo "UMKM Info:\n";
        echo "  - Nama: {$umkm->nama_toko}\n";
        echo "  - User ID: {$umkm->user_id}\n";
    }
} else {
    echo "Product 40 not found\n";
}
