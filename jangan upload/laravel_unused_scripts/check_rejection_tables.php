<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "Checking rejection tables:\n";
echo str_repeat('=', 50) . "\n";

$tables = ['product_rejection_comments', 'product_rejection_reasons'];

foreach ($tables as $table) {
    $exists = Schema::hasTable($table);
    echo sprintf("%-40s: %s\n", $table, $exists ? '✓ EXISTS' : '✗ NOT FOUND');
    
    if ($exists) {
        $columns = DB::select("DESCRIBE $table");
        foreach($columns as $col) {
            echo sprintf("  - %-20s | %-20s\n", $col->Field, $col->Type);
        }
    }
    echo "\n";
}
