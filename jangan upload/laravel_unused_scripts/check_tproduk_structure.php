<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$columns = DB::select('DESCRIBE tproduk');

echo "Struktur tabel tproduk:\n";
echo str_repeat('=', 50) . "\n";
foreach($columns as $col) {
    echo sprintf("%-20s | %-20s\n", $col->Field, $col->Type);
}
