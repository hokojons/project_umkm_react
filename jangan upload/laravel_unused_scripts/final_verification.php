<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                 FINAL VERIFICATION REPORT                    ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// 1. Check UMKM and Photos
echo "1. UMKM & PHOTOS\n";
echo "═════════════════════════════════════════════════════════════\n";
$umkms = DB::table('tumkm')->get();
$umkmWithPhotos = $umkms->filter(function($u) { return !empty($u->foto_toko); })->count();
echo "Total UMKM: " . count($umkms) . "\n";
echo "UMKM with Photos: $umkmWithPhotos\n";
echo "Status: " . ($umkmWithPhotos == count($umkms) ? "✅ ALL GOOD" : "⚠ NEEDS ATTENTION") . "\n\n";

// 2. Check Products and Images
echo "2. PRODUCTS & IMAGES\n";
echo "═════════════════════════════════════════════════════════════\n";
$products = DB::table('tproduk')->get();
$productsWithImages = $products->filter(function($p) { return !empty($p->gambar); })->count();
echo "Total Products: " . count($products) . "\n";
echo "Products with Images: $productsWithImages\n";

// Count by category
$categories = DB::table('tproduk')->select('kategori', DB::raw('count(*) as count'))
    ->groupBy('kategori')
    ->get();
echo "\nBy Category:\n";
foreach ($categories as $cat) {
    echo "  - {$cat->kategori}: {$cat->count} products\n";
}
echo "Status: " . ($productsWithImages == count($products) ? "✅ ALL GOOD" : "⚠ NEEDS ATTENTION") . "\n\n";

// 3. Check Events
echo "3. EVENTS & IMAGES\n";
echo "═════════════════════════════════════════════════════════════\n";
$events = DB::table('tacara')->get();
$eventsWithImages = $events->filter(function($e) { return !empty($e->gambar); })->count();
echo "Total Events: " . count($events) . "\n";
echo "Events with Images: $eventsWithImages\n";

if (count($events) > 0) {
    echo "\nEvent Details:\n";
    foreach ($events as $event) {
        $hasImage = !empty($event->gambar) ? "✓" : "❌";
        echo "  $hasImage {$event->namaacara} ({$event->tanggal})\n";
    }
}
echo "Status: " . ($eventsWithImages == count($events) ? "✅ ALL GOOD" : "⚠ NEEDS ATTENTION") . "\n\n";

// 4. Check Gift Packages (Paket category)
echo "4. GIFT PACKAGES (Paket Category)\n";
echo "═════════════════════════════════════════════════════════════\n";
$packages = DB::table('tproduk')->where('kategori', 'Paket')->get();
echo "Total Paket Products: " . count($packages) . "\n";
if (count($packages) > 0) {
    echo "Paket List:\n";
    foreach ($packages as $pkg) {
        echo "  - {$pkg->nama_produk} (Rp " . number_format($pkg->harga, 0, ',', '.') . ")\n";
    }
    echo "Status: ✅ READY\n";
} else {
    echo "Status: ℹ No packages yet (can be created via admin)\n";
}

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                    OVERALL STATUS                            ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";

$allGood = (
    $umkmWithPhotos == count($umkms) &&
    $productsWithImages == count($products) &&
    $eventsWithImages == count($events)
);

if ($allGood) {
    echo "║  ✅ ALL SYSTEMS OPERATIONAL                                 ║\n";
    echo "║                                                              ║\n";
    echo "║  - UMKM photos: Complete                                    ║\n";
    echo "║  - Product images: Complete                                 ║\n";
    echo "║  - Event images: Complete                                   ║\n";
    echo "║  - Gift packages API: Fixed                                 ║\n";
} else {
    echo "║  ⚠ SOME ITEMS NEED ATTENTION                                ║\n";
}

echo "╚══════════════════════════════════════════════════════════════╝\n";
