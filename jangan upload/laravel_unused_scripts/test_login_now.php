<?php

$data = [
    'credential' => 'admin@umkm.com',
    'password' => 'password'
];

$ch = curl_init('http://localhost:8000/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "\n=== TESTING LOGIN WITH ADMIN ===\n\n";
echo "Email: admin@umkm.com\n";
echo "Password: password\n";
echo "HTTP Code: $httpCode\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT);
echo "\n\n";

// Test with customer
$data2 = [
    'credential' => 'andi@customer.com',
    'password' => 'password'
];

$ch2 = curl_init('http://localhost:8000/api/auth/login');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($data2));
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "=== TESTING LOGIN WITH CUSTOMER ===\n\n";
echo "Email: andi@customer.com\n";
echo "Password: password\n";
echo "HTTP Code: $httpCode2\n";
echo "Response:\n";
echo json_encode(json_decode($response2), JSON_PRETTY_PRINT);
echo "\n\n";
