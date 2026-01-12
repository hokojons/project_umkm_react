<?php
/**
 * TEST SCRIPT UNTUK WhatsApp 2FA
 * Jalankan di terminal: php test_otp.php
 * atau copy-paste test cases di Postman
 */

// TEST 1: Send OTP ke nomor WhatsApp (User Register)
echo "=== TEST 1: SEND OTP FOR USER REGISTER ===\n";
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'http://localhost:8000/api/auth/send-otp-register',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => '62812345678901' // Format: 62XXXXXXXXXXX
    ]),
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'Accept: application/json'
    ),
));

$response = curl_exec($curl);
echo $response . "\n\n";
$responseData = json_decode($response, true);

// Get the OTP code dari response (untuk development testing)
$otpCode = $responseData['code'] ?? null;
echo "OTP Code (dari response): " . ($otpCode ?? 'N/A') . "\n";
echo "Note: Di production, OTP ini akan di-send via WhatsApp ke nomor user\n\n";

curl_close($curl);

// TEST 2: Verify OTP
if ($otpCode) {
    echo "=== TEST 2: VERIFY OTP ===\n";
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => 'http://localhost:8000/api/auth/verify-otp-register',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode([
            'no_whatsapp' => '62812345678901',
            'code' => $otpCode
        ]),
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json',
            'Accept: application/json'
        ),
    ));

    $response = curl_exec($curl);
    echo $response . "\n\n";

    curl_close($curl);
}

// TEST 3: Send OTP untuk Business Register
echo "=== TEST 3: SEND OTP FOR BUSINESS REGISTER ===\n";
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'http://localhost:8000/api/businesses/send-otp-register',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => '62898765432101'
    ]),
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json',
        'Accept: application/json'
    ),
));

$response = curl_exec($curl);
echo $response . "\n\n";

curl_close($curl);

echo "=== TEST COMPLETE ===\n";
echo "✅ Jika semua response menunjukkan 'success: true', maka 2FA API berfungsi dengan baik!\n";
?>