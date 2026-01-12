<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=== ALL TABLES IN DATABASE ===\n\n";

$tables = DB::select('SHOW TABLES');

foreach ($tables as $table) {
    $tableName = array_values((array) $table)[0];
    echo "Table: $tableName\n";
}

echo "\n=== CHECKING REQUIRED TABLES ===\n\n";

$requiredTables = ['users', 'tpengguna', 'tumkm', 'tproduk', 'tkategori', 'admin', 'tadmin'];

foreach ($requiredTables as $table) {
    $exists = DB::select("SHOW TABLES LIKE '$table'");
    echo $table . ": " . (count($exists) > 0 ? "✓ EXISTS" : "✗ MISSING") . "\n";
}

// Check events table (could be tacara or events)
echo "\n=== EVENT TABLE ===\n";
$eventTable = null;
if (DB::select("SHOW TABLES LIKE 'tacara'")) {
    $eventTable = 'tacara';
    echo "✓ tacara exists\n";
} elseif (DB::select("SHOW TABLES LIKE 'events'")) {
    $eventTable = 'events';
    echo "✓ events exists\n";
} else {
    echo "✗ No event table found\n";
}

// Check tproduk structure
echo "\n=== TPRODUK COLUMNS ===\n";
$columns = DB::select("SHOW COLUMNS FROM tproduk");
foreach ($columns as $col) {
    echo "  - " . $col->Field . " (" . $col->Type . ")\n";
}
