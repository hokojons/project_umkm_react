<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "Creating test users...\n";

// Create test customer
DB::table('users')->insert([
    'email' => 'budi@umkm.com',
    'password' => Hash::make('password'),
    'nama_lengkap' => 'Budi Santoso',
    'no_telepon' => '081234567890',
    'role' => 'customer',
    'status' => 'active',
    'wa_verified' => true,
    'created_at' => now(),
    'updated_at' => now(),
]);
echo "Created customer: budi@umkm.com / password\n";

// Create test UMKM owner
DB::table('users')->insert([
    'email' => 'umkm@owner.com',
    'password' => Hash::make('password'),
    'nama_lengkap' => 'Siti Rahayu',
    'no_telepon' => '081234567891',
    'role' => 'umkm',
    'status' => 'active',
    'wa_verified' => true,
    'created_at' => now(),
    'updated_at' => now(),
]);
echo "Created UMKM owner: umkm@owner.com / password\n";

echo "\n=== Test users created successfully ===\n";
echo "Customer: budi@umkm.com / password\n";
echo "UMKM Owner: umkm@owner.com / password\n";
