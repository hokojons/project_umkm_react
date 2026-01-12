<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

DB::table('tproduk')->where('id', 40)->update([
    'approval_status' => 'rejected',
    'status' => 'inactive'
]);

echo "Product 40 set to rejected\n";

$product = DB::table('tproduk')->find(40);
echo "Current status: approval_status={$product->approval_status}, status={$product->status}\n";
