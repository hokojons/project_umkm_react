<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Testing OTP Send After Fix ===\n\n";

$phoneNumber = '6285175447460';

try {
    // Test via API call
    $ch = curl_init('http://localhost:8000/api/auth/send-otp-register');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['no_whatsapp' => $phoneNumber]),
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
    
    if ($httpCode === 200 && isset($data['success']) && $data['success']) {
        echo "\n✓ OTP sent successfully!\n";
        echo "OTP Code: " . ($data['data']['code'] ?? 'N/A') . "\n";
        echo "Phone: " . ($data['data']['phone_number'] ?? 'N/A') . "\n";
        
        // Check database
        echo "\n=== Database Check ===\n";
        $record = \Illuminate\Support\Facades\DB::table('wa_verifications')
            ->where('phone_number', $phoneNumber)
            ->orderBy('id', 'desc')
            ->first();
        
        if ($record) {
            echo "✓ Record found in database:\n";
            print_r($record);
        } else {
            echo "✗ No record found in database\n";
        }
    } else {
        echo "\n✗ Failed to send OTP\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
