<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;
use App\Models\Admin;

echo "=== Creating Initial Data ===\n\n";

// 1. Create Categories
$categories = [
    ['id' => 'CAT001', 'nama' => 'Makanan & Minuman', 'status' => 'active'],
    ['id' => 'CAT002', 'nama' => 'Fashion & Pakaian', 'status' => 'active'],
    ['id' => 'CAT003', 'nama' => 'Kerajinan Tangan', 'status' => 'active'],
    ['id' => 'CAT004', 'nama' => 'Kecantikan & Perawatan', 'status' => 'active'],
    ['id' => 'CAT005', 'nama' => 'Elektronik', 'status' => 'active'],
];

echo "Creating categories...\n";
foreach ($categories as $cat) {
    $existing = Category::find($cat['id']);
    if (!$existing) {
        Category::create($cat);
        echo "✅ Created: {$cat['nama']}\n";
    } else {
        echo "⏭️  Skipped: {$cat['nama']} (already exists)\n";
    }
}

// 2. Ensure Admin exists
echo "\nChecking admin...\n";
$admin = Admin::find('ADM001');
if (!$admin) {
    Admin::create([
        'id' => 'ADM001',
        'nama' => 'Admin Pasar',
        'email' => 'admin@pasar.com',
        'password' => bcrypt('admin123'),
        'status' => 'active',
    ]);
    echo "✅ Admin created: admin@pasar.com / admin123\n";
} else {
    echo "✅ Admin exists: admin@pasar.com\n";
}

echo "\n========================================\n";
echo "✅ DATABASE READY!\n";
echo "========================================\n";
echo "Kategori yang tersedia:\n";
foreach ($categories as $cat) {
    echo "- {$cat['id']}: {$cat['nama']}\n";
}
echo "\nSekarang user bisa request jadi UMKM!\n";
