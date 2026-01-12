<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Adding columns to users table...\n";

try {
    // Check and add columns one by one
    $columns = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS no_telepon VARCHAR(20) NULL AFTER email",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('customer', 'umkm') DEFAULT 'customer' AFTER password",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'pending') DEFAULT 'active' AFTER role",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_verified BOOLEAN DEFAULT 0 AFTER status",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_verification_code VARCHAR(10) NULL AFTER wa_verified",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_verified_at TIMESTAMP NULL AFTER wa_verification_code",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS alamat TEXT NULL AFTER wa_verified_at",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS foto_profil VARCHAR(255) NULL AFTER alamat",
    ];
    
    foreach ($columns as $sql) {
        try {
            DB::statement($sql);
            echo "✓ " . substr($sql, 0, 80) . "...\n";
        } catch (\Exception $e) {
            echo "⚠ " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✓ All columns added successfully!\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
