<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "Creating new test user for role upgrade\n";
echo "========================================\n\n";

// Create user in users table
try {
    $userId = DB::table('users')->insertGetId([
        'nama_lengkap' => 'Test Role Upgrade',
        'no_telepon' => '628123456789',
        'email' => 'test.roleupgrade@test.com',
        'password' => Hash::make('password123'),
        'role' => 'customer',
        'status' => 'active',
        'wa_verified' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✓ Created user ID: {$userId}\n";
    echo "  Email: test.roleupgrade@test.com\n";
    echo "  Phone: 628123456789\n";
    echo "  Role: customer\n\n";
    
    $kodepengguna = 'U' . str_pad($userId, 3, '0', STR_PAD_LEFT);
    echo "Generated kodepengguna: {$kodepengguna}\n\n";
    
    echo "Now you can test role upgrade with user_id: {$userId}\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
