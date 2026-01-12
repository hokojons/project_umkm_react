<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

echo "=== SIMULATE API CALL /api/umkm/rejection-comments ===\n\n";

// Simulate user ID 2 (adjust based on your test data)
$userId = 2;

echo "User ID: $userId\n\n";

// Get user's UMKM
$umkm = DB::table('tumkm')->where('user_id', $userId)->first();

if (!$umkm) {
    echo "No UMKM found for user $userId\n";
    exit;
}

echo "UMKM Found:\n";
echo "  - ID: {$umkm->id}\n";
echo "  - Nama: {$umkm->nama_toko}\n\n";

// Skip UMKM rejection comments (table structure doesn't match)

// Get product rejection comments
$productComments = DB::table('product_rejection_comments as prc')
    ->join('tproduk as p', function($join) use ($umkm) {
        $join->on('prc.kodeproduk', '=', DB::raw("CONCAT('P', p.id)"))
             ->where('p.umkm_id', '=', $umkm->id);
    })
    ->select(
        'prc.*',
        'p.nama_produk',
        'p.id as product_id'
    )
    ->orderBy('prc.created_at', 'desc')
    ->get();

echo "Product Rejection Comments: " . $productComments->count() . "\n";
if ($productComments->count() > 0) {
    echo "\nProduct Comments Details:\n";
    echo str_repeat('=', 80) . "\n";
    foreach($productComments as $comment) {
        echo "Produk: {$comment->nama_produk}\n";
        echo "Kode: {$comment->kodeproduk}\n";
        echo "Comment: {$comment->comment}\n";
        echo "Created: {$comment->created_at}\n";
        echo str_repeat('-', 80) . "\n";
    }
}
