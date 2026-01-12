<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Business;

echo "=== Checking Businesses Table ===\n\n";

$businesses = Business::all();

if ($businesses->isEmpty()) {
    echo "❌ Table 'businesses' KOSONG - Belum ada request UMKM\n\n";
    echo "Cara lihat di XAMPP:\n";
    echo "1. Buka http://localhost/phpmyadmin\n";
    echo "2. Pilih database 'dbumkm' (atau database kamu)\n";
    echo "3. Klik table 'businesses'\n";
    echo "4. Lihat tab 'Browse'\n\n";
    echo "Table businesses ada kolom:\n";
    echo "- user_id (primary key)\n";
    echo "- nama_pemilik\n";
    echo "- nama_bisnis\n";
    echo "- alamat\n";
    echo "- category_id\n";
    echo "- status (pending/approved/rejected)\n";
} else {
    echo "✅ Ditemukan " . $businesses->count() . " business request\n\n";
    foreach ($businesses as $business) {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "User ID: {$business->user_id}\n";
        echo "Pemilik: {$business->nama_pemilik}\n";
        echo "Nama Bisnis: {$business->nama_bisnis}\n";
        echo "Alamat: {$business->alamat}\n";
        echo "Category: {$business->category_id}\n";
        echo "Status: {$business->status}\n";
        echo "Created: {$business->created_at}\n";
    }
}

echo "\n=== Checking Categories ===\n";
$categories = \App\Models\Category::all();
echo "Total categories: " . $categories->count() . "\n";
foreach ($categories as $cat) {
    echo "- {$cat->id}: {$cat->nama}\n";
}
