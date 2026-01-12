<?php
/**
 * Test WhatsApp 2FA System (wa.me links version)
 * Gunakan nomor WhatsApp Anda sendiri
 * 
 * Usage:
 * php test_wa_2fa.php 628XXXXXXXXX  (command line)
 * php test_wa_2fa.php               (interactive prompt)
 */

$baseUrl = 'http://localhost:8000';

echo "\n";
echo "═══════════════════════════════════════════════════════════\n";
echo "  WHATSAPP 2FA SYSTEM TEST (wa.me Links Version)\n";
echo "═══════════════════════════════════════════════════════════\n\n";

// Get nomor dari command line atau interactive prompt
$testPhone = null;

if (isset($argv[1])) {
    // Dari command line argument
    $testPhone = $argv[1];
    echo "✅ Menggunakan nomor dari argument: $testPhone\n\n";
} else {
    // Interactive input
    echo "📱 Masukkan nomor WhatsApp Anda (format: 628XXXXXXXXX)\n";
    echo "   Contoh: 628175447460\n";
    echo "─────────────────────────────────────────\n";

    $handle = fopen("php://stdin", "r");
    echo "Nomor: ";
    $testPhone = trim(fgets($handle));
    fclose($handle);

    echo "\n";
}

// Validasi format
if (!preg_match('/^62[0-9]{9,12}$/', $testPhone)) {
    echo "❌ Format nomor tidak valid!\n";
    echo "   Harus format: 62XXXXXXXXX (11-14 digit)\n";
    echo "   Contoh: 628175447460\n\n";
    exit(1);
}

echo "═══════════════════════════════════════════════════════════\n\n";

// ============================================
// TEST 1: Send OTP untuk User Registration
// ============================================
echo "📱 TEST 1: Send OTP untuk User Registration\n";
echo "─────────────────────────────────────────\n";
echo "Phone: $testPhone\n";

$curl1 = curl_init();
curl_setopt_array($curl1, [
    CURLOPT_URL => "$baseUrl/api/auth/send-otp-register",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => $testPhone,
    ])
]);

$response1 = curl_exec($curl1);
$http1 = curl_getinfo($curl1, CURLINFO_HTTP_CODE);
curl_close($curl1);

$data1 = json_decode($response1, true);
$otp1 = $data1['data']['code'] ?? null;
$waLink1 = $data1['data']['wa_link'] ?? null;

echo "Status: " . ($http1 == 200 ? "✅ PASS" : "❌ FAIL") . " (HTTP $http1)\n";
echo "Response: " . json_encode($data1, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

if (!$otp1) {
    echo "❌ ERROR: OTP tidak terbuat!\n\n";
    exit(1);
}

// ============================================
// TEST 2: Verify OTP User
// ============================================
echo "📱 TEST 2: Verify OTP User\n";
echo "───────────────────────────\n";
echo "Menggunakan OTP: $otp1\n\n";

$curl2 = curl_init();
curl_setopt_array($curl2, [
    CURLOPT_URL => "$baseUrl/api/auth/verify-otp-register",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => $testPhone,
        'code' => $otp1,
    ])
]);

$response2 = curl_exec($curl2);
$http2 = curl_getinfo($curl2, CURLINFO_HTTP_CODE);
curl_close($curl2);

$data2 = json_decode($response2, true);

echo "Status: " . ($http2 == 200 ? "✅ PASS" : "❌ FAIL") . " (HTTP $http2)\n";
echo "Response: " . json_encode($data2, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// TEST 3: Send OTP untuk Business Registration
// ============================================
echo "🏪 TEST 3: Send OTP untuk Business Registration\n";
echo "────────────────────────────────────────────────\n";

// Generate different phone untuk business test
$testPhoneBusiness = substr($testPhone, 0, -1) . (((int) substr($testPhone, -1)) + 1);
if (strlen($testPhoneBusiness) > 14) {
    $testPhoneBusiness = substr($testPhone, 0, -3) . '001';
}

echo "Phone: $testPhoneBusiness\n";

$curl3 = curl_init();
curl_setopt_array($curl3, [
    CURLOPT_URL => "$baseUrl/api/businesses/send-otp-register",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => $testPhoneBusiness,
    ])
]);

$response3 = curl_exec($curl3);
$http3 = curl_getinfo($curl3, CURLINFO_HTTP_CODE);
curl_close($curl3);

$data3 = json_decode($response3, true);
$otp3 = $data3['data']['code'] ?? null;
$waLink3 = $data3['data']['wa_link'] ?? null;

echo "Status: " . ($http3 == 200 ? "✅ PASS" : "❌ FAIL") . " (HTTP $http3)\n";
echo "Response: " . json_encode($data3, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

// ============================================
// TEST 4: Verify OTP Business
// ============================================
echo "🏪 TEST 4: Verify OTP Business\n";
echo "───────────────────────────────\n";
echo "Menggunakan OTP: $otp3\n\n";

$curl4 = curl_init();
curl_setopt_array($curl4, [
    CURLOPT_URL => "$baseUrl/api/businesses/verify-otp-register",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'no_whatsapp' => $testPhoneBusiness,
        'code' => $otp3,
    ])
]);

$response4 = curl_exec($curl4);
$http4 = curl_getinfo($curl4, CURLINFO_HTTP_CODE);
curl_close($curl4);

$data4 = json_decode($response4, true);

echo "Status: " . ($http4 == 200 ? "✅ PASS" : "❌ FAIL") . " (HTTP $http4)\n";
echo "Response: " . json_encode($data4, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// SUMMARY
// ============================================
echo "═══════════════════════════════════════════════════════════\n";
echo "  📊 SUMMARY\n";
echo "═══════════════════════════════════════════════════════════\n";

$allPass = ($http1 == 200) && ($http2 == 200) && ($http3 == 200) && ($http4 == 200);

echo "\nTest 1 (User OTP Generate):     " . ($http1 == 200 ? "✅ PASS" : "❌ FAIL") . "\n";
echo "Test 2 (User OTP Verify):       " . ($http2 == 200 ? "✅ PASS" : "❌ FAIL") . "\n";
echo "Test 3 (Business OTP Generate): " . ($http3 == 200 ? "✅ PASS" : "❌ FAIL") . "\n";
echo "Test 4 (Business OTP Verify):   " . ($http4 == 200 ? "✅ PASS" : "❌ FAIL") . "\n";

echo "\n" . ($allPass ? "✅ ALL TESTS PASSED! ✅" : "❌ SOME TESTS FAILED") . "\n\n";

// Show wa.me links untuk reference
if ($waLink1) {
    echo "📌 User OTP wa.me link:\n";
    echo "   $waLink1\n\n";
}

if ($waLink3) {
    echo "📌 Business OTP wa.me link:\n";
    echo "   $waLink3\n\n";
}

echo "═══════════════════════════════════════════════════════════\n";
?>