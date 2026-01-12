<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Test Login API ===\n\n";

// Test 1: Login dengan username
echo "1. Test login: budi / budi123\n";
try {
    $user = DB::table('tpengguna')
        ->where('namapengguna', 'budi')
        ->first();
    
    if ($user) {
        echo "✓ User ditemukan: {$user->namapengguna}\n";
        $verified = password_verify('budi123', $user->katakunci);
        echo "✓ Password verify: " . ($verified ? 'MATCH' : 'NOT MATCH') . "\n";
    } else {
        echo "✗ User tidak ditemukan\n";
    }
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n2. Test login admin: admin / admin123\n";
try {
    $admin = DB::table('tadmin')
        ->where('namaadmin', 'admin')
        ->first();
    
    if ($admin) {
        echo "✓ Admin ditemukan: {$admin->namaadmin}\n";
        $verified = password_verify('admin123', $admin->katakunci);
        echo "✓ Password verify: " . ($verified ? 'MATCH' : 'NOT MATCH') . "\n";
    } else {
        echo "✗ Admin tidak ditemukan\n";
    }
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

// Test 3: Cek bagaimana frontend mengirim request
echo "\n3. Frontend mengirim:\n";
echo "   Email: admin@umkm.com\n";
echo "   Problem: Database tidak punya field 'email'\n";
echo "   Database field: namapengguna / namaadmin\n";
