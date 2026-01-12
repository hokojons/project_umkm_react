<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $columns = \DB::select("SHOW COLUMNS FROM role_upgrade_requests");
    
    echo "Columns in role_upgrade_requests table:\n\n";
    foreach ($columns as $column) {
        echo "Field: {$column->Field}\n";
        echo "Type: {$column->Type}\n";
        echo "Null: {$column->Null}\n";
        echo "Key: {$column->Key}\n";
        echo "Default: {$column->Default}\n";
        echo "Extra: {$column->Extra}\n";
        echo "---\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
