<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DEBUG REJECTION COMMENTS QUERY ===\n\n";

// Test with user 13 (who owns product 40)
$userId = 13;

echo "Testing for User ID: $userId\n\n";

// Get user's UMKM
$umkm = DB::table('tumkm')->where('user_id', $userId)->first();

if (!$umkm) {
    echo "No UMKM found for user $userId\n";
    exit;
}

echo "UMKM Found:\n";
echo "  - ID: {$umkm->id}\n";
echo "  - Nama: {$umkm->nama_toko}\n\n";

// Test the join query
echo "Testing JOIN query:\n";
echo str_repeat('=', 80) . "\n";

try {
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

    echo "Query Result: " . $productComments->count() . " comments found\n\n";

    if ($productComments->count() > 0) {
        foreach($productComments as $comment) {
            echo "Comment Details:\n";
            echo "  - ID: {$comment->id}\n";
            echo "  - Kode Produk: {$comment->kodeproduk}\n";
            echo "  - Product ID: {$comment->product_id}\n";
            echo "  - Nama Produk: {$comment->nama_produk}\n";
            echo "  - Comment: {$comment->comment}\n";
            echo "  - Created: {$comment->created_at}\n";
            echo str_repeat('-', 80) . "\n";
        }
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// Alternative: Direct check what's in the table
echo "\n\nDirect Table Check:\n";
echo str_repeat('=', 80) . "\n";

$allComments = DB::table('product_rejection_comments')->get();
echo "Total comments in table: " . $allComments->count() . "\n";

foreach($allComments as $c) {
    echo "\nComment ID {$c->id}:\n";
    echo "  - kodeproduk: {$c->kodeproduk}\n";
    echo "  - kodepengguna: {$c->kodepengguna}\n";
    echo "  - comment: {$c->comment}\n";
    
    // Try to find matching product
    $prodId = str_replace('P', '', $c->kodeproduk);
    $prod = DB::table('tproduk')->where('id', $prodId)->first();
    if ($prod) {
        echo "  - Matched Product: {$prod->nama_produk} (UMKM ID: {$prod->umkm_id})\n";
    }
}
