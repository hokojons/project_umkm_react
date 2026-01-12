<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING DATABASE USERS ===\n\n";

$totalUsers = App\Models\User::count();
echo "Total users in database: $totalUsers\n\n";

$recentUsers = App\Models\User::orderBy('created_at', 'desc')->take(10)->get();

echo "Last 10 registered users:\n";
echo "----------------------------------------\n";

foreach ($recentUsers as $user) {
    echo "Email: " . ($user->email ?? 'N/A') . "\n";
    echo "Name: " . $user->nama . "\n";
    echo "Created: " . $user->created_at . "\n";
    echo "----------------------------------------\n";
}

// Check if there are any users created in the last hour
$recentRegistrations = App\Models\User::where('created_at', '>', now()->subHour())->get();
echo "\nUsers registered in last hour: " . $recentRegistrations->count() . "\n";

if ($recentRegistrations->count() > 0) {
    echo "\nRecent registrations:\n";
    foreach ($recentRegistrations as $user) {
        echo "  - " . $user->email . " at " . $user->created_at . "\n";
    }
}
?>