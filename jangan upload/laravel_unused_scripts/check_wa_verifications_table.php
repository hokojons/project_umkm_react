<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Checking wa_verifications table ===\n\n";

try {
    // Check if table exists
    if (Schema::hasTable('wa_verifications')) {
        echo "✓ Table 'wa_verifications' exists\n\n";
        
        // Get columns
        $columns = Schema::getColumnListing('wa_verifications');
        echo "Columns:\n";
        foreach ($columns as $column) {
            echo "  - $column\n";
        }
        
        echo "\n=== Column Details ===\n";
        $columnDetails = DB::select("SHOW COLUMNS FROM wa_verifications");
        foreach ($columnDetails as $col) {
            echo "Column: {$col->Field}\n";
            echo "  Type: {$col->Type}\n";
            echo "  Null: {$col->Null}\n";
            echo "  Key: {$col->Key}\n";
            echo "  Default: " . ($col->Default ?? 'NULL') . "\n\n";
        }
        
        // Count records
        $count = DB::table('wa_verifications')->count();
        echo "\nTotal records: $count\n";
        
        if ($count > 0) {
            echo "\nRecent records:\n";
            $recent = DB::table('wa_verifications')->orderBy('id', 'desc')->limit(5)->get();
            foreach ($recent as $record) {
                echo "ID: {$record->id}\n";
                print_r($record);
                echo "\n";
            }
        }
        
    } else {
        echo "✗ Table 'wa_verifications' DOES NOT exist\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
