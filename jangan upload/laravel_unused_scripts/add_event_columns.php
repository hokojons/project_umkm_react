<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "Checking tacara table structure...\n";
    
    // Check if columns exist
    $hasLokasi = Schema::hasColumn('tacara', 'lokasi');
    $hasGambar = Schema::hasColumn('tacara', 'gambar');
    
    if (!$hasLokasi) {
        echo "Adding 'lokasi' column...\n";
        DB::statement("ALTER TABLE tacara ADD COLUMN lokasi VARCHAR(200) NULL AFTER tanggaldaftar");
        echo "✓ Column 'lokasi' added\n";
    } else {
        echo "✓ Column 'lokasi' already exists\n";
    }
    
    if (!$hasGambar) {
        echo "Adding 'gambar' column...\n";
        DB::statement("ALTER TABLE tacara ADD COLUMN gambar VARCHAR(500) NULL AFTER lokasi");
        echo "✓ Column 'gambar' added\n";
    } else {
        echo "✓ Column 'gambar' already exists\n";
    }
    
    // Update existing events with location if needed
    echo "\nUpdating existing events with locations...\n";
    
    DB::table('tacara')->where('kodeacara', 'E001')->update([
        'lokasi' => 'Plaza Senayan, Jakarta'
    ]);
    
    DB::table('tacara')->where('kodeacara', 'E002')->update([
        'lokasi' => 'Taman Mini Indonesia Indah, Jakarta'
    ]);
    
    DB::table('tacara')->where('kodeacara', 'E003')->update([
        'lokasi' => 'Jakarta Convention Center (JCC), Senayan'
    ]);
    
    DB::table('tacara')->where('kodeacara', 'E004')->update([
        'lokasi' => 'Grand Indonesia, Jakarta'
    ]);
    
    echo "✓ Locations updated for existing events\n";
    
    echo "\n✅ All done! Table structure updated successfully.\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
