<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CEK ACARA DI DATABASE ===\n\n";

$acara = DB::table('tacara')->get();

echo "Total acara: " . $acara->count() . "\n\n";

if ($acara->count() > 0) {
    echo "Detail acara:\n";
    echo str_repeat('=', 80) . "\n";
    foreach($acara as $event) {
        echo "ID: {$event->id}\n";
        echo "Nama: {$event->nama_acara}\n";
        echo "Tanggal: {$event->tanggal_acara}\n";
        echo "Lokasi: {$event->lokasi}\n";
        if (isset($event->status)) {
            echo "Status: {$event->status}\n";
        }
        echo str_repeat('-', 80) . "\n";
    }
} else {
    echo "Tidak ada data acara di database!\n";
}
