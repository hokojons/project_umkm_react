<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Testing Role Upgrade Request for User ID 9\n";
echo "==========================================\n\n";

// Check current state
echo "1. Checking if U009 exists in tpengguna:\n";
$tpengguna009 = DB::table('tpengguna')->where('kodepengguna', 'U009')->first();
if ($tpengguna009) {
    echo "   ✓ U009 EXISTS: {$tpengguna009->namapengguna}\n";
} else {
    echo "   ✗ U009 DOES NOT EXIST\n";
}

echo "\n2. Checking if U009 exists in tumkm:\n";
$tumkm009 = DB::table('tumkm')->where('kodepengguna', 'U009')->first();
if ($tumkm009) {
    echo "   ✓ U009 EXISTS in tumkm: {$tumkm009->namatoko}\n";
} else {
    echo "   ✗ U009 DOES NOT EXIST in tumkm\n";
}

echo "\n3. Getting user ID 9 from users table:\n";
$user = DB::table('users')->where('id', 9)->first();
if ($user) {
    echo "   ✓ User ID 9: {$user->nama_lengkap} ({$user->email})\n";
    echo "     Phone: {$user->no_telepon}\n";
    echo "     Role: {$user->role}\n";
} else {
    echo "   ✗ User ID 9 does not exist\n";
    exit(1);
}

echo "\n4. Simulating controller logic:\n";
$kodepengguna = 'U' . str_pad(9, 3, '0', STR_PAD_LEFT);
echo "   Generated kodepengguna: {$kodepengguna}\n";

// Check if tpengguna exists
$tpenggunaExists = DB::table('tpengguna')->where('kodepengguna', $kodepengguna)->exists();
echo "   tpengguna exists: " . ($tpenggunaExists ? 'YES' : 'NO') . "\n";

if (!$tpenggunaExists) {
    echo "\n5. Creating entry in tpengguna:\n";
    try {
        DB::table('tpengguna')->insert([
            'kodepengguna' => $kodepengguna,
            'namapengguna' => $user->nama_lengkap ?? 'user2',
            'teleponpengguna' => $user->no_telepon ?? '',
            'katakunci' => $user->password,
            'status' => 'aktif',
        ]);
        echo "   ✓ Successfully created U009 in tpengguna\n";
    } catch (\Exception $e) {
        echo "   ✗ Error creating tpengguna: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo "\n6. Creating entry in tumkm:\n";
try {
    // Check if already exists
    $existing = DB::table('tumkm')->where('kodepengguna', $kodepengguna)->first();
    if ($existing) {
        echo "   ! Entry already exists, updating...\n";
        DB::table('tumkm')
            ->where('kodepengguna', $kodepengguna)
            ->update([
                'namapemilik' => 'user2',
                'namatoko' => 'Toko user2',
                'alamattoko' => 'Alamat akan dilengkapi',
                'kodekategori' => '1',
                'statuspengajuan' => 'pending',
            ]);
        echo "   ✓ Successfully updated tumkm entry\n";
    } else {
        DB::table('tumkm')->insert([
            'kodepengguna' => $kodepengguna,
            'namapemilik' => 'user2',
            'namatoko' => 'Toko user2',
            'alamattoko' => 'Alamat akan dilengkapi',
            'kodekategori' => '1',
            'statuspengajuan' => 'pending',
        ]);
        echo "   ✓ Successfully created U009 in tumkm\n";
    }
} catch (\Exception $e) {
    echo "   ✗ Error creating tumkm: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n7. Verifying final state:\n";
$finalTpengguna = DB::table('tpengguna')->where('kodepengguna', 'U009')->first();
$finalTumkm = DB::table('tumkm')->where('kodepengguna', 'U009')->first();

if ($finalTpengguna) {
    echo "   ✓ tpengguna: {$finalTpengguna->namapengguna}\n";
} else {
    echo "   ✗ tpengguna not found\n";
}

if ($finalTumkm) {
    echo "   ✓ tumkm: {$finalTumkm->namatoko} (Status: {$finalTumkm->statuspengajuan})\n";
} else {
    echo "   ✗ tumkm not found\n";
}

echo "\n✅ Test completed successfully!\n";
