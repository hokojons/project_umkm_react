<?php
// Test with existing user USER001
$userId = 'USER001';
$data = [
    'alamat' => 'Jl. Test Updated',
    'kota' => 'Jakarta Updated',
    'kode_pos' => '12999'
];

$ch = curl_init('http://localhost:8000/api/auth/profile');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-User-ID: ' . $userId
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: " . $statusCode . "\n";
echo "Response: " . $response . "\n";
?>