<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "\n=== ADDING deleted_at COLUMN TO users TABLE ===\n\n";
    
    DB::statement("ALTER TABLE `users` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `updated_at`");
    
    echo "✓ Column deleted_at added successfully\n\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
