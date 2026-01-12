<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CLEAN USERS TABLE ===\n\n";

// Get current count
$currentCount = App\Models\User::count();
echo "Current users in database: $currentCount\n\n";

if ($currentCount === 0) {
    echo "✓ Table is already empty!\n";
    exit;
}

// Confirm action
echo "⚠️  WARNING: This will delete ALL users from the database!\n";
echo "Are you sure? Type 'YES' to confirm: ";

$handle = fopen("php://stdin", "r");
$confirmation = trim(fgets($handle));
fclose($handle);

if ($confirmation !== 'YES') {
    echo "\n❌ Operation cancelled.\n";
    exit;
}

echo "\n🗑️  Deleting all users...\n";

try {
    // Delete all users
    $deleted = App\Models\User::query()->delete();

    echo "✅ Successfully deleted $deleted users!\n";
    echo "✓ Users table is now empty.\n";

    // Verify
    $remaining = App\Models\User::count();
    echo "\nRemaining users: $remaining\n";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>