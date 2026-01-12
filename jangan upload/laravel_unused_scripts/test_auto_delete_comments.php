<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING AUTO-DELETE REJECTION COMMENTS ===\n\n";

// Check comments before resubmit
$commentsBefore = DB::table('product_rejection_comments')->where('kodeproduk', 'P40')->count();
echo "1. Rejection comments for P40 BEFORE resubmit: {$commentsBefore}\n\n";

// Ensure product is rejected
DB::table('tproduk')->where('id', 40)->update([
    'approval_status' => 'rejected',
    'status' => 'inactive'
]);

$product = DB::table('tproduk')->find(40);
$umkm = DB::table('tumkm')->find($product->umkm_id);

// Test resubmit
$controller = new UmkmController();
$request = Request::create('/api/products/40/resubmit', 'POST', [
    'nama_produk' => 'kim ji won (Diperbaiki)',
    'deskripsi' => 'Produk sudah diperbaiki sesuai saran',
    'harga' => 25000,
    'kategori' => 'food'
]);
$request->headers->set('X-User-ID', $umkm->user_id);

echo "2. Resubmitting product...\n";
$response = $controller->resubmitProduct($request, 40);
echo "   Status: " . $response->status() . "\n";
echo "   Response: " . $response->getContent() . "\n\n";

// Check comments after resubmit
$commentsAfter = DB::table('product_rejection_comments')->where('kodeproduk', 'P40')->count();
echo "3. Rejection comments for P40 AFTER resubmit: {$commentsAfter}\n\n";

if ($commentsAfter === 0 && $commentsBefore > 0) {
    echo "✅ SUCCESS! Rejection comments auto-deleted on resubmit!\n";
} else {
    echo "❌ FAILED: Comments not deleted properly\n";
}

// Verify product status
$updatedProduct = DB::table('tproduk')->find(40);
echo "\n4. Updated product status:\n";
echo "   - approval_status: {$updatedProduct->approval_status}\n";
echo "   - status: {$updatedProduct->status}\n";
