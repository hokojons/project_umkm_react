<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Verifying U010 creation\n";
echo "=======================\n\n";

$tp = DB::table('tpengguna')->where('kodepengguna', 'U010')->first();
$tm = DB::table('tumkm')->where('kodepengguna', 'U010')->first();

echo "tpengguna U010: " . ($tp ? $tp->namapengguna : 'NOT FOUND') . "\n";
echo "tumkm U010: " . ($tm ? $tm->namatoko . ' (' . $tm->statuspengajuan . ')' : 'NOT FOUND') . "\n";

if ($tp && $tm) {
    echo "\n✅ SUCCESS! Both entries created correctly.\n";
} else {
    echo "\n❌ FAILED! Missing entries.\n";
}
