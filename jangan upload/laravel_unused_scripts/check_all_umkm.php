<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Checking all UMKM submissions...\n\n";
    
    $umkm = DB::table('tumkm')->get();
    
    foreach ($umkm as $u) {
        echo "Kode: {$u->kodepengguna}\n";
        echo "Nama Toko: {$u->namatoko}\n";
        echo "Status: {$u->statuspengajuan}\n";
        echo "Foto: " . ($u->fototoko ?? 'null') . "\n";
        echo "---\n";
    }
    
    echo "\nTotal UMKM: " . count($umkm) . "\n";
    echo "Active UMKM: " . DB::table('tumkm')->where('statuspengajuan', 'active')->count() . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
