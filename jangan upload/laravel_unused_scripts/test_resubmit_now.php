<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING RESUBMIT WITH CURRENT PRODUCT 40 ===\n\n";

// Check current status
$product = DB::table('tproduk')->find(40);
echo "Product 40 Current State:\n";
echo "  - approval_status: " . ($product->approval_status ?? 'NULL') . "\n";
echo "  - status: " . ($product->status ?? 'NULL') . "\n\n";

// Get UMKM owner
$umkm = DB::table('tumkm')->find($product->umkm_id);
echo "Owner: User ID {$umkm->user_id}\n\n";

// Test resubmit
$controller = new UmkmController();
$request = Request::create('/api/products/40/resubmit', 'POST', [
    'nama_produk' => 'Test Product Resubmit',
    'deskripsi' => 'Test Description',
    'harga' => 50000,
    'kategori' => 'food'
]);
$request->headers->set('X-User-ID', $umkm->user_id);

echo "Attempting resubmit...\n";
$response = $controller->resubmitProduct($request, 40);

echo "Response Status: " . $response->status() . "\n";
echo "Response Content:\n";
echo $response->getContent() . "\n";
