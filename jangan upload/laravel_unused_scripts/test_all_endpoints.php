<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║         TEST ALL API ENDPOINTS - FRONTEND ↔ BACKEND         ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$baseUrl = 'http://localhost:8000';
$results = ['passed' => 0, 'failed' => 0];

function testEndpoint($name, $url, $method = 'GET', $data = null, $headers = []) {
    global $baseUrl, $results;
    
    echo "Testing: $name\n";
    
    $ch = curl_init($baseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $defaultHeaders = ['Accept: application/json'];
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $defaultHeaders[] = 'Content-Type: application/json';
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $success = $httpCode >= 200 && $httpCode < 300;
    if ($success) {
        echo "  ✅ SUCCESS - HTTP $httpCode\n";
        $results['passed']++;
    } else {
        echo "  ❌ FAILED - HTTP $httpCode\n";
        echo "  Response: " . substr($response, 0, 200) . "\n";
        $results['failed']++;
    }
    
    $decoded = json_decode($response, true);
    if ($decoded && isset($decoded['data'])) {
        return $decoded['data'];
    }
    return $decoded;
}

echo "═══════════════════════════════════════════════════════════════\n";
echo "1. AUTHENTICATION ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

$adminData = testEndpoint(
    'POST /api/auth/login (Admin)',
    '/api/auth/login',
    'POST',
    ['email' => 'admin', 'password' => 'admin123']
);

$userData = testEndpoint(
    'POST /api/auth/login (User: budi)',
    '/api/auth/login',
    'POST',
    ['email' => 'budi', 'password' => 'budi123']
);

if ($userData && isset($userData['id'])) {
    testEndpoint(
        'GET /api/auth/profile',
        '/api/auth/profile',
        'GET',
        null,
        ['X-User-ID: ' . $userData['id']]
    );
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "2. UMKM ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

testEndpoint('GET /api/umkm (Homepage - List all active UMKM)', '/api/umkm');

if ($userData && isset($userData['id'])) {
    testEndpoint(
        'GET /api/umkm/my-umkm (User dashboard)',
        '/api/umkm/my-umkm',
        'GET',
        null,
        ['X-User-ID: ' . $userData['id']]
    );
}

if ($adminData && isset($adminData['id'])) {
    testEndpoint(
        'GET /api/umkm/pending (Admin panel)',
        '/api/umkm/pending',
        'GET',
        null,
        ['X-User-ID: ' . $adminData['id']]
    );
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "3. PRODUCT ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

if ($adminData && isset($adminData['id'])) {
    testEndpoint(
        'GET /api/products/pending (Admin panel)',
        '/api/products/pending',
        'GET',
        null,
        ['X-User-ID: ' . $adminData['id']]
    );
}

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "4. CATEGORY ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

testEndpoint('GET /api/categories', '/api/categories');

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "5. GIFT PACKAGE ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

testEndpoint('GET /api/gift-packages', '/api/gift-packages');

echo "\n═══════════════════════════════════════════════════════════════\n";
echo "6. EVENT ENDPOINTS\n";
echo "═══════════════════════════════════════════════════════════════\n";

testEndpoint('GET /api/events', '/api/events');

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║                        TEST SUMMARY                          ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";
printf("║  ✅ Passed:  %-3d                                           ║\n", $results['passed']);
printf("║  ❌ Failed:  %-3d                                           ║\n", $results['failed']);
echo "╠══════════════════════════════════════════════════════════════╣\n";

if ($results['failed'] == 0) {
    echo "║  🎉 ALL ENDPOINTS WORKING! Frontend ↔ Backend Connected!  ║\n";
} else {
    echo "║  ⚠️  Some endpoints need attention                         ║\n";
}

echo "╚══════════════════════════════════════════════════════════════╝\n";
