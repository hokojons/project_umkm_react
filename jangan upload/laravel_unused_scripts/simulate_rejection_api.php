<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

echo "=== SIMULATING API REQUEST ===\n\n";

// Create a mock request
$request = Request::create('/api/umkm/rejection-comments', 'GET');
$request->headers->set('X-User-ID', '13');

echo "Request Headers:\n";
echo "  X-User-ID: " . $request->header('X-User-ID') . "\n\n";

// Call the controller method
$controller = new UmkmController();

try {
    $response = $controller->getRejectionComments($request);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Content:\n";
    echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT);
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
