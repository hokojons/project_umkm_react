<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== CHECKING TUMKM STRUCTURE ===\n\n";
$cols = DB::select('SHOW COLUMNS FROM tumkm');
foreach($cols as $c) {
    echo "{$c->Field} ({$c->Type})\n";
}

echo "\n=== CHECKING IF TACARA EXISTS ===\n";
$tables = DB::select("SHOW TABLES LIKE 'tacara'");
echo "tacara exists: " . (count($tables) > 0 ? "YES" : "NO") . "\n";

if (count($tables) > 0) {
    echo "\n=== TACARA STRUCTURE ===\n";
    $cols = DB::select('SHOW COLUMNS FROM tacara');
    foreach($cols as $c) {
        echo "{$c->Field} ({$c->Type})\n";
    }
}
