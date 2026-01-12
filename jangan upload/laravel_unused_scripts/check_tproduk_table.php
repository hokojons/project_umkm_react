<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Checking tproduk table structure...\n\n";
    
    // Check if table exists
    $tables = DB::select("SHOW TABLES LIKE 'tproduk'");
    if (empty($tables)) {
        echo "Table 'tproduk' does not exist!\n";
        
        // Show all tables
        echo "\nAvailable tables:\n";
        $allTables = DB::select('SHOW TABLES');
        foreach ($allTables as $table) {
            $tableName = array_values((array)$table)[0];
            echo "  - $tableName\n";
        }
    } else {
        $columns = DB::select('SHOW COLUMNS FROM tproduk');
        
        echo "Columns:\n";
        foreach ($columns as $column) {
            echo "  - {$column->Field} ({$column->Type})\n";
        }
        
        echo "\nTable exists with " . count($columns) . " columns\n";
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
