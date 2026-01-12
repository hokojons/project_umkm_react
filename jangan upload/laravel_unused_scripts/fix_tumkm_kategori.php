<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== FIXING TUMKM KATEGORI_ID ===\n\n";

try {
    // Drop foreign key constraint
    DB::statement("ALTER TABLE tumkm DROP FOREIGN KEY tumkm_kategori_id_foreign");
    echo "✓ Dropped foreign key constraint\n";
    
    // Make kategori_id nullable
    DB::statement("ALTER TABLE tumkm MODIFY kategori_id BIGINT UNSIGNED NULL");
    echo "✓ Made kategori_id nullable\n";
    
    echo "\n=== SUCCESS ===\n\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
