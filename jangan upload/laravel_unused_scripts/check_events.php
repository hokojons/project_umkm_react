<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING tacara TABLE ===\n\n";

// Check if table exists
$tables = DB::select("SHOW TABLES LIKE 'tacara'");
if (empty($tables)) {
    echo "❌ Table 'tacara' does not exist!\n";
    exit;
}

echo "✓ Table 'tacara' exists\n\n";

// Check structure
echo "Table Structure:\n";
$columns = DB::select('SHOW COLUMNS FROM tacara');
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

echo "\n";

// Check data
$events = DB::table('tacara')->get();
echo "Total Events: " . count($events) . "\n\n";

if (count($events) > 0) {
    echo "Events:\n";
    foreach ($events as $event) {
        echo "  - ID: {$event->kodeacara}, Nama: {$event->namaacara}\n";
        echo "    Gambar: " . (empty($event->gambar) ? "❌ Tidak ada" : "✓ Ada") . "\n";
        echo "    Tanggal: {$event->tanggal}\n";
        echo "    Lokasi: {$event->lokasi}\n\n";
    }
}
