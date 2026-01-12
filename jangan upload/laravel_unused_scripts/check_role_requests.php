<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$requests = \DB::table('role_upgrade_requests')->get();

echo "Total role upgrade requests: " . $requests->count() . "\n\n";

if ($requests->count() > 0) {
    foreach ($requests as $request) {
        echo "ID: {$request->id}\n";
        echo "User ID: {$request->user_id}\n";
        echo "Status: {$request->status}\n";
        echo "Submitted: {$request->submitted_at}\n";
        echo "---\n";
    }
} else {
    echo "No requests found.\n";
}
