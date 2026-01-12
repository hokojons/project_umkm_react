<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\RoleRequest;

echo "=== Testing Role Upgrade Request ===\n\n";

try {
    // Find a test user
    $user = User::where('role', 'customer')->first();
    
    if (!$user) {
        echo "Creating test user...\n";
        $user = User::create([
            'nama_lengkap' => 'Test Customer',
            'email' => 'test.customer@example.com',
            'no_telepon' => '6281234567890',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'status' => 'active',
        ]);
    }
    
    echo "Using user:\n";
    echo "  ID: {$user->id}\n";
    echo "  Name: {$user->nama_lengkap}\n";
    echo "  Role: {$user->role}\n\n";
    
    // Test via API
    $ch = curl_init('http://localhost:8000/api/role-upgrade');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'user_id' => $user->id,
            'reason' => 'Testing role upgrade request'
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Status: $httpCode\n";
    echo "Response:\n";
    $data = json_decode($response, true);
    print_r($data);
    
    if ($httpCode === 201 && isset($data['success']) && $data['success']) {
        echo "\n✓ Role upgrade request created successfully!\n\n";
        
        // Check database
        echo "=== Database Check ===\n";
        $request = RoleRequest::where('user_id', $user->id)->latest()->first();
        
        if ($request) {
            echo "✓ Request found in database:\n";
            echo "  ID: {$request->id}\n";
            echo "  User ID: {$request->user_id}\n";
            echo "  Nama Pemilik: {$request->nama_pemilik}\n";
            echo "  Nama Toko: {$request->nama_toko}\n";
            echo "  Status: {$request->status_pengajuan}\n";
            echo "  Alasan: {$request->alasan_pengajuan}\n";
        } else {
            echo "✗ No request found in database\n";
        }
    } else {
        echo "\n✗ Failed to create role upgrade request\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
