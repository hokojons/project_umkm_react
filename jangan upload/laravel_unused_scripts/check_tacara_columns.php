<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TACARA TABLE STRUCTURE ===\n\n";

$columns = DB::select('SHOW COLUMNS FROM tacara');

foreach($columns as $col) {
    echo $col->Field . ' (' . $col->Type . ")\n";
}
