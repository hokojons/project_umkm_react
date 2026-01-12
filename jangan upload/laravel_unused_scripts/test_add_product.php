<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING ADD PRODUCT API ===\n\n";

// Find user with approved UMKM
$umkm = DB::table('tumkm')->where('status', 'active')->first();

if (!$umkm) {
    echo "No active UMKM found. Creating one...\n";
    DB::table('tumkm')->where('id', 8)->update(['status' => 'active']);
    $umkm = DB::table('tumkm')->find(8);
}

echo "Testing with UMKM:\n";
echo "  - ID: {$umkm->id}\n";
echo "  - Nama: {$umkm->nama_toko}\n";
echo "  - User ID: {$umkm->user_id}\n";
echo "  - Status: {$umkm->status}\n\n";

// Create add product request
$controller = new UmkmController();
$request = Request::create('/api/umkm/add-product', 'POST', [
    'nama_produk' => 'Produk Baru Test',
    'harga' => 15000,
    'deskripsi' => 'Ini adalah produk test yang ditambahkan',
    'stok' => 10,
    'kategori' => 'food'
]);
$request->headers->set('X-User-ID', $umkm->user_id);

echo "Attempting to add product...\n";
$response = $controller->addProduct($request);

echo "Response Status: " . $response->status() . "\n";
echo "Response Content:\n";
$responseData = json_decode($response->getContent(), true);
echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n\n";

if ($response->status() === 201 && $responseData['success']) {
    echo "✅ SUCCESS! Product added successfully\n";
    echo "Product ID: " . $responseData['data']['id'] . "\n";
} else {
    echo "❌ FAILED!\n";
}
