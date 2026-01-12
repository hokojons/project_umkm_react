<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Checking role_upgrade_requests table ===\n\n";

try {
    if (Schema::hasTable('role_upgrade_requests')) {
        echo "✓ Table 'role_upgrade_requests' exists\n\n";
        
        $columns = Schema::getColumnListing('role_upgrade_requests');
        echo "Columns:\n";
        foreach ($columns as $column) {
            echo "  - $column\n";
        }
        
        echo "\n=== Column Details ===\n";
        $columnDetails = DB::select("SHOW COLUMNS FROM role_upgrade_requests");
        foreach ($columnDetails as $col) {
            echo "Column: {$col->Field}\n";
            echo "  Type: {$col->Type}\n";
            echo "  Null: {$col->Null}\n";
            echo "  Key: {$col->Key}\n";
            echo "  Default: " . ($col->Default ?? 'NULL') . "\n\n";
        }
        
        $count = DB::table('role_upgrade_requests')->count();
        echo "\nTotal records: $count\n";
        
    } else {
        echo "✗ Table 'role_upgrade_requests' DOES NOT exist\n";
        echo "Available tables:\n";
        $tables = DB::select('SHOW TABLES');
        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];
            echo "  - $tableName\n";
        }
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
