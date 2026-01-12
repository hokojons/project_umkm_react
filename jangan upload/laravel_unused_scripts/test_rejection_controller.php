<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "=== TESTING getRejectionComments API DIRECTLY ===\n\n";

// Create a mock request
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UmkmController;

$controller = new UmkmController();

// Create request with header
$request = Request::create('/api/umkm/rejection-comments', 'GET');
$request->headers->set('X-User-ID', '13');

try {
    $response = $controller->getRejectionComments($request);
    
    echo "Response Status: " . $response->status() . "\n";
    echo "Response Content:\n";
    echo $response->getContent() . "\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
