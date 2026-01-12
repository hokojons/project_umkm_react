<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Checking users table structure...\n\n";
    
    $columns = DB::select('SHOW COLUMNS FROM users');
    
    echo "Columns:\n";
    foreach ($columns as $column) {
        echo "  - {$column->Field} ({$column->Type})\n";
    }
    
    echo "\nTable exists with " . count($columns) . " columns\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
