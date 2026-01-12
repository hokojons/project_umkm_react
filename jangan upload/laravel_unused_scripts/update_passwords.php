<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Hash;

// Update admin password
$hashedPassword = Hash::make('password');
echo "Hashed password: " . $hashedPassword . "\n\n";

// Update admin user
DB::table('users')
    ->where('email', 'admin@umkm.com')
    ->update(['password' => $hashedPassword]);

echo "✓ Admin password updated successfully!\n";
echo "  Email: admin@umkm.com\n";
echo "  Password: password\n\n";

// Also create a test customer
$customerPassword = Hash::make('password123');
DB::table('users')->updateOrInsert(
    ['no_telepon' => '081234567899'],
    [
        'nama_lengkap' => 'Test Customer',
        'email' => 'customer@test.com',
        'password' => $customerPassword,
        'role' => 'customer',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]
);

echo "✓ Test customer created!\n";
echo "  Email: customer@test.com\n";
echo "  Phone: 081234567899\n";
echo "  Password: password123\n";
