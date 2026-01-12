<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = DB::table('users')->where('id', 10)->first();
$tumkm = DB::table('tumkm')->where('kodepengguna', 'U010')->first();

echo "User 10 role: {$user->role}\n";
echo "tumkm status: {$tumkm->statuspengajuan}\n";

if ($user->role === 'umkm_owner' && $tumkm->statuspengajuan === 'approved') {
    echo "\n✅ FULL SUCCESS! Role upgraded and request approved.\n";
}
