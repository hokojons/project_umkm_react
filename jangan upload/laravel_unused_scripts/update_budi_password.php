<?php

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Update password untuk Budi Santoso
DB::table('users')
    ->where('email', 'budi@umkm.com')
    ->update([
        'password' => Hash::make('password')
    ]);

echo "Password untuk budi@umkm.com berhasil diupdate ke 'password'\n";

// Verify
$user = DB::table('users')->where('email', 'budi@umkm.com')->first();
echo "User: {$user->nama_lengkap} ({$user->email})\n";
echo "Role: {$user->role}\n";
echo "Password hash: " . substr($user->password, 0, 30) . "...\n";
