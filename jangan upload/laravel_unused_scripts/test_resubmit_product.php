<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== TESTING RESUBMIT PRODUCT API ===\n\n";

// First, check rejected products
echo "1. CHECKING REJECTED PRODUCTS:\n";
$rejectedProducts = DB::table('tproduk')
    ->whereIn('status', ['rejected', 'inactive'])
    ->get();

if (count($rejectedProducts) > 0) {
    foreach ($rejectedProducts as $p) {
        echo "   - Product ID: {$p->id} | Nama: {$p->nama_produk} | Status: {$p->status} | UMKM ID: {$p->umkm_id}\n";
    }
    echo "\n";
    
    // Test resubmit for the first rejected product
    $testProduct = $rejectedProducts[0];
    echo "2. TESTING RESUBMIT FOR PRODUCT ID: {$testProduct->id}\n\n";
    
    // Get the user who owns this product
    $umkm = DB::table('tumkm')->where('id', $testProduct->umkm_id)->first();
    if ($umkm) {
        echo "   UMKM: {$umkm->nama_toko} (ID: {$umkm->id}, User ID: {$umkm->user_id})\n\n";
        
        // Simulate resubmit request
        $controller = new UmkmController();
        $request = Request::create('/api/products/' . $testProduct->id . '/resubmit', 'POST', [
            'nama_produk' => $testProduct->nama_produk . ' (Updated)',
            'deskripsi' => $testProduct->deskripsi . ' - Diperbaiki',
            'harga' => $testProduct->harga,
            'kategori' => $testProduct->kategori ?? 'product'
        ]);
        $request->headers->set('X-User-ID', $umkm->user_id);
        
        try {
            $response = $controller->resubmitProduct($request, $testProduct->id);
            echo "   API Response Status: " . $response->status() . "\n";
            echo "   API Response:\n";
            $responseData = json_decode($response->getContent(), true);
            echo "   " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n\n";
            
            // Check if product status changed to pending
            if ($response->status() === 200) {
                $updatedProduct = DB::table('tproduk')->find($testProduct->id);
                echo "   AFTER RESUBMIT:\n";
                echo "   - Product ID: {$updatedProduct->id}\n";
                echo "   - Nama: {$updatedProduct->nama_produk}\n";
                echo "   - Status: {$updatedProduct->status}\n";
                echo "   - Updated At: {$updatedProduct->updated_at}\n";
            }
        } catch (\Exception $e) {
            echo "   ERROR: " . $e->getMessage() . "\n";
        }
    } else {
        echo "   ERROR: UMKM not found for product\n";
    }
} else {
    echo "   No rejected products found in database\n";
}

echo "\n=== END ===\n";
