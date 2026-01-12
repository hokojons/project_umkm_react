@<?php

echo "=== TEST EVENT REGISTRATION ===\n\n";

$ch = curl_init('http://localhost:8000/api/events/register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'event_id' => 'E001',
    'name' => 'Andi Wijaya',
    'email' => 'andi@example.com',
    'phone' => '081234567999',
    'organization' => 'UMKM Sejahtera',
    'notes' => 'Ingin ikut event'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);
$response = curl_exec($ch);
echo json_encode(json_decode($response), JSON_PRETTY_PRINT) . PHP_EOL;
curl_close($ch);
