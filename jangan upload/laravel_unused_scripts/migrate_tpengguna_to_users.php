<?php

// Script to migrate data from tpengguna to users table

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "Starting migration from tpengguna to users...\n";

try {
    // Get all users from tpengguna
    $penggunas = DB::table('tpengguna')->get();
    
    $migrated = 0;
    $skipped = 0;
    
    foreach ($penggunas as $pengguna) {
        // Skip if no email
        if (empty($pengguna->emailpengguna)) {
            echo "Skipping {$pengguna->namapengguna} - no email\n";
            $skipped++;
            continue;
        }
        
        // Check if already exists
        $exists = DB::table('users')->where('email', $pengguna->emailpengguna)->exists();
        if ($exists) {
            echo "Skipping {$pengguna->emailpengguna} - already exists\n";
            $skipped++;
            continue;
        }
        
        // Check if has UMKM
        $hasUmkm = DB::table('tumkm')->where('kodepengguna', $pengguna->kodepengguna)->exists();
        
        // Insert into users
        DB::table('users')->insert([
            'email' => $pengguna->emailpengguna,
            'password' => $pengguna->passwordpengguna ?? Hash::make('password123'),
            'nama_lengkap' => $pengguna->namapengguna,
            'no_telepon' => $pengguna->teleponpengguna,
            'role' => $hasUmkm ? 'umkm' : 'customer',
            'status' => $pengguna->status === 'aktif' ? 'active' : 'inactive',
            'wa_verified' => isset($pengguna->wa_verified) ? (bool)$pengguna->wa_verified : false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        echo "Migrated: {$pengguna->namapengguna} ({$pengguna->emailpengguna})\n";
        $migrated++;
    }
    
    echo "\n=== Migration Complete ===\n";
    echo "Migrated: $migrated users\n";
    echo "Skipped: $skipped users\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
