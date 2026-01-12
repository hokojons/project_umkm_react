<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING EVENT POSITIONS IN DATABASE ===\n\n";

$events = DB::table('tacara')
    ->select('id_acara', 'nama_acara', 'gambar_acara', 'gambar_position_x', 'gambar_position_y')
    ->get();

foreach($events as $event) {
    echo "Event: {$event->nama_acara}\n";
    echo "  Image: {$event->gambar_acara}\n";
    echo "  Position X: " . ($event->gambar_position_x ?? 'NULL') . "\n";
    echo "  Position Y: " . ($event->gambar_position_y ?? 'NULL') . "\n";
    echo "\n";
}

echo "\n=== TESTING API RESPONSE ===\n\n";

// Test what API returns
$apiEvents = DB::table('tacara')
    ->select('id_acara', 'nama_acara', 'deskripsi_acara', 'tanggal_acara', 'gambar_acara', 'gambar_position_x', 'gambar_position_y')
    ->get();

echo "API would return:\n";
echo json_encode([
    'success' => true,
    'data' => $apiEvents->map(function($evt) {
        return [
            'id' => $evt->id_acara,
            'name' => $evt->nama_acara,
            'description' => $evt->deskripsi_acara,
            'date' => $evt->tanggal_acara,
            'image' => $evt->gambar_acara,
            'gambar_position_x' => $evt->gambar_position_x,
            'gambar_position_y' => $evt->gambar_position_y,
        ];
    })
], JSON_PRETTY_PRINT);
