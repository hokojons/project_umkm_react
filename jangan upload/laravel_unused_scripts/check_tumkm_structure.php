<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TUMKM TABLE STRUCTURE ===\n\n";

$columns = DB::select('SHOW COLUMNS FROM tumkm');

foreach($columns as $col) {
    echo sprintf("%-20s %-20s %s\n", $col->Field, $col->Type, $col->Key ? "[$col->Key]" : "");
}
