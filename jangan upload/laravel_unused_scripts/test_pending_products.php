<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING GET PENDING PRODUCTS ===\n\n";

// Check pending products in database
echo "1. Pending products in database:\n";
$pendingProducts = DB::table('tproduk')
    ->where('approval_status', 'pending')
    ->get();

foreach ($pendingProducts as $p) {
    echo "   - ID: {$p->id} | Nama: {$p->nama_produk} | UMKM ID: {$p->umkm_id} | Status: {$p->approval_status}\n";
}
echo "   Total: " . count($pendingProducts) . " products\n\n";

// Test API
echo "2. Testing API endpoint:\n";
$controller = new UmkmController();
$request = Request::create('/api/products/pending', 'GET');

$response = $controller->getPendingProducts($request);

echo "   Response Status: " . $response->status() . "\n";
$responseData = json_decode($response->getContent(), true);

if ($responseData['success']) {
    echo "   Products from API: " . count($responseData['data']) . "\n\n";
    
    foreach ($responseData['data'] as $product) {
        echo "   - {$product['nama_produk']} (ID: {$product['id']})\n";
        echo "     Toko: {$product['nama_toko']}\n";
        echo "     Status: {$product['approval_status']}\n\n";
    }
} else {
    echo "   ERROR: " . $responseData['message'] . "\n";
}
