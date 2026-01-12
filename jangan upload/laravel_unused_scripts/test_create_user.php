<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Creating Test User ===\n\n";

// Create or update test user
$email = 'test@example.com';
$password = 'password123';

$user = App\Models\User::where('email', $email)->first();

if ($user) {
    echo "User already exists, updating password...\n";
    $user->password = Hash::make($password);
    $user->save();
} else {
    echo "Creating new user...\n";
    $user = App\Models\User::create([
        'id' => 'TEST_' . time(),
        'nama' => 'Test User',
        'email' => $email,
        'telepon' => '08999999999',
        'password' => Hash::make($password),
    ]);
}

echo "User created/updated successfully!\n\n";
echo "Login credentials:\n";
echo "Email: " . $email . "\n";
echo "Password: " . $password . "\n";
?>