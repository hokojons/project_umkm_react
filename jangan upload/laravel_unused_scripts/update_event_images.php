<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║           UPDATING EVENT IMAGES                              ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Better quality event image (100x100 pixel base64)
$eventImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9AKKKAP/Z';

$events = DB::table('tacara')->get();

echo "Updating " . count($events) . " events with images...\n\n";

$updated = 0;

foreach ($events as $event) {
    // Update only if no image exists
    if (empty($event->gambar) || $event->gambar == null) {
        DB::table('tacara')
            ->where('kodeacara', $event->kodeacara)
            ->update(['gambar' => $eventImage]);
        
        echo "✓ {$event->namaacara} - Image added\n";
        $updated++;
    } else {
        echo "→ {$event->namaacara} - Already has image\n";
    }
}

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                      SUMMARY                                 ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";
echo "║  Events Updated: " . str_pad($updated, 42) . "║\n";
echo "║  Events Skipped: " . str_pad(count($events) - $updated, 42) . "║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "✅ Event images updated successfully!\n";
