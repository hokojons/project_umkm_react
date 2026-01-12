<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING TABLES ===\n\n";

$tables = DB::select('SHOW TABLES');
foreach ($tables as $table) {
    $tableName = array_values((array)$table)[0];
    echo "- $tableName\n";
}

echo "\n=== CHECKING tproduk STRUCTURE ===\n\n";
$columns = DB::select('SHOW COLUMNS FROM tproduk');
foreach ($columns as $col) {
    echo "  {$col->Field} ({$col->Type})\n";
}
