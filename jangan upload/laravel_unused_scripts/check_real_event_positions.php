<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== EVENT POSITIONS IN DATABASE ===\n\n";

$events = DB::table('tacara')
    ->select('kodeacara', 'namaacara', 'gambar', 'gambar_position_x', 'gambar_position_y')
    ->get();

foreach($events as $event) {
    echo "Event: {$event->namaacara} ({$event->kodeacara})\n";
    echo "  Image: {$event->gambar}\n";
    echo "  Position X: " . ($event->gambar_position_x ?? 'NULL') . "\n";
    echo "  Position Y: " . ($event->gambar_position_y ?? 'NULL') . "\n";
    echo "\n";
}
