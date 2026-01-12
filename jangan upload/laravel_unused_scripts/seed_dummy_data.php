<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "Creating dummy data...\n\n";

// Array of dummy customers
$customers = [
    ['Andi Wijaya', 'andi@customer.com', '081234567801'],
    ['Siti Nurhaliza', 'siti@customer.com', '081234567802'],
    ['Budi Santoso', 'budi@customer.com', '081234567803'],
    ['Dewi Lestari', 'dewi@customer.com', '081234567804'],
    ['Eko Prasetyo', 'eko@customer.com', '081234567805'],
];

// Array of dummy UMKM owners
$umkmOwners = [
    ['Ibu Sari', 'sari@umkm.com', '081234567901'],
    ['Pak Joko', 'joko@umkm.com', '081234567902'],
    ['Bu Ratna', 'ratna@umkm.com', '081234567903'],
    ['Mas Beni', 'beni@umkm.com', '081234567904'],
    ['Ibu Yani', 'yani@umkm.com', '081234567905'],
];

echo "=== Creating Customers ===\n";
foreach ($customers as $customer) {
    try {
        DB::table('users')->insert([
            'email' => $customer[1],
            'password' => Hash::make('password'),
            'nama_lengkap' => $customer[0],
            'no_telepon' => $customer[2],
            'role' => 'customer',
            'status' => 'active',
            'wa_verified' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "✓ Created: {$customer[0]} ({$customer[1]})\n";
    } catch (\Exception $e) {
        echo "⚠ Skipped: {$customer[1]} - already exists\n";
    }
}

echo "\n=== Creating UMKM Owners ===\n";
foreach ($umkmOwners as $owner) {
    try {
        DB::table('users')->insert([
            'email' => $owner[1],
            'password' => Hash::make('password'),
            'nama_lengkap' => $owner[0],
            'no_telepon' => $owner[2],
            'role' => 'umkm',
            'status' => 'active',
            'wa_verified' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "✓ Created: {$owner[0]} ({$owner[1]})\n";
    } catch (\Exception $e) {
        echo "⚠ Skipped: {$owner[1]} - already exists\n";
    }
}

echo "\n=== Creating Event Participants (tpengguna) ===\n";
// Event participants
$participants = [
    ['V001', 'Ahmad Visitor', '081111111111'],
    ['V002', 'Budi Pengunjung', '081111111112'],
    ['V003', 'Citra Tamu', '081111111113'],
    ['V004', 'Doni Event', '081111111114'],
    ['V005', 'Evi Guest', '081111111115'],
];

foreach ($participants as $p) {
    try {
        DB::table('tpengguna')->insert([
            'kodepengguna' => $p[0],
            'namapengguna' => $p[1],
            'teleponpengguna' => $p[2],
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "✓ Created participant: {$p[1]} ({$p[0]})\n";
    } catch (\Exception $e) {
        echo "⚠ Skipped: {$p[0]} - already exists\n";
    }
}

echo "\n";
echo "════════════════════════════════════════\n";
echo "    DUMMY DATA CREATED SUCCESSFULLY!    \n";
echo "════════════════════════════════════════\n";
echo "\n";
echo "📧 LOGIN CREDENTIALS (all passwords: password)\n";
echo "─────────────────────────────────────────\n";
echo "Customers:\n";
foreach ($customers as $c) {
    echo "  • {$c[1]}\n";
}
echo "\nUMKM Owners:\n";
foreach ($umkmOwners as $o) {
    echo "  • {$o[1]}\n";
}
echo "\n🎫 Event Participants:\n";
foreach ($participants as $p) {
    echo "  • {$p[1]} ({$p[0]})\n";
}
echo "\n";
