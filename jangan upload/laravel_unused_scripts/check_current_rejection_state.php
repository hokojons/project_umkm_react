<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING CURRENT REJECTION STATE ===\n\n";

// 1. Check User 13's UMKM
echo "1. USER 13 (R@gmail.com) UMKM:\n";
$umkm = DB::table('tumkm')->where('user_id', 13)->first();
if ($umkm) {
    echo "   - UMKM: " . print_r($umkm, true) . "\n\n";
} else {
    echo "   - NO UMKM FOUND!\n\n";
}

// 2. Check all products for this UMKM
echo "2. ALL PRODUCTS (including rejected):\n";
if ($umkm) {
    $products = DB::table('tproduk')
        ->where('umkm_id', $umkm->id)
        ->get();
    
    foreach ($products as $p) {
        echo "   - Product ID: {$p->id} | Nama: {$p->nama_produk} | Status: {$p->status}\n";
    }
    echo "   Total: " . count($products) . " products\n\n";
}

// 3. Check product rejection comments
echo "3. PRODUCT REJECTION COMMENTS:\n";
$rejections = DB::table('product_rejection_comments')->get();
echo "   Total in database: " . count($rejections) . "\n";
foreach ($rejections as $r) {
    echo "   - ID: {$r->id} | Kode Produk: {$r->kodeproduk} | Comment: {$r->comment} | User: {$r->kodepengguna}\n";
}
echo "\n";

// 4. Test API call simulation
echo "4. SIMULATING API CALL getRejectionComments():\n";
try {
    $user = DB::table('users')->find(13);
    if (!$user) {
        echo "   ERROR: User 13 not found!\n\n";
    } else {
        $umkm = DB::table('tumkm')->where('user_id', $user->id)->first();
        
        if (!$umkm) {
            echo "   Result: No UMKM found for this user\n\n";
        } else {
            echo "   - Found UMKM: {$umkm->nama_toko} (ID: {$umkm->id})\n";
            
            // Get product comments - check by umkm_id
            $productComments = DB::table('product_rejection_comments as prc')
                ->join('tproduk as p', function($join) {
                    $join->on(DB::raw('prc.kodeproduk'), '=', DB::raw("CONCAT('P', p.id)"));
                })
                ->where('p.umkm_id', $umkm->id)
                ->select('prc.*', 'p.nama_produk', 'p.id as product_id')
                ->get();
            
            echo "   - Product Comments Found: " . count($productComments) . "\n";
            foreach ($productComments as $pc) {
                echo "     * {$pc->nama_produk} ({$pc->kodeproduk}): {$pc->comment}\n";
            }
            
            $response = [
                'success' => true,
                'data' => [
                    'umkm_comments' => [],
                    'product_comments' => $productComments
                ]
            ];
            
            echo "\n   API Response:\n";
            echo "   " . json_encode($response, JSON_PRETTY_PRINT) . "\n";
        }
    }
} catch (\Exception $e) {
    echo "   ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== END ===\n";
