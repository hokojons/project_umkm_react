<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========== TEST ADMIN LOGIN ==========\n\n";

// Test login dengan credentials yang benar
$response = Http::post('http://127.0.0.1:8000/api/auth/admin/login', [
    'email' => 'admin@pasar.com',
    'password' => 'admin123'
]);

echo "Status: " . $response->status() . "\n";
echo "Response:\n";
echo json_encode($response->json(), JSON_PRETTY_PRINT);
echo "\n\n";

// Test login dengan password salah
echo "========== TEST ADMIN LOGIN (Wrong Password) ==========\n\n";
$response2 = Http::post('http://127.0.0.1:8000/api/auth/admin/login', [
    'email' => 'admin@pasar.com',
    'password' => 'wrongpassword'
]);

echo "Status: " . $response2->status() . "\n";
echo "Response:\n";
echo json_encode($response2->json(), JSON_PRETTY_PRINT);
echo "\n";
