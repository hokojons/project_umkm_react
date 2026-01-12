<?php
// Test complete registration flow

echo "=== Testing Registration Flow ===\n\n";

// Step 1: Send OTP
echo "Step 1: Sending OTP request...\n";
$phoneNumber = '6281234567890'; // Format: 62 + nomor tanpa 0

$ch = curl_init('http://localhost:8000/api/auth/send-otp-register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'no_whatsapp' => $phoneNumber,
    'type' => 'user'
]));

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: " . $statusCode . "\n";
echo "Response: " . $response . "\n\n";

$otpData = json_decode($response, true);

if (!$otpData['success']) {
    echo "Failed to send OTP. Stopping.\n";
    exit;
}

$otpCode = $otpData['data']['code'];
echo "OTP Code received: " . $otpCode . "\n\n";

// Step 2: Verify OTP and Register
echo "Step 2: Verifying OTP and creating account...\n";

$registrationData = [
    'no_whatsapp' => $phoneNumber,
    'code' => $otpCode,
    'email' => 'newuser_' . time() . '@example.com',
    'nama' => 'New Test User',
    'password' => 'password123',
    'type' => 'user'
];

echo "Registration data: " . json_encode($registrationData, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init('http://localhost:8000/api/auth/verify-otp-register');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($registrationData));

$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: " . $statusCode . "\n";
echo "Response: " . $response . "\n\n";

$verifyData = json_decode($response, true);

if ($verifyData['success']) {
    echo "✓ Registration successful!\n";
    echo "User ID: " . $verifyData['data']['id'] . "\n";
    echo "Email: " . $verifyData['data']['email'] . "\n";
    echo "Name: " . $verifyData['data']['nama'] . "\n\n";

    // Step 3: Test login with new account
    echo "Step 3: Testing login with new account...\n";

    $ch = curl_init('http://localhost:8000/api/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => $registrationData['email'],
        'password' => $registrationData['password']
    ]));

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Login Status Code: " . $statusCode . "\n";
    echo "Login Response: " . $response . "\n";

    if ($statusCode == 200) {
        echo "\n✓ Login successful! Registration flow is working perfectly.\n";
    } else {
        echo "\n✗ Login failed. Check password hashing.\n";
    }
} else {
    echo "✗ Registration failed.\n";
}
?>