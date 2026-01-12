<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check user ID 8 (now umkm_owner)
$user = \DB::table('users')->where('id', 8)->first();

if ($user) {
    echo "User ID 8:\n";
    echo "Name: {$user->nama_lengkap}\n";
    echo "Email: {$user->email}\n";
    echo "Role: {$user->role}\n";
    
    // Check if has tpengguna entry
    $kodepengguna = 'U008';
    $tpengguna = \DB::table('tpengguna')->where('kodepengguna', $kodepengguna)->first();
    
    if ($tpengguna) {
        echo "\ntpengguna exists: {$tpengguna->kodepengguna}\n";
    } else {
        echo "\ntpengguna NOT FOUND for {$kodepengguna}\n";
    }
} else {
    echo "User 8 not found\n";
}
