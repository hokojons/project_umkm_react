<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Create test users for LoginModal
$testUsers = [
    [
        'id' => 'USER_' . time() . '_1',
        'name' => 'Test User',
        'email' => 'testuser@pasarumkm.com',
        'password' => Hash::make('test123'),
        'role' => 'user',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'id' => 'UMKM_' . time() . '_2',
        'name' => 'Test UMKM',
        'email' => 'testumkm@pasarumkm.com',
        'password' => Hash::make('test123'),
        'role' => 'umkm',
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'id' => 'ADMIN_' . time() . '_3',
        'name' => 'Test Admin',
        'email' => 'testadmin@pasarumkm.com',
        'password' => Hash::make('test123'),
        'role' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
    ],
];

foreach ($testUsers as $user) {
    // Check if user exists
    $existing = DB::table('users')->where('email', $user['email'])->first();

    if ($existing) {
        // Update password
        DB::table('users')
            ->where('email', $user['email'])
            ->update([
                'password' => $user['password'],
                'updated_at' => now(),
            ]);
        echo "✅ Updated: {$user['email']}\n";
    } else {
        // Insert new user
        DB::table('users')->insert($user);
        echo "✅ Created: {$user['email']}\n";
    }
}

echo "\n🎉 Test users ready! All passwords: test123\n";
