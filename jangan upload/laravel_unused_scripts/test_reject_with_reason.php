<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING REJECT PRODUCT WITH 'reason' FIELD ===\n\n";

// Test with 'reason' field (from frontend)
$controller = new UmkmController();
$request = Request::create('/api/products/38/reject', 'POST', [
    'reason' => 'Produk tidak sesuai kategori yang diajukan'
]);
$request->headers->set('X-User-ID', '1');

echo "Testing rejection with 'reason' field:\n";
$response = $controller->rejectProduct($request, 38);

echo "Response Status: " . $response->status() . "\n";
echo "Response Content:\n";
echo $response->getContent() . "\n\n";

if ($response->status() === 200) {
    echo "✅ SUCCESS! Product rejected with 'reason' field\n";
    
    // Check product status
    $product = DB::table('tproduk')->find(38);
    echo "Product status: approval_status={$product->approval_status}, status={$product->status}\n";
    
    // Check comment saved
    $comment = DB::table('product_rejection_comments')->where('kodeproduk', 'P38')->latest()->first();
    if ($comment) {
        echo "Comment saved: {$comment->comment}\n";
    }
} else {
    echo "❌ FAILED!\n";
}
