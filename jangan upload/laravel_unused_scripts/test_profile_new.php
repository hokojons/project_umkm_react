<?php
$userId = 'USER_' . date('YmdHis'); // Gunakan user baru
$data = [
    'nama' => 'Test Profile Update',
    'email' => 'test@example.com',
    'telepon' => '081234567890',
    'alamat' => 'Jl. Test No. 123',
    'kota' => 'Jakarta',
    'kode_pos' => '12345'
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

echo "=== Test Profile Update ===\n";
echo "Status Code: " . $statusCode . "\n";
echo "User ID: " . $userId . "\n";
echo "Response: " . $response . "\n";
?>