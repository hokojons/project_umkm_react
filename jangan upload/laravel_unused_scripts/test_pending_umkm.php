<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = new App\Http\Controllers\Api\UmkmApiController();
    $response = $controller->pending();
    echo "Response Status: " . $response->getStatusCode() . PHP_EOL;
    echo json_encode($response->getData(), JSON_PRETTY_PRINT);
    echo PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
    echo "File: " . $e->getFile() . ":" . $e->getLine() . PHP_EOL;
    echo "Stack Trace:" . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
