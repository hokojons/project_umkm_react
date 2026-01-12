<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$product = DB::table('tproduk')->find(40);
echo "Product 40 FULL DATA:\n";
echo json_encode($product, JSON_PRETTY_PRINT);
echo "\n";
