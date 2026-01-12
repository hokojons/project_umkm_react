<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create request
$data = [
    'nama_toko' => 'Toko Test Debug',
    'nama_pemilik' => 'Budi Pemilik',
    'deskripsi' => 'Alamat toko test',
    'kategori_id' => 1,
    'produk' => json_encode([
        ['name'=>'Produk1','price'=>10000,'description'=>'Desc1']
    ])
];

$request = Illuminate\Http\Request::create('/api/umkm/submit', 'POST', $data);
$request->headers->set('X-User-ID', '2');

try {
    $controller = new App\Http\Controllers\Api\UmkmController();
    $response = $controller->submit($request);
    echo "Response Status: " . $response->getStatusCode() . PHP_EOL;
    echo json_encode($response->getData(), JSON_PRETTY_PRINT);
    echo PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
    echo "File: " . $e->getFile() . ":" . $e->getLine() . PHP_EOL;
    echo "Stack Trace:" . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
