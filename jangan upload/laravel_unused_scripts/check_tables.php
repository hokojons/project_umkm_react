<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Semua Tabel di Database ===\n";
$tables = DB::select('SHOW TABLES');
foreach ($tables as $table) {
    $tableName = array_values((array)$table)[0];
    echo "- $tableName\n";
}

echo "\n=== Data di tpengguna ===\n";
$users = DB::table('tpengguna')->get();
echo "Jumlah user: " . $users->count() . "\n";
if ($users->count() > 0) {
    foreach ($users as $user) {
        echo "- {$user->kodepengguna}: {$user->namapengguna} ({$user->teleponpengguna})\n";
    }
}

echo "\n=== Data di tumkm ===\n";
$umkm = DB::table('tumkm')->get();
echo "Jumlah UMKM: " . $umkm->count() . "\n";
if ($umkm->count() > 0) {
    foreach ($umkm as $u) {
        echo "- {$u->kodepengguna}: {$u->namatoko}\n";
    }
}

echo "\n=== Data di tproduk ===\n";
$produk = DB::table('tproduk')->get();
echo "Jumlah produk: " . $produk->count() . "\n";
