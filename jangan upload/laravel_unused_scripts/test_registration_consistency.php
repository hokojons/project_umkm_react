<?php
// Test untuk memastikan registrasi konsisten
echo "=== Testing Registrasi Consistency ===\n\n";

$testRuns = 3;
$successCount = 0;
$failCount = 0;

for ($i = 1; $i <= $testRuns; $i++) {
    echo "Test Run #$i:\n";

    // Generate unique email
    $timestamp = time() + $i;
    $email = "testuser_$timestamp@example.com";
    $phone = "628" . str_pad($i, 9, '0', STR_PAD_LEFT);

    // Step 1: Send OTP
    $ch = curl_init('http://localhost:8000/api/auth/send-otp-register');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['no_whatsapp' => $phone]));

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($statusCode !== 200) {
        echo "  ❌ Failed to send OTP (status: $statusCode)\n";
        $failCount++;
        continue;
    }

    $otpData = json_decode($response, true);
    $otpCode = $otpData['data']['code'];
    echo "  OTP Code: $otpCode\n";

    // Step 2: Verify OTP and Register
    $registrationData = [
        'no_whatsapp' => $phone,
        'code' => $otpCode,
        'email' => $email,
        'nama' => "Test User $i",
        'password' => 'password123',
        'type' => 'user'
    ];

    $ch = curl_init('http://localhost:8000/api/auth/verify-otp-register');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($registrationData));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($statusCode === 201) {
        $data = json_decode($response, true);
        echo "  ✅ Registration SUCCESS\n";
        echo "     User ID: {$data['data']['id']}\n";
        echo "     Email: {$data['data']['email']}\n";

        // Step 3: Verify user can login
        sleep(1);
        $ch = curl_init('http://localhost:8000/api/auth/login');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'password' => 'password123'
        ]));

        $loginResponse = curl_exec($ch);
        $loginStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($loginStatus === 200) {
            echo "  ✅ Login verification SUCCESS\n";
            $successCount++;
        } else {
            echo "  ❌ Login verification FAILED (status: $loginStatus)\n";
            echo "     Response: $loginResponse\n";
            $failCount++;
        }
    } else {
        echo "  ❌ Registration FAILED (status: $statusCode)\n";
        echo "     Response: $response\n";
        $failCount++;
    }

    echo "\n";
    sleep(1);
}

echo "=== SUMMARY ===\n";
echo "Total Tests: $testRuns\n";
echo "Success: $successCount ✅\n";
echo "Failed: $failCount ❌\n";
echo "Success Rate: " . round(($successCount / $testRuns) * 100, 2) . "%\n";

if ($successCount === $testRuns) {
    echo "\n🎉 All tests passed! Registration is now consistent.\n";
} else {
    echo "\n⚠️ Some tests failed. Check logs for details.\n";
}
?>