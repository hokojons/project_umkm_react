<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ADDING gambar_scale COLUMN TO tacara ===\n\n";

try {
    // Check if column already exists
    $columns = DB::select('SHOW COLUMNS FROM tacara LIKE "gambar_scale"');
    
    if (count($columns) > 0) {
        echo "✓ Column gambar_scale already exists\n";
    } else {
        // Add the column
        DB::statement('ALTER TABLE tacara ADD COLUMN gambar_scale DECIMAL(3,2) DEFAULT 1.00 AFTER gambar_position_y');
        echo "✓ Column gambar_scale added successfully\n";
    }
    
    echo "\n=== UPDATED TABLE STRUCTURE ===\n\n";
    $allColumns = DB::select('SHOW COLUMNS FROM tacara');
    foreach($allColumns as $col) {
        echo $col->Field . ' (' . $col->Type . ")\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
