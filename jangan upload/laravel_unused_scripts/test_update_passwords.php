<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Updating Password for Existing Users ===\n\n";

$password = 'password123';

// Update USER001
$user1 = App\Models\User::find('USER001');
if ($user1) {
    $user1->password = Hash::make($password);
    $user1->save();
    echo "Updated USER001 (Budi Santoso)\n";
    echo "  Email: " . $user1->email . "\n";
    echo "  Password: " . $password . "\n\n";
}

// Update USER002
$user2 = App\Models\User::find('USER002');
if ($user2) {
    $user2->password = Hash::make($password);
    $user2->save();
    echo "Updated USER002 (Siti Nurhaliza)\n";
    echo "  Email: " . $user2->email . "\n";
    echo "  Password: " . $password . "\n\n";
}

// Update USER003
$user3 = App\Models\User::find('USER003');
if ($user3) {
    $user3->password = Hash::make($password);
    $user3->save();
    echo "Updated USER003 (Ahmad Wijaya)\n";
    echo "  Email: " . $user3->email . "\n";
    echo "  Password: " . $password . "\n\n";
}

echo "All passwords updated successfully!\n";
echo "You can now login with any of these accounts using password: " . $password . "\n";
?>