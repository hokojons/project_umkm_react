<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Tumkm;
use App\Models\User;

echo "=== Checking Pending UMKM Submissions ===\n\n";

try {
    $pending = Tumkm::with('user')->where('status', 'pending')->get();
    
    echo "Total pending UMKM: " . $pending->count() . "\n\n";
    
    foreach ($pending as $u) {
        echo "ID: {$u->id}\n";
        echo "  Nama Toko: {$u->nama_toko}\n";
        echo "  Pemilik: {$u->nama_pemilik}\n";
        echo "  User ID: {$u->user_id}\n";
        echo "  User Email: " . ($u->user->email ?? 'N/A') . "\n";
        echo "  Status: {$u->status}\n";
        echo "  Created: {$u->created_at}\n\n";
    }
    
    // Test API call
    echo "=== Testing API Call ===\n";
    $ch = curl_init('http://localhost:8000/api/umkm/pending');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Status: $httpCode\n";
    $data = json_decode($response, true);
    
    if ($data && isset($data['data'])) {
        echo "API returned " . count($data['data']) . " pending UMKM\n";
        
        if (count($data['data']) > 0) {
            echo "\nFirst entry:\n";
            print_r($data['data'][0]);
        }
    } else {
        echo "API Response:\n";
        print_r($data);
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
