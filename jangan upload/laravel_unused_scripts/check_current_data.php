<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CURRENT DATA STATUS ===\n\n";

// Check UMKM
$umkmCount = DB::table('tumkm')->count();
echo "Total UMKM: $umkmCount\n";

if ($umkmCount > 0) {
    echo "\nUMKM Data:\n";
    $umkms = DB::table('tumkm')->get();
    foreach ($umkms as $umkm) {
        echo "  - ID: {$umkm->id}, Nama: {$umkm->nama_toko}, Status: {$umkm->status}\n";
        echo "    Foto: " . (empty($umkm->foto_toko) ? "❌ Tidak ada" : "✓ Ada") . "\n";
    }
}

// Check Products
echo "\n";
$produkCount = DB::table('tproduk')->count();
echo "Total Produk: $produkCount\n";

if ($produkCount > 0) {
    echo "\nProduk Data:\n";
    $produks = DB::table('tproduk')->get();
    foreach ($produks as $produk) {
        echo "  - ID: {$produk->id}, Nama: {$produk->nama_produk}, UMKM ID: {$produk->umkm_id}\n";
        echo "    Gambar: " . (empty($produk->gambar) ? "❌ Tidak ada" : "✓ Ada") . "\n";
    }
}
