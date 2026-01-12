<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pkg = DB::table('tproduk')->where('id', 35)->first();

echo "Package ID: 35\n";
echo "Name: {$pkg->nama_produk}\n";
echo "Full description:\n";
echo "================\n";
echo $pkg->deskripsi;
echo "\n================\n";
