<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Checking Users in Database ===\n\n";

$users = App\Models\User::take(5)->get(['id', 'nama', 'email', 'telepon', 'password']);

echo "Total users: " . App\Models\User::count() . "\n\n";

foreach ($users as $user) {
    echo "ID: " . $user->id . "\n";
    echo "Nama: " . $user->nama . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Telepon: " . $user->telepon . "\n";
    echo "Password hash exists: " . (!empty($user->password) ? "Yes" : "No") . "\n";
    echo "---\n";
}
?>