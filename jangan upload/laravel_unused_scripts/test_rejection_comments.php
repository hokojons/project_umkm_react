<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TEST REJECTION COMMENTS ===\n\n";

// Check product_rejection_comments table
echo "Product Rejection Comments:\n";
echo str_repeat('=', 80) . "\n";
$productComments = DB::table('product_rejection_comments')->get();
if ($productComments->count() > 0) {
    foreach($productComments as $comment) {
        echo "ID: {$comment->id}\n";
        echo "Kode Produk: {$comment->kodeproduk}\n";
        echo "Comment: {$comment->comment}\n";
        echo "Created: {$comment->created_at}\n";
        echo str_repeat('-', 80) . "\n";
    }
} else {
    echo "No product rejection comments found.\n";
}

echo "\n\nUMKM Rejection Comments:\n";
echo str_repeat('=', 80) . "\n";
$umkmComments = DB::table('umkm_rejection_comments')->get();
if ($umkmComments->count() > 0) {
    foreach($umkmComments as $comment) {
        echo "ID: {$comment->id}\n";
        echo "UMKM ID: {$comment->umkm_id}\n";
        echo "Comment: {$comment->comment}\n";
        echo "Created: {$comment->created_at}\n";
        echo str_repeat('-', 80) . "\n";
    }
} else {
    echo "No UMKM rejection comments found.\n";
}
