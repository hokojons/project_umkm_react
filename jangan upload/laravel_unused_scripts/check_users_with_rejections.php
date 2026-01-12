<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECK ALL USERS AND THEIR UMKM ===\n\n";

$users = DB::table('users')
    ->leftJoin('tumkm', 'users.id', '=', 'tumkm.user_id')
    ->select(
        'users.id as user_id',
        'users.email',
        'users.nama_lengkap',
        'tumkm.id as umkm_id',
        'tumkm.nama_toko',
        'tumkm.status'
    )
    ->whereNotNull('tumkm.id')
    ->get();

echo "Users with UMKM:\n";
echo str_repeat('=', 100) . "\n";

foreach($users as $user) {
    echo sprintf("User ID: %-3s | Email: %-25s | UMKM: %-20s | Status: %s\n", 
        $user->user_id, 
        $user->email, 
        $user->nama_toko,
        $user->status
    );
    
    // Check if this user has rejected products
    $rejectedProducts = DB::table('product_rejection_comments as prc')
        ->join('tproduk as p', function($join) use ($user) {
            $join->on('prc.kodeproduk', '=', DB::raw("CONCAT('P', p.id)"))
                 ->where('p.umkm_id', '=', $user->umkm_id);
        })
        ->count();
    
    if ($rejectedProducts > 0) {
        echo "  >>> HAS $rejectedProducts REJECTED PRODUCT(S)\n";
    }
}

echo "\n\n=== PRODUCT REJECTION COMMENTS DETAIL ===\n";
echo str_repeat('=', 100) . "\n";

$allComments = DB::table('product_rejection_comments as prc')
    ->join('tproduk as p', 'prc.kodeproduk', '=', DB::raw("CONCAT('P', p.id)"))
    ->join('tumkm as u', 'p.umkm_id', '=', 'u.id')
    ->join('users as usr', 'u.user_id', '=', 'usr.id')
    ->select(
        'prc.*',
        'p.nama_produk',
        'p.umkm_id',
        'u.nama_toko',
        'u.user_id',
        'usr.email'
    )
    ->get();

foreach($allComments as $comment) {
    echo "Comment ID: {$comment->id}\n";
    echo "  Product: {$comment->nama_produk} ({$comment->kodeproduk})\n";
    echo "  UMKM: {$comment->nama_toko} (ID: {$comment->umkm_id})\n";
    echo "  Owner: User ID {$comment->user_id} ({$comment->email})\n";
    echo "  Comment: {$comment->comment}\n";
    echo "  Created: {$comment->created_at}\n";
    echo str_repeat('-', 100) . "\n";
}
