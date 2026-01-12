<?php

echo "\n=== TESTING API ENDPOINTS ===\n\n";

// Test /api/events
echo "1. Testing /api/events\n";
$ch = curl_init('http://localhost:8000/api/events');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($httpCode == 200) {
    $data = json_decode($response, true);
    echo "   ✓ Success! Found " . count($data['data']) . " events\n";
} else {
    echo "   ✗ Error: " . substr($response, 0, 200) . "\n";
}

echo "\n2. Testing /api/umkm\n";
$ch2 = curl_init('http://localhost:8000/api/umkm');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "   HTTP Code: $httpCode2\n";
if ($httpCode2 == 200) {
    $data2 = json_decode($response2, true);
    echo "   ✓ Success! Found " . count($data2['data']) . " UMKM\n";
} else {
    echo "   ✗ Error: " . substr($response2, 0, 200) . "\n";
}

echo "\n";
